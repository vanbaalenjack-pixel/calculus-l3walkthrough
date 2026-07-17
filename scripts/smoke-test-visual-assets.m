#import <AppKit/AppKit.h>
#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>

static NSString *VisualAuditJSONString(id value) {
  if (value == nil || ![NSJSONSerialization isValidJSONObject:value]) {
    return value == nil ? @"null" : [value description];
  }
  NSError *error = nil;
  NSData *data = [NSJSONSerialization dataWithJSONObject:value options:0 error:&error];
  if (data == nil) {
    return error.localizedDescription ?: [value description];
  }
  return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
}

static NSArray<NSString *> *VisualAuditLogicalRoutes(NSURL *rootURL, NSError **error) {
  NSNumber *isDirectory = nil;
  if (![rootURL getResourceValue:&isDirectory
                          forKey:NSURLIsDirectoryKey
                           error:error]
      || !isDirectory.boolValue) {
    if (error != NULL && *error == nil) {
      *error = [NSError errorWithDomain:@"VisualAssetAudit"
                                   code:1
                               userInfo:@{
                                 NSLocalizedDescriptionKey:
                                     @"The site root is not a readable directory."
                               }];
    }
    return nil;
  }

  NSURL *indexURL = [rootURL URLByAppendingPathComponent:@"index.html"];
  NSError *readError = nil;
  NSString *indexSource = [NSString stringWithContentsOfURL:indexURL
                                                   encoding:NSUTF8StringEncoding
                                                      error:&readError];
  if (indexSource == nil) {
    if (error != NULL) {
      *error = readError;
    }
    return nil;
  }

  NSRegularExpression *expression = [NSRegularExpression
      regularExpressionWithPattern:@"href\\s*=\\s*[\\\"']([^\\\"']+)[\\\"']"
                           options:NSRegularExpressionCaseInsensitive
                             error:error];
  if (expression == nil) {
    return nil;
  }

  NSURL *syntheticIndex = [NSURL URLWithString:@"https://visual-audit.invalid/index.html"];
  NSMutableOrderedSet<NSString *> *logicalRoutes = [NSMutableOrderedSet orderedSet];

  __block NSError *enumerationFailure = nil;
  NSDirectoryEnumerator<NSURL *> *htmlFiles = [[NSFileManager defaultManager]
      enumeratorAtURL:rootURL
      includingPropertiesForKeys:@[ NSURLIsRegularFileKey ]
      options:(NSDirectoryEnumerationSkipsHiddenFiles
               | NSDirectoryEnumerationSkipsPackageDescendants)
      errorHandler:^BOOL(NSURL *__unused url, NSError *fileError) {
        enumerationFailure = fileError;
        return NO;
      }];
  NSString *rootPath = rootURL.URLByStandardizingPath.path;
  for (NSURL *fileURL in htmlFiles) {
    NSNumber *isRegularFile = nil;
    if (![fileURL getResourceValue:&isRegularFile
                            forKey:NSURLIsRegularFileKey
                             error:&enumerationFailure]) {
      break;
    }
    if (!isRegularFile.boolValue
        || ![fileURL.pathExtension.lowercaseString isEqualToString:@"html"]) {
      continue;
    }

    NSString *filePath = fileURL.URLByStandardizingPath.path;
    if (![filePath hasPrefix:[rootPath stringByAppendingString:@"/"]]) {
      continue;
    }
    NSString *relativePath = [filePath substringFromIndex:rootPath.length + 1];
    NSString *route = [relativePath
        stringByAddingPercentEncodingWithAllowedCharacters:NSCharacterSet.URLPathAllowedCharacterSet];
    [logicalRoutes addObject:route];
  }
  if (enumerationFailure != nil) {
    if (error != NULL) {
      *error = enumerationFailure;
    }
    return nil;
  }
  NSArray<NSTextCheckingResult *> *matches = [expression
      matchesInString:indexSource
               options:0
                 range:NSMakeRange(0, indexSource.length)];
  for (NSTextCheckingResult *match in matches) {
    if (match.numberOfRanges < 2) {
      continue;
    }
    NSString *href = [indexSource substringWithRange:[match rangeAtIndex:1]];
    href = [href stringByReplacingOccurrencesOfString:@"&amp;" withString:@"&"];
    NSString *lower = href.lowercaseString;
    if (href.length == 0
        || [href hasPrefix:@"#"]
        || [lower hasPrefix:@"http:"]
        || [lower hasPrefix:@"https:"]
        || [lower hasPrefix:@"mailto:"]
        || [lower hasPrefix:@"tel:"]
        || [lower hasPrefix:@"javascript:"]
        || [lower hasPrefix:@"data:"]
        || [href hasPrefix:@"//"]) {
      continue;
    }

    NSURL *resolved = [[NSURL URLWithString:href relativeToURL:syntheticIndex] absoluteURL];
    if (resolved == nil
        || ![resolved.host isEqualToString:syntheticIndex.host]
        || ![resolved.pathExtension.lowercaseString isEqualToString:@"html"]
        || ![resolved.path hasPrefix:@"/"]) {
      continue;
    }

    NSURLComponents *components = [NSURLComponents componentsWithURL:resolved
                                              resolvingAgainstBaseURL:NO];
    components.fragment = nil;
    NSString *route = [components.path substringFromIndex:1];
    if (components.percentEncodedQuery.length > 0) {
      route = [route stringByAppendingFormat:@"?%@", components.percentEncodedQuery];
    }
    [logicalRoutes addObject:route];
  }

  return [logicalRoutes.array sortedArrayUsingSelector:@selector(localizedStandardCompare:)];
}

