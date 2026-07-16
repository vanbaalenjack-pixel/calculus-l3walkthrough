#import <AppKit/AppKit.h>
#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>

@interface SiteRegressionSmokeRunner : NSObject <WKNavigationDelegate>
@property(nonatomic, strong) NSURL *baseURL;
@property(nonatomic, strong) WKWebView *webView;
@property(nonatomic, strong) NSArray<NSDictionary *> *tests;
@property(nonatomic, strong) NSMutableArray<NSString *> *failures;
@property(nonatomic, copy) NSString *checkerSource;
@property(nonatomic) NSUInteger currentIndex;
@property(nonatomic) BOOL evaluating;
@end

@implementation SiteRegressionSmokeRunner

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
  _tests = @[
    @{
      @"name": @"2021 Integration custom labels and progress",
      @"path": @"int-1b2021.html?mode=guided",
      @"width": @1280,
      @"height": @900,
      @"mode": @"integration-2021-labels"
    },
    @{
      @"name": @"mobile walkthrough sidebar focus containment",
      @"path": @"int-1b2021.html",
      @"width": @360,
      @"height": @800,
      @"mode": @"mobile-sidebar"
    },
    @{
      @"name": @"2021 Integration table caption",
      @"path": @"int-3b2021.html",
      @"width": @768,
      @"height": @1024,
      @"mode": @"caption-2021"
    },
    @{
      @"name": @"2022 Integration table caption",
      @"path": @"int-3b2022.html",
      @"width": @360,
      @"height": @800,
      @"mode": @"caption-2022"
    },
    @{
      @"name": @"2022 Differentiation Question 1(e) boundary",
      @"path": @"1e2022.html",
      @"width": @1280,
      @"height": @900,
      @"mode": @"sequence-1e"
    },
    @{
      @"name": @"2022 Differentiation Question 2(a) boundary",
      @"path": @"2a2022.html",
      @"width": @768,
      @"height": @1024,
      @"mode": @"sequence-2a"
    },
    @{
      @"name": @"2022 Differentiation Question 2(e) boundary",
      @"path": @"2e2022.html",
      @"width": @360,
      @"height": @800,
      @"mode": @"sequence-2e"
    },
    @{
      @"name": @"2022 Differentiation Question 3(a) boundary",
      @"path": @"3a2022.html",
      @"width": @1280,
      @"height": @900,
      @"mode": @"sequence-3a"
    },
    @{
      @"name": @"image zoom dialog focus and naming",
      @"path": @"complex-2020.html?q=1a",
      @"width": @1280,
      @"height": @900,
      @"mode": @"image-lightbox"
    },
    @{
      @"name": @"graph zoom accessible naming",
      @"path": @"2a2025-l2.html",
      @"width": @768,
      @"height": @1024,
      @"mode": @"graph-zoom-name"
    },
    @{
      @"name": @"2019 Complex raw-math heading",
      @"path": @"complex-2019.html?q=2c",
      @"width": @360,
      @"height": @800,
      @"mode": @"raw-math-heading"
    },
    @{
      @"name": @"2022 Complex raw-math headings",
      @"path": @"complex-2022.html?q=1c",
      @"width": @1280,
      @"height": @900,
      @"mode": @"raw-math-heading"
    },
    @{
      @"name": @"2025 Complex raw-math headings",
      @"path": @"complex-1c2025.html",
      @"width": @768,
      @"height": @1024,
      @"mode": @"raw-math-heading"
    },
    @{
      @"name": @"2025 Differentiation raw-math heading",
      @"path": @"1e2025.html",
      @"width": @360,
      @"height": @800,
      @"mode": @"raw-math-heading"
    },
    @{
      @"name": @"2023 Integration data rendering",
      @"path": @"int-1b2023.html",
      @"width": @1280,
      @"height": @900,
      @"mode": @"rendered-math-page"
    },
    @{
      @"name": @"2024 Integration raw-math heading",
      @"path": @"int-1d2024.html",
      @"width": @768,
      @"height": @1024,
      @"mode": @"raw-math-heading"
    },
    @{
      @"name": @"2025 Integration raw-math heading",
      @"path": @"int-1c2025.html",
      @"width": @360,
      @"height": @800,
      @"mode": @"raw-math-heading"
    },
    @{
      @"name": @"Level 2 graph-sketch hint math",
      @"path": @"2a2025-l2.html",
      @"width": @360,
      @"height": @800,
      @"mode": @"hint-math"
    },
    @{
      @"name": @"2022 Differentiation feedback math",
      @"path": @"2c2022.html",
      @"width": @768,
      @"height": @1024,
      @"mode": @"feedback-math"
    },
    @{
      @"name": @"Level 2 parameter hint math",
      @"path": @"2d2025-l2.html",
      @"width": @1280,
      @"height": @900,
      @"mode": @"hint-math"
    },
    @{
      @"name": @"Level 2 related-rates hint math",
      @"path": @"3b2025-l2.html",
      @"width": @768,
      @"height": @1024,
      @"mode": @"hint-math"
    },
    @{
      @"name": @"Level 2 optimisation hint math",
      @"path": @"3c2025-l2.html",
      @"width": @360,
      @"height": @800,
      @"mode": @"hint-math"
    }
  ];

  WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];
  configuration.websiteDataStore = [WKWebsiteDataStore nonPersistentDataStore];
  NSString *errorCapture =
      @"window.__siteRegressionErrors=[];"
       "window.addEventListener('error',function(event){"
       "var target=event.target||{};"
       "var resource=target.src||target.href||'';"
       "window.__siteRegressionErrors.push(event.message||('Resource load error: '+resource));"
       "},true);"
       "window.addEventListener('unhandledrejection',function(event){"
       "window.__siteRegressionErrors.push(String(event.reason||'Unhandled rejection'));"
       "});"
       "(function(){"
       "['error','warn'].forEach(function(level){"
       "var original=console[level];"
       "console[level]=function(){"
       "window.__siteRegressionErrors.push('console.'+level+': '+Array.prototype.join.call(arguments,' '));"
       "return original.apply(console,arguments);"
       "};"
       "});"
       "}());";
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
    printf("\nSite-wide regression browser smoke test: %lu/%lu cases passed.\n",
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
  NSUInteger startedIndex = self.currentIndex;
  printf("RUN %s\n", [test[@"name"] UTF8String]);
  [self.webView loadRequest:[NSURLRequest requestWithURL:url]];

  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(20.0 * NSEC_PER_SEC)),
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

  self.evaluating = YES;
  NSDictionary *test = self.tests[self.currentIndex];
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1.2 * NSEC_PER_SEC)),
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
  NSString *invocation = [NSString stringWithFormat:
      @"\nwindow.runSiteRegressionSmokeCheck(\"%@\");", test[@"mode"]];
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
              "Usage: smoke-test-site-regressions base-url checker-javascript\n");
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
    SiteRegressionSmokeRunner *runner =
        [[SiteRegressionSmokeRunner alloc] initWithBaseURL:baseURL
                                             checkerSource:checkerSource];
    [runner start];
    [NSApp run];
  }
  return 0;
}
