#!/usr/bin/env swift

import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

// Source walkthrough: 2019 Level 3 Complex Numbers PDF.
// Crop measurements were visually audited against a 2828 × 4000 page render.
private let pointsPerInch = 72.0
private let referenceWidth = 2828.0
private let referenceHeight = 4000.0

private struct QuestionCrop {
    let name: String
    let page: Int
    let topLeftBounds: CGRect
}

private func pdfBounds(for crop: CGRect, in mediaBox: CGRect) -> CGRect {
    let x = mediaBox.minX + crop.minX / referenceWidth * mediaBox.width
    let width = crop.width / referenceWidth * mediaBox.width
    let height = crop.height / referenceHeight * mediaBox.height
    let y = mediaBox.minY + (1 - crop.maxY / referenceHeight) * mediaBox.height
    return CGRect(x: x, y: y, width: width, height: height)
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
    fputs("Usage: render-complex-2019-questions.swift input.pdf output-directory [--preview]\n", stderr)
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

// Top-left pixel bounds include only each official prompt. Solution lines that
// share the same PDF page begin outside every rectangle below.
private let crops: [QuestionCrop] = [
    QuestionCrop(name: "1a", page: 1, topLeftBounds: CGRect(x: 320, y: 730, width: 2130, height: 240)),
    QuestionCrop(name: "1b", page: 1, topLeftBounds: CGRect(x: 320, y: 2210, width: 2000, height: 300)),
    QuestionCrop(name: "1c", page: 2, topLeftBounds: CGRect(x: 320, y: 540, width: 1800, height: 210)),
    QuestionCrop(name: "1d", page: 3, topLeftBounds: CGRect(x: 320, y: 640, width: 2010, height: 235)),
    QuestionCrop(name: "1e", page: 4, topLeftBounds: CGRect(x: 320, y: 750, width: 2110, height: 210)),
    QuestionCrop(name: "2a", page: 5, topLeftBounds: CGRect(x: 320, y: 1100, width: 2130, height: 200)),
    QuestionCrop(name: "2b", page: 5, topLeftBounds: CGRect(x: 320, y: 2550, width: 1960, height: 160)),
    QuestionCrop(name: "2c", page: 6, topLeftBounds: CGRect(x: 320, y: 665, width: 1800, height: 250)),
    QuestionCrop(name: "2d", page: 7, topLeftBounds: CGRect(x: 320, y: 410, width: 2090, height: 150)),
    QuestionCrop(name: "2e", page: 7, topLeftBounds: CGRect(x: 320, y: 2110, width: 1660, height: 140)),
    QuestionCrop(name: "3a", page: 9, topLeftBounds: CGRect(x: 320, y: 2260, width: 1750, height: 140)),
    QuestionCrop(name: "3b", page: 10, topLeftBounds: CGRect(x: 320, y: 550, width: 2190, height: 215)),
    QuestionCrop(name: "3c", page: 10, topLeftBounds: CGRect(x: 320, y: 3200, width: 1700, height: 280)),
    QuestionCrop(name: "3d", page: 11, topLeftBounds: CGRect(x: 320, y: 2510, width: 1920, height: 260)),
    QuestionCrop(name: "3e", page: 12, topLeftBounds: CGRect(x: 320, y: 2790, width: 2150, height: 210))
]

for crop in crops {
    guard let page = document.page(at: crop.page) else {
        throw NSError(domain: "QuestionRenderer", code: 4, userInfo: [NSLocalizedDescriptionKey: "Missing PDF page \(crop.page)"])
    }
    let mediaBox = page.getBoxRect(.mediaBox)
    let questionURL = outputURL.appendingPathComponent("\(crop.name)-question.png")
    try render(
        page: page,
        crop: pdfBounds(for: crop.topLeftBounds, in: mediaBox),
        dpi: 450,
        outputURL: questionURL
    )
    print("Rendered \(questionURL.lastPathComponent)")
}