@interface VisualAssetSmokeRunner : NSObject <WKNavigationDelegate>
@property(nonatomic, strong) NSURL *baseURL;
@property(nonatomic, strong) WKWebView *webView;
@property(nonatomic, strong) NSArray<NSString *> *routes;
@property(nonatomic, strong) NSMutableArray<NSDictionary *> *tests;
@property(nonatomic, strong) NSMutableOrderedSet<NSString *> *visualRoutes;
@property(nonatomic, strong) NSMutableArray<NSString *> *failures;
@property(nonatomic, strong) NSMutableArray<NSString *> *notices;
@property(nonatomic, strong) NSMutableDictionary<NSString *, NSNumber *> *issueTotals;
@property(nonatomic, copy) NSString *checkerSource;
@property(nonatomic) NSUInteger currentIndex;
@property(nonatomic) NSUInteger passedCount;
@property(nonatomic) NSUInteger completedCount;
@property(nonatomic) NSUInteger caseToken;
@property(nonatomic) BOOL evaluating;
@property(nonatomic) BOOL caseActive;
@property(nonatomic) BOOL responsiveScheduled;
@end

@implementation VisualAssetSmokeRunner

- (instancetype)initWithBaseURL:(NSURL *)baseURL
                          routes:(NSArray<NSString *> *)routes
                   checkerSource:(NSString *)checkerSource {
  self = [super init];
  if (self == nil) {
    return nil;
  }

  _baseURL = baseURL;
  _routes = routes;
  _checkerSource = [checkerSource copy];
  _tests = [NSMutableArray array];
  _visualRoutes = [NSMutableOrderedSet orderedSet];
  _failures = [NSMutableArray array];
  _notices = [NSMutableArray array];
  _issueTotals = [NSMutableDictionary dictionary];
  _currentIndex = 0;
  _passedCount = 0;
  _completedCount = 0;
  _caseToken = 0;
  _evaluating = NO;
  _caseActive = NO;
  _responsiveScheduled = NO;

  for (NSString *route in routes) {
    [_tests addObject:@{
      @"route": route,
      @"phase": @"desktop",
      @"width": @1280,
      @"height": @900
    }];
  }

  WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];
  configuration.websiteDataStore = [WKWebsiteDataStore nonPersistentDataStore];
  configuration.preferences.javaScriptCanOpenWindowsAutomatically = NO;

  NSString *captureSource =
      @"window.__visualAssetAuditErrors=[];"
       "window.__visualAssetAuditWarnings=[];"
       "(function(){"
       "function text(value){try{return typeof value==='string'?value:JSON.stringify(value);"
       "}catch(error){return String(value);}}"
       "function record(bucket,kind,message,url){"
       "var item={kind:kind,message:String(message||kind),url:String(url||'')};"
       "var key=item.kind+'|'+item.message+'|'+item.url;"
       "if(!bucket.some(function(entry){return entry.__key===key;})){"
       "item.__key=key;bucket.push(item);}}"
       "window.addEventListener('error',function(event){"
       "var target=event.target||{};"
       "var resource=target.currentSrc||target.src||target.href||'';"
       "var tag=target.tagName?target.tagName.toLowerCase():'';"
       "var kind=resource?'resource-error':'javascript-error';"
       "var message=event.message||(resource?('Failed to load '+tag+' resource'):'Window error');"
       "record(window.__visualAssetAuditErrors,kind,message,resource||event.filename||'');"
       "},true);"
       "window.addEventListener('unhandledrejection',function(event){"
       "record(window.__visualAssetAuditErrors,'unhandled-rejection',text(event.reason||'Unhandled rejection'),'');"
       "});"
       "['error','warn'].forEach(function(level){"
       "var original=console[level];"
       "console[level]=function(){"
       "var values=Array.prototype.map.call(arguments,text);"
       "record(level==='error'?window.__visualAssetAuditErrors:window.__visualAssetAuditWarnings,"
       "'console-'+level,values.join(' '),'');"
       "return original.apply(console,arguments);};"
       "});"
       "}());";
  WKUserScript *captureScript = [[WKUserScript alloc]
      initWithSource:captureSource
       injectionTime:WKUserScriptInjectionTimeAtDocumentStart
    forMainFrameOnly:YES];
  [configuration.userContentController addUserScript:captureScript];

  _webView = [[WKWebView alloc] initWithFrame:NSZeroRect configuration:configuration];
  _webView.navigationDelegate = self;
  return self;
}

