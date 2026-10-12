#!/usr/bin/env swift
// Lossless format repair from the existing 48 px brand artwork.
import Foundation
import ImageIO
import CoreGraphics
let input = URL(fileURLWithPath: "assets/favicon-48.png")
guard let source = CGImageSourceCreateWithURL(input as CFURL, nil),
      let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else { fatalError("Cannot decode brand artwork") }
let size = 48
var pixels = [UInt8](repeating: 0, count: size * size * 4)
pixels.withUnsafeMutableBytes { buffer in
    let context = CGContext(data: buffer.baseAddress, width: size, height: size,
        bitsPerComponent: 8, bytesPerRow: size * 4, space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    context.draw(image, in: CGRect(x: 0, y: 0, width: size, height: size))
}
var bitmap = Data()
func u16(_ value: Int, _ target: inout Data) {
    target.append(UInt8(value & 255)); target.append(UInt8((value >> 8) & 255))
}
func u32(_ value: Int, _ target: inout Data) {
    for shift in stride(from: 0, to: 32, by: 8) { target.append(UInt8((value >> shift) & 255)) }
}
let maskBytes = ((size + 31) / 32) * 4 * size
u32(40, &bitmap); u32(size, &bitmap); u32(size * 2, &bitmap)
u16(1, &bitmap); u16(32, &bitmap); u32(0, &bitmap)
u32(size * size * 4 + maskBytes, &bitmap)
for _ in 0..<4 { u32(0, &bitmap) }
// CGContext uses bottom-up coordinates; ICO's DIB rows are bottom-up too.
for offset in stride(from: 0, to: pixels.count, by: 4) {
    let a = Int(pixels[offset + 3])
    let straight: (Int) -> UInt8 = { channel in a == 0 ? 0 : UInt8(min(255, Int(pixels[offset + channel]) * 255 / a)) }
    bitmap.append(contentsOf: [straight(2), straight(1), straight(0), UInt8(a)])
}
bitmap.append(Data(repeating: 0, count: maskBytes))
var ico = Data()
u16(0, &ico); u16(1, &ico); u16(1, &ico)
ico.append(contentsOf: [UInt8(size), UInt8(size), 0, 0])
u16(1, &ico); u16(32, &ico); u32(bitmap.count, &ico); u32(22, &ico)
ico.append(bitmap)
try ico.write(to: URL(fileURLWithPath: "favicon.ico"))
guard let repaired = CGImageSourceCreateWithData(ico as CFData, nil),
      let decoded = CGImageSourceCreateImageAtIndex(repaired, 0, nil),
      decoded.width == size, decoded.height == size else { fatalError("ICO decoder rejected repaired icon") }
print("ICO repaired and decoded: 48×48, 32-bit directory and 32-bit DIB")
