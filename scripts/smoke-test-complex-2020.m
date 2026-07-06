#import <AppKit/AppKit.h>
#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>

@interface Complex2020SmokeRunner : NSObject <WKNavigationDelegate>
@property(nonatomic, strong) NSURL *baseURL;
@property(nonatomic, strong) WKWebView *webView;
@property(nonatomic, strong) NSArray<NSDictionary *> *tests;
@property(nonatomic, strong) NSMutableArray<NSString *> *failures;
@property(nonatomic, copy) NSString *checkerSource;
@property(nonatomic) NSUInteger currentIndex;
@property(nonatomic) BOOL evaluating;
@end

@implementation Complex2020SmokeRunner

- (instancetype)initWithBaseURL:(NSURL *)baseURL checkerSource:(NSString *)checkerSource {
  self = [super init];
  if (self == nil) {
    return nil;
  }

  _baseURL = baseURL;
  _checkerSource = [checkerSource copy];
  _failures = [NSMutableArray array];
  _currentIndex = 0;
  _evaluating = NO;

  NSMutableArray<NSDictionary *> *tests = [NSMutableArray arrayWithObject:@{
    @"name": @"2020 Complex Numbers picker",
    @"path": @"index.html#level-3-complex-2020",
    @"width": @1280,
    @"height": @900,
    @"part": [NSNull null],
    @"mode": @"picker"
  }];
  NSArray<NSString *> *parts = @[
    @"1a", @"1b", @"1c", @"1d", @"1e",
    @"2a", @"2b", @"2c", @"2d", @"2e",
    @"3a", @"3b", @"3c", @"3d", @"3e"
  ];
  for (NSString *part in parts) {
    [tests addObject:@{
      @"name": [NSString stringWithFormat:@"%@ desktop", part],
      @"path": [NSString stringWithFormat:@"complex-2020.html?q=%@", part],
      @"width": @1280,
      @"height": @900,
      @"part": part,
      @"mode": @"desktop"
    }];
  }
  for (NSString *part in parts) {
    [tests addObject:@{
      @"name": [NSString stringWithFormat:@"%@ mobile", part],
      @"path": [NSString stringWithFormat:@"complex-2020.html?q=%@", part],
      @"width": @390,
      @"height": @844,
      @"part": part,
      @"mode": @"mobile"
    }];
  }
  _tests = [tests copy];

  WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];
  configuration.websiteDataStore = [WKWebsiteDataStore nonPersistentDataStore];
  NSString *errorCapture =
      @"window.__complex2020Errors=[];"
       "window.addEventListener('error',function(event){"
       "window.__complex2020Errors.push(event.message||'Resource load error');"
       "});"
       "window.addEventListener('unhandledrejection',function(event){"
       "window.__complex2020Errors.push(String(event.reason||'Unhandled rejection'));"
       "});"
       "(function(){const original=console.error;console.error=function(){"
       "window.__complex2020Errors.push(Array.prototype.join.call(arguments,' '));"
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
    printf("\n2020 Complex Numbers browser smoke test: %lu/%lu cases passed.\n",
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
  self.webView.frame = NSMakeRect(
      0, 0, [test[@"width"] doubleValue], [test[@"height"] doubleValue]);
  NSURL *url = [NSURL URLWithString:test[@"path"] relativeToURL:self.baseURL];
  [self.webView loadRequest:[NSURLRequest requestWithURL:url]];
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
  if (self.evaluating) {
    return;
  }
  self.evaluating = YES;
  NSDictionary *test = self.tests[self.currentIndex];
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1.4 * NSEC_PER_SEC)),
                 dispatch_get_main_queue(), ^{
    [self evaluateTest:test];
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
      @"\nwindow.runComplex2020SmokeCheck(%@, \"%@\");",
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
    NSDictionary *payload = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
    NSArray<NSString *> *failedChecks = payload[@"failedChecks"];
    NSArray<NSString *> *errors = payload[@"errors"];
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

- (void)finishCurrentWithFailure:(NSString *)failure {
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
              "Usage: smoke-test-complex-2020 base-url checker-javascript\n");
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
    Complex2020SmokeRunner *runner =
        [[Complex2020SmokeRunner alloc] initWithBaseURL:baseURL
                                         checkerSource:checkerSource];
    [runner start];
    [NSApp run];
  }
  return 0;
}