- (void)start {
  printf("Visual asset browser audit: discovered %lu logical HTML routes from physical files and index navigation.\n",
         (unsigned long)self.routes.count);
  [self runNext];
}

- (void)scheduleResponsiveCasesIfNeeded {
  if (self.responsiveScheduled) {
    return;
  }
  self.responsiveScheduled = YES;

  for (NSString *route in self.visualRoutes) {
    [self.tests addObject:@{
      @"route": route,
      @"phase": @"dark-desktop",
      @"width": @1280,
      @"height": @900
    }];
    [self.tests addObject:@{
      @"route": route,
      @"phase": @"mobile-360",
      @"width": @360,
      @"height": @800
    }];
    [self.tests addObject:@{
      @"route": route,
      @"phase": @"tablet-768",
      @"width": @768,
      @"height": @1024
    }];
  }

  printf("Desktop pass complete: %lu visual-bearing routes; scheduling %lu dark/responsive cases.\n",
         (unsigned long)self.visualRoutes.count,
         (unsigned long)(self.visualRoutes.count * 3));
}

- (void)finishAudit {
  printf("\nVisual asset browser audit summary\n");
  printf("Logical HTML routes: %lu\n", (unsigned long)self.routes.count);
  printf("Visual-bearing routes: %lu\n", (unsigned long)self.visualRoutes.count);
  printf("Browser cases: %lu\n", (unsigned long)self.completedCount);
  printf("Passed cases: %lu\n", (unsigned long)self.passedCount);
  printf("Failed cases: %lu\n", (unsigned long)self.failures.count);
  printf("Console warning notices: %lu\n", (unsigned long)self.notices.count);

  if (self.issueTotals.count > 0) {
    printf("Issue totals: %s\n", VisualAuditJSONString(self.issueTotals).UTF8String);
  }
  if (self.notices.count > 0) {
    printf("Notices:\n");
    for (NSString *notice in self.notices) {
      printf("- %s\n", notice.UTF8String);
    }
  }
  if (self.failures.count > 0) {
    printf("Failures:\n");
    for (NSString *failure in self.failures) {
      printf("- %s\n", failure.UTF8String);
    }
    exit(1);
  }

  [NSApp terminate:nil];
}

