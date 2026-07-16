#import <AppKit/AppKit.h>
#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>

@interface Integration2017SmokeRunner : NSObject <WKNavigationDelegate>
@property(nonatomic, strong) NSURL *baseURL;
@property(nonatomic, strong) WKWebView *webView;
@property(nonatomic, strong) NSArray<NSDictionary *> *tests;
@property(nonatomic, strong) NSMutableArray<NSString *> *failures;
@property(nonatomic, copy) NSString *checkerSource;
@property(nonatomic) NSUInteger currentIndex;
@property(nonatomic) NSUInteger historyStage;
@property(nonatomic) BOOL evaluating;
- (void)evaluateHistoryTest:(NSDictionary *)test;
@end

@implementation Integration2017SmokeRunner

- (instancetype)initWithBaseURL:(NSURL *)baseURL checkerSource:(NSString *)checkerSource {
  self = [super init];
  if (self == nil) {
    return nil;
  }

  _baseURL = baseURL;
  _checkerSource = [checkerSource copy];
  _failures = [NSMutableArray array];
  _currentIndex = 0;
  _historyStage = 0;
  _evaluating = NO;

  NSArray<NSString *> *parts = @[
    @"1a", @"1b", @"1c", @"1d", @"1e",
    @"2a", @"2b", @"2c", @"2d", @"2e",
    @"3a", @"3b", @"3c", @"3d", @"3e"
  ];
  NSMutableArray<NSDictionary *> *tests = [NSMutableArray arrayWithObject:@{
    @"name": @"2017 Integration picker, routes, and search",
    @"path": @"index.html#level-3-integration-2017",
    @"width": @1280,
    @"height": @900,
    @"part": [NSNull null],
    @"mode": @"picker"
  }];
  [tests addObject:@{
    @"name": @"2017 index, reload, back, and forward history",
    @"path": @"index.html?history-smoke=1#level-3-integration-2017",
    @"width": @1280,
    @"height": @900,
    @"part": @"2c",
    @"mode": @"history"
  }];

  NSArray<NSDictionary *> *viewports = @[
    @{ @"label": @"desktop", @"width": @1280, @"height": @900 },
    @{ @"label": @"tablet", @"width": @768, @"height": @1024 },
    @{ @"label": @"mobile", @"width": @360, @"height": @800 }
  ];

  for (NSDictionary *viewport in viewports) {
    for (NSString *part in parts) {
      NSString *guided = [viewport[@"label"] isEqualToString:@"desktop"]
          && [part isEqualToString:@"1a"] ? @"?mode=guided" : @"";
      [tests addObject:@{
        @"name": [NSString stringWithFormat:@"%@ %@", part, viewport[@"label"]],
        @"path": [NSString stringWithFormat:@"int-%@2017.html%@#question-%@", part, guided, part],
        @"width": viewport[@"width"],
        @"height": viewport[@"height"],
        @"part": part,
        @"mode": viewport[@"label"]
      }];
    }
  }

  [tests addObject:@{
    @"name": @"2017 annual redirect alias",
    @"path": @"integration-2017.html?mode=guided#question-three-e",
    @"width": @1280,
    @"height": @900,
    @"part": @"3e",
    @"mode": @"redirect"
  }];
  [tests addObject:@{
    @"name": @"2017 continue card and completed progress",
    @"path": @"index.html",
    @"width": @1280,
    @"height": @900,
    @"part": [NSNull null],
    @"mode": @"continue"
  }];
  _tests = [tests copy];

  WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];
  configuration.websiteDataStore = [WKWebsiteDataStore nonPersistentDataStore];
  NSString *errorCapture =
      @"window.__integration2017Errors=[];"
       "window.addEventListener('error',function(event){"
       "window.__integration2017Errors.push(event.message||'Resource load error');"
       "});"
       "window.addEventListener('unhandledrejection',function(event){"
       "window.__integration2017Errors.push(String(event.reason||'Unhandled rejection'));"
       "});"
       "(function(){const original=console.error;console.error=function(){"
       "window.__integration2017Errors.push(Array.prototype.join.call(arguments,' '));"
       "return original.apply(console,arguments);};}());";
  WKUserScript *script = [[WKUserScript alloc]
      initWithSource:errorCapture
       injectionTime:WKUserScriptInjectionTimeAtDocumentStart
    forMainFrameOnly:YES];
  [configuration.userContentController addUserScript:script];

  _webView = [[WKWebView alloc] initWithFrame:NSZeroRect configuration:configuration];
  _webView.navigationDelegate = self;
  return self;
}

- (void)start {
  [self runNext];
}

