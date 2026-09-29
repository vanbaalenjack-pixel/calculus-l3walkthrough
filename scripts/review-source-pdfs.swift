import Foundation
import PDFKit
import AppKit

let folder = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
for file in try FileManager.default.contentsOfDirectory(at: folder, includingPropertiesForKeys: nil).filter({ $0.pathExtension == "pdf" }) {
    guard let pdf = PDFDocument(url: file) else { continue }
    var text = ""
    for i in 0..<pdf.pageCount {
        guard let page = pdf.page(at: i) else { continue }
        text += "\n--- PAGE \(i + 1) ---\n" + (page.string ?? "")
        if CommandLine.arguments.contains("--render") {
            let size = page.bounds(for: .mediaBox).size
            let image = page.thumbnail(of: NSSize(width: size.width * 1.5, height: size.height * 1.5), for: .mediaBox)
            if let tiff = image.tiffRepresentation, let bitmap = NSBitmapImageRep(data: tiff), let png = bitmap.representation(using: .png, properties: [:]) {
                try png.write(to: folder.appendingPathComponent(file.deletingPathExtension().lastPathComponent + "-page-\(i+1).png"))
            }
        }
    }
    try text.write(to: file.deletingPathExtension().appendingPathExtension("txt"), atomically: true, encoding: .utf8)
}