- (void)runNext {
  if (self.currentIndex >= self.tests.count) {
    if (!self.responsiveScheduled) {
      [self scheduleResponsiveCasesIfNeeded];
      if (self.currentIndex < self.tests.count) {
        [self runNext];
        return;
      }
    }
    [self finishAudit];
    return;
  }

  NSDictionary *test = self.tests[self.currentIndex];
  self.caseToken += 1;
  NSUInteger token = self.caseToken;
  self.evaluating = NO;
  self.caseActive = YES;
  self.webView.frame = NSMakeRect(
      0, 0, [test[@"width"] doubleValue], [test[@"height"] doubleValue]);
  self.webView.appearance = [NSAppearance appearanceNamed:
      [test[@"phase"] isEqualToString:@"dark-desktop"]
          ? NSAppearanceNameDarkAqua
          : NSAppearanceNameAqua];

  NSURL *url = [NSURL URLWithString:test[@"route"] relativeToURL:self.baseURL];
  printf("RUN %-10s %s\n", [test[@"phase"] UTF8String], [test[@"route"] UTF8String]);
  [self.webView loadRequest:[NSURLRequest requestWithURL:url
                                             cachePolicy:NSURLRequestReloadIgnoringLocalCacheData
                                         timeoutInterval:12.0]];

  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(15.0 * NSEC_PER_SEC)),
                 dispatch_get_main_queue(), ^{
    if (self.caseActive && self.caseToken == token) {
      [self.webView stopLoading];
      [self finishCurrentWithFailure:self.evaluating
          ? @"browser inspection timed out"
          : @"navigation timed out before didFinish"];
    }
  });
}

- (void)webView:(WKWebView *)webView
    decidePolicyForNavigationResponse:(WKNavigationResponse *)navigationResponse
                     decisionHandler:(void (^)(WKNavigationResponsePolicy))decisionHandler {
  NSURLResponse *response = navigationResponse.response;
  if (navigationResponse.isForMainFrame
      && [response isKindOfClass:[NSHTTPURLResponse class]]) {
    NSInteger status = [(NSHTTPURLResponse *)response statusCode];
    if (status >= 400) {
      decisionHandler(WKNavigationResponsePolicyCancel);
      [self finishCurrentWithFailure:
          [NSString stringWithFormat:@"HTTP %ld for %@", (long)status,
                                     response.URL.absoluteString]];
      return;
    }
  }
  decisionHandler(WKNavigationResponsePolicyAllow);
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
  if (!self.caseActive || self.evaluating) {
    return;
  }
  self.evaluating = YES;
  NSUInteger token = self.caseToken;

  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15 * NSEC_PER_SEC)),
                 dispatch_get_main_queue(), ^{
    if (!self.caseActive || self.caseToken != token) {
      return;
    }
    [self prepareCurrentTestWithToken:token];
  });
}

- (void)webView:(WKWebView *)webView
    didFailNavigation:(WKNavigation *)navigation
            withError:(NSError *)error {
  [self finishCurrentWithFailure:
      [NSString stringWithFormat:@"navigation failed: %@", error.localizedDescription]];
}

- (void)webView:(WKWebView *)webView
    didFailProvisionalNavigation:(WKNavigation *)navigation
                       withError:(NSError *)error {
  [self finishCurrentWithFailure:
      [NSString stringWithFormat:@"provisional navigation failed: %@",
                                 error.localizedDescription]];
}

