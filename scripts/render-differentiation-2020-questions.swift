#!/usr/bin/env swift

import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

// Source paper: NZQA Level 3 Calculus 91578 examination, 2020.
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
    fputs("Usage: render-differentiation-2020-questions.swift input.pdf output-directory [--preview]\n", stderr)
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

// PDF-space crop bounds use a bottom-left origin and are intentionally kept in
// one place so every question is rendered at the same physical scale.
private let crops: [QuestionCrop] = [
    QuestionCrop(name: "1a", page: 2, bounds: CGRect(x: 35, y: 708, width: 500, height: 90)),
    QuestionCrop(name: "1b", page: 2, bounds: CGRect(x: 35, y: 529, width: 500, height: 95)),
    QuestionCrop(name: "1c", page: 2, bounds: CGRect(x: 35, y: 279, width: 500, height: 89)),
    QuestionCrop(name: "1d", page: 3, bounds: CGRect(x: 35, y: 672, width: 500, height: 126)),
    QuestionCrop(name: "1e", page: 4, bounds: CGRect(x: 35, y: 648, width: 500, height: 150)),
    QuestionCrop(name: "2a", page: 5, bounds: CGRect(x: 35, y: 697, width: 500, height: 101)),
    QuestionCrop(name: "2b", page: 5, bounds: CGRect(x: 35, y: 473, width: 500, height: 142)),
    QuestionCrop(name: "2c", page: 6, bounds: CGRect(x: 35, y: 708, width: 500, height: 90)),
    QuestionCrop(name: "2d", page: 6, bounds: CGRect(x: 35, y: 160, width: 500, height: 336)),
    QuestionCrop(name: "2e", page: 7, bounds: CGRect(x: 35, y: 452, width: 500, height: 138)),
    QuestionCrop(name: "3a", page: 8, bounds: CGRect(x: 35, y: 710, width: 500, height: 88)),
    QuestionCrop(name: "3b", page: 8, bounds: CGRect(x: 35, y: 536, width: 500, height: 97)),
    QuestionCrop(name: "3c", page: 9, bounds: CGRect(x: 35, y: 455, width: 500, height: 340)),
    QuestionCrop(name: "3d", page: 10, bounds: CGRect(x: 35, y: 677, width: 500, height: 122)),
    QuestionCrop(name: "3e", page: 11, bounds: CGRect(x: 35, y: 679, width: 500, height: 122))
]

for crop in crops {
    guard let page = document.page(at: crop.page) else {
        throw NSError(domain: "QuestionRenderer", code: 4, userInfo: [NSLocalizedDescriptionKey: "Missing PDF page \(crop.page)"])
    }
    let questionURL = outputURL.appendingPathComponent("\(crop.name)-question.png")
    try render(page: page, crop: crop.bounds, dpi: 450, outputURL: questionURL)
    print("Rendered \(questionURL.lastPathComponent)")
}
