#import <CoreGraphics/CoreGraphics.h>
#import <Foundation/Foundation.h>
#import <ImageIO/ImageIO.h>
#import <PDFKit/PDFKit.h>

static const double kPointsPerInch = 72.0;

static BOOL RenderPage(CGPDFPageRef page, CGRect crop, double dpi,
                       NSURL *outputURL, NSError **error) {
  double scale = dpi / kPointsPerInch;
  size_t pixelWidth = (size_t)ceil(CGRectGetWidth(crop) * scale);
  size_t pixelHeight = (size_t)ceil(CGRectGetHeight(crop) * scale);
  CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
  CGContextRef context = CGBitmapContextCreate(
      NULL, pixelWidth, pixelHeight, 8, 0, colorSpace,
      (CGBitmapInfo)kCGImageAlphaPremultipliedLast);
  CGColorSpaceRelease(colorSpace);

  if (context == NULL) {
    if (error != NULL) {
      *error = [NSError errorWithDomain:@"ComplexQuestionRenderer"
                                    code:1
                                userInfo:@{NSLocalizedDescriptionKey:
                                             @"Could not create bitmap context"}];
    }
    return NO;
  }

  CGContextSetRGBFillColor(context, 1, 1, 1, 1);
  CGContextFillRect(context, CGRectMake(0, 0, pixelWidth, pixelHeight));
  CGContextSetInterpolationQuality(context, kCGInterpolationHigh);
  CGContextSetShouldAntialias(context, true);
  CGContextScaleCTM(context, scale, scale);
  CGContextTranslateCTM(context, -CGRectGetMinX(crop), -CGRectGetMinY(crop));
  CGContextDrawPDFPage(context, page);

  CGImageRef image = CGBitmapContextCreateImage(context);
  CGContextRelease(context);
  if (image == NULL) {
    if (error != NULL) {
      *error = [NSError errorWithDomain:@"ComplexQuestionRenderer"
                                    code:2
                                userInfo:@{NSLocalizedDescriptionKey:
                                             @"Could not create rendered image"}];
    }
    return NO;
  }

  CGImageDestinationRef destination = CGImageDestinationCreateWithURL(
      (__bridge CFURLRef)outputURL, CFSTR("public.png"), 1, NULL);
  if (destination == NULL) {
    CGImageRelease(image);
    if (error != NULL) {
      *error = [NSError errorWithDomain:@"ComplexQuestionRenderer"
                                    code:3
                                userInfo:@{NSLocalizedDescriptionKey:
                                             @"Could not create PNG destination"}];
    }
    return NO;
  }

  NSDictionary *properties = @{
    (__bridge NSString *)kCGImagePropertyDPIWidth: @(dpi),
    (__bridge NSString *)kCGImagePropertyDPIHeight: @(dpi)
  };
  CGImageDestinationAddImage(destination, image,
                             (__bridge CFDictionaryRef)properties);
  BOOL finalized = CGImageDestinationFinalize(destination);
  CFRelease(destination);
  CGImageRelease(image);

  if (!finalized && error != NULL) {
    *error = [NSError errorWithDomain:@"ComplexQuestionRenderer"
                                  code:4
                              userInfo:@{NSLocalizedDescriptionKey:
                                           @"Could not write PNG output"}];
  }
  return finalized;
}