- (void)prepareCurrentTestWithToken:(NSUInteger)token {
  NSString *source = [self.checkerSource
      stringByAppendingString:@"\nwindow.prepareVisualAssetAudit();"];
  [self.webView evaluateJavaScript:source completionHandler:^(id __unused result, NSError *error) {
    if (!self.caseActive || self.caseToken != token) {
      return;
    }
    if (error != nil) {
      [self finishCurrentWithFailure:
          [NSString stringWithFormat:@"preparation JavaScript failed: %@",
                                     error.localizedDescription]];
      return;
    }

    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.4 * NSEC_PER_SEC)),
                   dispatch_get_main_queue(), ^{
      if (self.caseActive && self.caseToken == token) {
        [self evaluateCurrentTestWithToken:token];
      }
    });
  }];
}

- (void)evaluateCurrentTestWithToken:(NSUInteger)token {
  NSDictionary *test = self.tests[self.currentIndex];
  NSString *invocation = [NSString stringWithFormat:
      @"\nwindow.runVisualAssetAudit(\"%@\", %ld);",
      test[@"phase"], (long)[test[@"width"] integerValue]];
  NSString *source = [self.checkerSource stringByAppendingString:invocation];

  [self.webView evaluateJavaScript:source completionHandler:^(id result, NSError *error) {
    if (!self.caseActive || self.caseToken != token) {
      return;
    }
    if (error != nil) {
      [self finishCurrentWithFailure:
          [NSString stringWithFormat:@"inspection JavaScript failed: %@",
                                     error.localizedDescription]];
      return;
    }
    if (![result isKindOfClass:[NSString class]]) {
      [self finishCurrentWithFailure:@"browser inspection did not return JSON"];
      return;
    }

    NSData *data = [(NSString *)result dataUsingEncoding:NSUTF8StringEncoding];
    NSError *jsonError = nil;
    id decoded = [NSJSONSerialization JSONObjectWithData:data options:0 error:&jsonError];
    if (![decoded isKindOfClass:[NSDictionary class]]) {
      [self finishCurrentWithFailure:
          [NSString stringWithFormat:@"invalid inspection JSON: %@",
                                     jsonError.localizedDescription ?: @"not an object"]];
      return;
    }
    [self processPayload:(NSDictionary *)decoded forTest:test];
  }];
}

- (void)addIssueTotalsFromPayload:(NSDictionary *)payload {
  NSDictionary *counts = payload[@"issueCounts"];
  if (![counts isKindOfClass:[NSDictionary class]]) {
    return;
  }
  for (NSString *key in counts) {
    NSNumber *value = counts[key];
    if (![value isKindOfClass:[NSNumber class]] || value.integerValue == 0) {
      continue;
    }
    NSInteger total = [self.issueTotals[key] integerValue] + value.integerValue;
    self.issueTotals[key] = @(total);
  }
}

- (void)processPayload:(NSDictionary *)payload forTest:(NSDictionary *)test {
  NSArray *failedChecks = payload[@"failedChecks"];
  NSArray *errors = payload[@"errors"];
  NSArray *warnings = payload[@"warnings"];
  NSNumber *visualCount = payload[@"visualCount"];
  if (![failedChecks isKindOfClass:[NSArray class]]
      || ![errors isKindOfClass:[NSArray class]]
      || ![warnings isKindOfClass:[NSArray class]]
      || ![visualCount isKindOfClass:[NSNumber class]]) {
    [self finishCurrentWithFailure:@"inspection JSON omitted required result fields"];
    return;
  }

  if ([test[@"phase"] isEqualToString:@"desktop"] && visualCount.integerValue > 0) {
    [self.visualRoutes addObject:test[@"route"]];
  }
  [self addIssueTotalsFromPayload:payload];

  if (warnings.count > 0) {
    NSString *notice = [NSString stringWithFormat:@"%@ %@: %@",
        test[@"phase"], test[@"route"], VisualAuditJSONString(warnings)];
    [self.notices addObject:notice];
    printf("WARN %-10s %s %s\n", [test[@"phase"] UTF8String],
           [test[@"route"] UTF8String], VisualAuditJSONString(warnings).UTF8String);
  }

  if (failedChecks.count == 0 && errors.count == 0) {
    NSDictionary *summary = payload[@"visualSummary"];
    printf("PASS %-10s %s visuals=%ld %s\n",
           [test[@"phase"] UTF8String], [test[@"route"] UTF8String],
           (long)visualCount.integerValue,
           VisualAuditJSONString(summary ?: @{}).UTF8String);
    self.passedCount += 1;
    [self finishCurrentWithFailure:nil];
    return;
  }

  NSDictionary *detail = @{
    @"failedChecks": failedChecks,
    @"issues": payload[@"issues"] ?: @{},
    @"pageHorizontalOverflow": payload[@"pageHorizontalOverflow"] ?: @NO,
    @"overflowElements": payload[@"overflowElements"] ?: @[],
    @"errors": errors,
    @"actualViewport": payload[@"actualViewport"] ?: @{},
    @"finalRoute": payload[@"route"] ?: @""
  };
  [self finishCurrentWithFailure:VisualAuditJSONString(detail)];
}

