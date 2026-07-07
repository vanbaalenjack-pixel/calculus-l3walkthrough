#!/usr/bin/env swift

import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

// Source walkthrough: 2019 Level 3 Differentiation PDF.
private let pointsPerInch = 72.0

private struct QuestionCrop {
    let name: String
    let page: Int
    let bounds: CGRect
}

private func render(
    page: CGPDFPage,
    crop: CGRect,
    dpi: Double,
    outputURL: URL
) throws {
    let scale = dpi / pointsPerInch
    let pixelWidth = Int((crop.width * scale).rounded(.up))
    let pixelHeight = Int((crop.height * scale).rounded(.up))
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    let bitmapInfo = CGImageAlphaInfo.premultipliedLast.rawValue

    guard let context = CGContext(
        data: nil,
        width: pixelWidth,
        height: pixelHeight,
        bitsPerComponent: 8,
        bytesPerRow: 0,
        space: colorSpace,
        bitmapInfo: bitmapInfo
    ) else {
        throw NSError(domain: "QuestionRenderer", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not create bitmap context"])
    }

    context.setFillColor(CGColor.white)
    context.fill(CGRect(x: 0, y: 0, width: pixelWidth, height: pixelHeight))
    context.interpolationQuality = .high
    context.setShouldAntialias(true)
    context.setAllowsAntialiasing(true)
    context.scaleBy(x: scale, y: scale)
    context.translateBy(x: -crop.minX, y: -crop.minY)
    context.drawPDFPage(page)

    guard let image = context.makeImage(),
          let destination = CGImageDestinationCreateWithURL(
              outputURL as CFURL,
              UTType.png.identifier as CFString,
              1,
              nil
          ) else {
        throw NSError(domain: "QuestionRenderer", code: 2, userInfo: [NSLocalizedDescriptionKey: "Could not create PNG output"])
    }

    let properties: [CFString: Any] = [
        kCGImagePropertyDPIWidth: dpi,
        kCGImagePropertyDPIHeight: dpi,
        kCGImagePropertyPNGDictionary: [
            kCGImagePropertyPNGInterlaceType: 0
        ]
    ]
    CGImageDestinationAddImage(destination, image, properties as CFDictionary)

    guard CGImageDestinationFinalize(destination) else {
        throw NSError(domain: "QuestionRenderer", code: 3, userInfo: [NSLocalizedDescriptionKey: "Could not write PNG output"])
    }
}

private let arguments = CommandLine.arguments
guard arguments.count >= 3 else {
    fputs("Usage: render-differentiation-2019-questions.swift input.pdf output-directory [--preview]\n", stderr)
    exit(64)
}

let inputURL = URL(fileURLWithPath: arguments[1])
let outputURL = URL(fileURLWithPath: arguments[2], isDirectory: true)
let previewMode = arguments.contains("--preview")

guard let document = CGPDFDocument(inputURL as CFURL) else {
    fputs("Could not open \(inputURL.path)\n", stderr)
    exit(66)
}

try FileManager.default.createDirectory(at: outputURL, withIntermediateDirectories: true)

if previewMode {
    for pageNumber in 1...document.numberOfPages {
        guard let page = document.page(at: pageNumber) else { continue }
        let mediaBox = page.getBoxRect(.mediaBox)
        let pageURL = outputURL.appendingPathComponent(String(format: "page-%02d.png", pageNumber))
        try render(page: page, crop: mediaBox, dpi: 144, outputURL: pageURL)
        print("Rendered \(pageURL.lastPathComponent)")
    }
    exit(0)
}

// PDF crop bounds use a bottom-left origin. They are intentionally kept in
// one place so each question image can be regenerated at the same scale.
private let crops: [QuestionCrop] = [
    QuestionCrop(name: "1a", page: 1, bounds: CGRect(x: 145, y: 600, width: 390, height: 120)),
    QuestionCrop(name: "1b", page: 1, bounds: CGRect(x: 80, y: 160, width: 470, height: 90)),
    QuestionCrop(name: "1c", page: 2, bounds: CGRect(x: 80, y: 320, width: 470, height: 105)),
    QuestionCrop(name: "1d", page: 3, bounds: CGRect(x: 80, y: 220, width: 470, height: 90)),
    QuestionCrop(name: "1e", page: 4, bounds: CGRect(x: 80, y: 145, width: 470, height: 175)),
    QuestionCrop(name: "2a", page: 5, bounds: CGRect(x: 145, y: 70, width: 420, height: 130)),
    QuestionCrop(name: "2b", page: 6, bounds: CGRect(x: 80, y: 420, width: 470, height: 110)),
    QuestionCrop(name: "2c", page: 7, bounds: CGRect(x: 80, y: 620, width: 470, height: 130)),
    QuestionCrop(name: "2d", page: 8, bounds: CGRect(x: 80, y: 400, width: 470, height: 380)),
    QuestionCrop(name: "2e", page: 9, bounds: CGRect(x: 80, y: 160, width: 470, height: 120)),
    QuestionCrop(name: "3a", page: 11, bounds: CGRect(x: 145, y: 570, width: 420, height: 150)),
    QuestionCrop(name: "3b", page: 12, bounds: CGRect(x: 80, y: 400, width: 470, height: 380)),
    QuestionCrop(name: "3c", page: 13, bounds: CGRect(x: 80, y: 450, width: 470, height: 340)),
    QuestionCrop(name: "3d", page: 15, bounds: CGRect(x: 80, y: 610, width: 470, height: 150)),
    QuestionCrop(name: "3e", page: 16, bounds: CGRect(x: 80, y: 385, width: 470, height: 380))
]

for crop in crops {
    guard let page = document.page(at: crop.page) else {
        throw NSError(domain: "QuestionRenderer", code: 4, userInfo: [NSLocalizedDescriptionKey: "Missing PDF page \(crop.page)"])
    }
    let questionURL = outputURL.appendingPathComponent("\(crop.name)-question.png")
    try render(page: page, crop: crop.bounds, dpi: 450, outputURL: questionURL)
    print("Rendered \(questionURL.lastPathComponent)")
}