int main(int argc, const char *argv[]) {
  @autoreleasepool {
    if (argc < 3) {
      fprintf(stderr,
              "Usage: render-complex-2020-questions input.pdf output-directory "
              "[--preview|--text]\n");
      return 64;
    }

    NSString *inputPath = [NSString stringWithUTF8String:argv[1]];
    NSString *outputPath = [NSString stringWithUTF8String:argv[2]];
    NSArray<NSString *> *arguments =
        [[NSProcessInfo processInfo] arguments];

    if ([arguments containsObject:@"--text"]) {
      PDFDocument *textDocument =
          [[PDFDocument alloc] initWithURL:[NSURL fileURLWithPath:inputPath]];
      if (textDocument == nil) {
        fprintf(stderr, "Could not open %s\n", inputPath.UTF8String);
        return 66;
      }
      NSString *text = textDocument.string ?: @"";
      NSError *writeError = nil;
      if (![text writeToFile:outputPath
                  atomically:YES
                    encoding:NSUTF8StringEncoding
                       error:&writeError]) {
        fprintf(stderr, "%s\n", writeError.localizedDescription.UTF8String);
        return 74;
      }
      printf("Extracted text from %ld pages\n", (long)textDocument.pageCount);
      return 0;
    }

    NSURL *inputURL = [NSURL fileURLWithPath:inputPath];
    CGPDFDocumentRef document =
        CGPDFDocumentCreateWithURL((__bridge CFURLRef)inputURL);
    if (document == NULL) {
      fprintf(stderr, "Could not open %s\n", inputPath.UTF8String);
      return 66;
    }

    NSError *directoryError = nil;
    NSURL *outputURL = [NSURL fileURLWithPath:outputPath isDirectory:YES];
    if (![[NSFileManager defaultManager]
            createDirectoryAtURL:outputURL
     withIntermediateDirectories:YES
                      attributes:nil
                           error:&directoryError]) {
      fprintf(stderr, "%s\n", directoryError.localizedDescription.UTF8String);
      CGPDFDocumentRelease(document);
      return 73;
    }

    if ([arguments containsObject:@"--preview"]) {
      size_t pageCount = CGPDFDocumentGetNumberOfPages(document);
      for (size_t pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        CGPDFPageRef page = CGPDFDocumentGetPage(document, pageNumber);
        CGRect mediaBox = CGPDFPageGetBoxRect(page, kCGPDFMediaBox);
        NSURL *pageURL = [outputURL URLByAppendingPathComponent:
            [NSString stringWithFormat:@"page-%02zu.png", pageNumber]];
        NSError *renderError = nil;
        if (!RenderPage(page, mediaBox, 144, pageURL, &renderError)) {
          fprintf(stderr, "%s\n", renderError.localizedDescription.UTF8String);
          CGPDFDocumentRelease(document);
          return 74;
        }
        printf("Rendered %s\n", pageURL.lastPathComponent.UTF8String);
      }
      CGPDFDocumentRelease(document);
      return 0;
    }

    // PDF-space crop bounds use a bottom-left origin. Each crop contains only
    // the official NZQA prompt (and the question heading where it begins a
    // section), excluding the source guide's worked answer.
    NSArray<NSDictionary *> *crops = @[
      @{ @"name": @"1a", @"page": @1, @"rect": [NSValue valueWithRect:NSMakeRect(95, 645, 430, 75)] },
      @{ @"name": @"1b", @"page": @2, @"rect": [NSValue valueWithRect:NSMakeRect(95, 295, 440, 62)] },
      @{ @"name": @"1c", @"page": @3, @"rect": [NSValue valueWithRect:NSMakeRect(95, 145, 440, 92)] },
      @{ @"name": @"1d", @"page": @4, @"rect": [NSValue valueWithRect:NSMakeRect(95, 146, 440, 72)] },
      @{ @"name": @"1e", @"page": @5, @"rect": [NSValue valueWithRect:NSMakeRect(95, 141, 440, 76)] },
      @{ @"name": @"2a", @"page": @7, @"rect": [NSValue valueWithRect:NSMakeRect(95, 575, 440, 70)] },
      @{ @"name": @"2b", @"page": @7, @"rect": [NSValue valueWithRect:NSMakeRect(95, 120, 440, 82)] },
      @{ @"name": @"2c", @"page": @8, @"rect": [NSValue valueWithRect:NSMakeRect(95, 435, 440, 88)] },
      @{ @"name": @"2d", @"page": @9, @"rect": [NSValue valueWithRect:NSMakeRect(95, 205, 440, 90)] },
      @{ @"name": @"2e", @"page": @10, @"rect": [NSValue valueWithRect:NSMakeRect(95, 410, 440, 88)] },
      @{ @"name": @"3a", @"page": @11, @"rect": [NSValue valueWithRect:NSMakeRect(95, 655, 440, 95)] },
      @{ @"name": @"3b", @"page": @11, @"rect": [NSValue valueWithRect:NSMakeRect(95, 370, 440, 78)] },
      @{ @"name": @"3c", @"page": @12, @"rect": [NSValue valueWithRect:NSMakeRect(95, 690, 440, 100)] },
      @{ @"name": @"3d", @"page": @12, @"rect": [NSValue valueWithRect:NSMakeRect(95, 375, 440, 102)] },
      @{ @"name": @"3e", @"page": @13, @"rect": [NSValue valueWithRect:NSMakeRect(95, 195, 440, 85)] }
    ];

    for (NSDictionary *crop in crops) {
      size_t pageNumber = [crop[@"page"] unsignedIntegerValue];
      CGPDFPageRef page = CGPDFDocumentGetPage(document, pageNumber);
      NSString *name = crop[@"name"];
      CGRect rect = [crop[@"rect"] rectValue];
      NSURL *questionURL = [outputURL URLByAppendingPathComponent:
          [NSString stringWithFormat:@"%@-question.png", name]];
      NSError *renderError = nil;
      if (!RenderPage(page, rect, 450, questionURL, &renderError)) {
        fprintf(stderr, "%s\n", renderError.localizedDescription.UTF8String);
        CGPDFDocumentRelease(document);
        return 74;
      }
      printf("Rendered %s\n", questionURL.lastPathComponent.UTF8String);
    }

    CGPDFDocumentRelease(document);
  }
  return 0;
}