- (void)finishCurrentWithFailure:(NSString *)failure {
  if (!self.caseActive || self.currentIndex >= self.tests.count) {
    return;
  }

  NSDictionary *test = self.tests[self.currentIndex];
  self.caseActive = NO;
  self.completedCount += 1;
  if (failure != nil) {
    NSString *message = [NSString stringWithFormat:@"%@ %@: %@",
        test[@"phase"], test[@"route"], failure];
    [self.failures addObject:message];
    printf("FAIL %-10s %s %s\n", [test[@"phase"] UTF8String],
           [test[@"route"] UTF8String], failure.UTF8String);
  }

  self.currentIndex += 1;
  [self runNext];
}

@end

int main(int argc, const char *argv[]) {
  @autoreleasepool {
    if (argc < 4) {
      fprintf(stderr,
              "Usage: smoke-test-visual-assets base-url site-root checker-javascript\n"
              "Example: smoke-test-visual-assets http://127.0.0.1:8000/ . "
              "scripts/smoke-test-visual-assets.js\n");
      return 64;
    }

    NSString *baseString = [NSString stringWithUTF8String:argv[1]];
    if (![baseString hasSuffix:@"/"]) {
      baseString = [baseString stringByAppendingString:@"/"];
    }
    NSURL *baseURL = [NSURL URLWithString:baseString];
    if (baseURL == nil || baseURL.scheme.length == 0 || baseURL.host.length == 0) {
      fprintf(stderr, "base-url must be an absolute HTTP(S) URL\n");
      return 64;
    }

    NSURL *rootURL = [NSURL fileURLWithPath:
        [NSString stringWithUTF8String:argv[2]] isDirectory:YES];
    NSError *enumerationError = nil;
    NSArray<NSString *> *routes = VisualAuditLogicalRoutes(rootURL, &enumerationError);
    if (routes == nil || enumerationError != nil) {
      fprintf(stderr, "%s\n",
              (enumerationError.localizedDescription ?: @"Could not enumerate HTML routes")
                  .UTF8String);
      return 66;
    }
    if (routes.count == 0) {
      fprintf(stderr, "No local HTML route hrefs were found in index.html.\n");
      return 66;
    }

    NSError *readError = nil;
    NSString *checkerSource = [NSString
        stringWithContentsOfFile:[NSString stringWithUTF8String:argv[3]]
                       encoding:NSUTF8StringEncoding
                          error:&readError];
    if (checkerSource == nil) {
      fprintf(stderr, "%s\n", readError.localizedDescription.UTF8String);
      return 66;
    }

    [NSApplication sharedApplication];
    [NSApp setActivationPolicy:NSApplicationActivationPolicyProhibited];
    VisualAssetSmokeRunner *runner = [[VisualAssetSmokeRunner alloc]
        initWithBaseURL:baseURL routes:routes checkerSource:checkerSource];
    [runner start];
    [NSApp run];
  }
  return 0;
}