- (void)runNext {
  if (self.currentIndex >= self.tests.count) {
    NSUInteger passed = self.tests.count - self.failures.count;
    printf("\n2017 Integration browser smoke test: %lu/%lu cases passed.\n",
           (unsigned long)passed, (unsigned long)self.tests.count);
    if (self.failures.count == 0) {
      [NSApp terminate:nil];
      return;
    }
    printf("Failures:\n");
    for (NSString *failure in self.failures) {
      printf("- %s\n", failure.UTF8String);
    }
    exit(1);
  }

  self.evaluating = NO;
  NSDictionary *test = self.tests[self.currentIndex];
  if ([test[@"mode"] isEqualToString:@"history"]) {
    self.historyStage = 0;
  }
  self.webView.frame = NSMakeRect(
      0, 0, [test[@"width"] doubleValue], [test[@"height"] doubleValue]);
  NSURL *url = [NSURL URLWithString:test[@"path"] relativeToURL:self.baseURL];
  NSUInteger startedIndex = self.currentIndex;
  printf("RUN %s\n", [test[@"name"] UTF8String]);
  [self.webView loadRequest:[NSURLRequest requestWithURL:url]];

  NSTimeInterval timeout = [test[@"mode"] isEqualToString:@"history"] ? 30.0 : 15.0;
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(timeout * NSEC_PER_SEC)),
                 dispatch_get_main_queue(), ^{
    if (self.currentIndex == startedIndex) {
      [self.webView stopLoading];
      [self finishCurrentWithFailure:self.evaluating
          ? @"browser checks timed out"
          : @"navigation timed out before didFinish"];
    }
  });
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
  if (self.evaluating) {
    return;
  }

  NSDictionary *test = self.tests[self.currentIndex];
  if ([test[@"mode"] isEqualToString:@"redirect"]
      && ![webView.URL.lastPathComponent isEqualToString:@"int-3e2017.html"]) {
    return;
  }

  self.evaluating = YES;
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1.0 * NSEC_PER_SEC)),
                 dispatch_get_main_queue(), ^{
    if ([test[@"mode"] isEqualToString:@"history"]) {
      [self evaluateHistoryTest:test];
    } else {
      [self evaluateTest:test];
    }
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

- (void)evaluateTest:(NSDictionary *)test {
  id partValue = test[@"part"];
  NSString *part = partValue == [NSNull null]
      ? @"null"
      : [NSString stringWithFormat:@"\"%@\"", partValue];
  NSString *invocation = [NSString stringWithFormat:
      @"\nwindow.runIntegration2017SmokeCheck(%@, \"%@\");",
      part, test[@"mode"]];
  NSString *source = [self.checkerSource stringByAppendingString:invocation];

  [self.webView evaluateJavaScript:source completionHandler:^(id result, NSError *error) {
    if (error != nil) {
      [self finishCurrentWithFailure:
          [NSString stringWithFormat:@"JavaScript evaluation failed: %@",
                                     error.localizedDescription]];
      return;
    }
    if (![result isKindOfClass:[NSString class]]) {
      [self finishCurrentWithFailure:@"browser check did not return JSON"];
      return;
    }

    NSData *data = [(NSString *)result dataUsingEncoding:NSUTF8StringEncoding];
    NSError *jsonError = nil;
    id decodedPayload = [NSJSONSerialization JSONObjectWithData:data
                                                        options:0
                                                          error:&jsonError];
    if (![decodedPayload isKindOfClass:[NSDictionary class]]) {
      [self finishCurrentWithFailure:
          [NSString stringWithFormat:@"invalid browser-check JSON: %@",
                                     jsonError.localizedDescription ?: @"not an object"]];
      return;
    }

    NSDictionary *payload = (NSDictionary *)decodedPayload;
    NSArray<NSString *> *failedChecks = payload[@"failedChecks"];
    NSArray<NSString *> *errors = payload[@"errors"];
    if (![failedChecks isKindOfClass:[NSArray class]]
        || ![errors isKindOfClass:[NSArray class]]) {
      [self finishCurrentWithFailure:@"browser-check JSON omitted result arrays"];
      return;
    }
    if (failedChecks.count == 0 && errors.count == 0) {
      printf("PASS %s\n", [test[@"name"] UTF8String]);
      [self finishCurrentWithFailure:nil];
      return;
    }

    NSString *failure = [NSString stringWithFormat:@"checks: %@; errors: %@; debug: %@",
        [failedChecks componentsJoinedByString:@", "],
        [errors componentsJoinedByString:@" | "], payload[@"debug"]];
    [self finishCurrentWithFailure:failure];
  }];
}

- (void)evaluateHistoryTest:(NSDictionary *)test {
  NSArray<NSString *> *stages = @[
    @"index-start", @"question-first", @"question-reload", @"index-back",
    @"question-forward"
  ];
  if (self.historyStage >= stages.count) {
    [self finishCurrentWithFailure:@"history state machine exceeded its final stage"];
    return;
  }

  NSString *stage = stages[self.historyStage];
  NSString *invocation = [NSString stringWithFormat:
      @"\nwindow.runIntegration2017HistoryCheck(\"%@\");", stage];
  NSString *source = [self.checkerSource stringByAppendingString:invocation];

  [self.webView evaluateJavaScript:source completionHandler:^(id result, NSError *error) {
    if (error != nil || ![result isKindOfClass:[NSString class]]) {
      NSString *detail = error != nil
          ? error.localizedDescription
          : @"browser check did not return JSON";
      [self finishCurrentWithFailure:
          [NSString stringWithFormat:@"history %@: %@", stage, detail]];
      return;
    }

    NSData *data = [(NSString *)result dataUsingEncoding:NSUTF8StringEncoding];
    NSError *jsonError = nil;
    id decodedPayload = [NSJSONSerialization JSONObjectWithData:data
                                                        options:0
                                                          error:&jsonError];
    if (![decodedPayload isKindOfClass:[NSDictionary class]]) {
      [self finishCurrentWithFailure:
          [NSString stringWithFormat:@"history %@ returned invalid JSON: %@", stage,
                                     jsonError.localizedDescription ?: @"not an object"]];
      return;
    }

    NSDictionary *payload = (NSDictionary *)decodedPayload;
    NSArray<NSString *> *failedChecks = payload[@"failedChecks"];
    NSArray<NSString *> *errors = payload[@"errors"];
    if (![failedChecks isKindOfClass:[NSArray class]]
        || ![errors isKindOfClass:[NSArray class]]) {
      [self finishCurrentWithFailure:
          [NSString stringWithFormat:@"history %@ omitted result arrays", stage]];
      return;
    }
    if (failedChecks.count || errors.count) {
      [self finishCurrentWithFailure:[NSString stringWithFormat:
          @"history %@ checks: %@; errors: %@; debug: %@", stage,
          [failedChecks componentsJoinedByString:@", "],
          [errors componentsJoinedByString:@" | "], payload[@"debug"]]];
      return;
    }

    printf("  PASS history stage %s\n", stage.UTF8String);

    if (self.historyStage == 0) {
      self.historyStage = 1;
      self.evaluating = NO;
      [self.webView evaluateJavaScript:@"window.navigateIntegration2017HistoryToQuestion();"
                     completionHandler:^(id actionResult, NSError *actionError) {
        if (actionError != nil || ![actionResult boolValue]) {
          [self finishCurrentWithFailure:[NSString stringWithFormat:
              @"history index-start could not activate Question 2(c): %@",
              actionError.localizedDescription ?: @"question link unavailable"]];
        }
      }];
      return;
    }

    if (self.historyStage == 1) {
      self.historyStage = 2;
      self.evaluating = NO;
      [self.webView reload];
      return;
    }

    if (self.historyStage == 2) {
      if (!self.webView.canGoBack) {
        [self finishCurrentWithFailure:@"history question-reload had no Back entry"];
        return;
      }
      self.historyStage = 3;
      self.evaluating = NO;
      [self.webView goBack];
      return;
    }

    if (self.historyStage == 3) {
      if (!self.webView.canGoForward) {
        [self finishCurrentWithFailure:@"history index-back had no Forward entry"];
        return;
      }
      self.historyStage = 4;
      self.evaluating = NO;
      [self.webView goForward];
      return;
    }

    printf("PASS %s\n", [test[@"name"] UTF8String]);
    [self finishCurrentWithFailure:nil];
  }];
}

- (void)finishCurrentWithFailure:(NSString *)failure {
  if (self.currentIndex >= self.tests.count) {
    return;
  }

  NSDictionary *test = self.tests[self.currentIndex];
  if (failure != nil) {
    NSString *message = [NSString stringWithFormat:@"%@: %@", test[@"name"], failure];
    [self.failures addObject:message];
    printf("FAIL %s\n", message.UTF8String);
  }
  self.currentIndex += 1;
  [self runNext];
}

@end

int main(int argc, const char *argv[]) {
  @autoreleasepool {
    if (argc < 3) {
      fprintf(stderr,
              "Usage: smoke-test-integration-2017 base-url checker-javascript\n");
      return 64;
    }
    NSURL *baseURL = [NSURL URLWithString:[NSString stringWithUTF8String:argv[1]]];
    NSError *readError = nil;
    NSString *checkerSource = [NSString
        stringWithContentsOfFile:[NSString stringWithUTF8String:argv[2]]
                       encoding:NSUTF8StringEncoding
                          error:&readError];
    if (checkerSource == nil) {
      fprintf(stderr, "%s\n", readError.localizedDescription.UTF8String);
      return 66;
    }

    [NSApplication sharedApplication];
    [NSApp setActivationPolicy:NSApplicationActivationPolicyProhibited];
    Integration2017SmokeRunner *runner =
        [[Integration2017SmokeRunner alloc] initWithBaseURL:baseURL
                                             checkerSource:checkerSource];
    [runner start];
    [NSApp run];
  }
  return 0;
}
