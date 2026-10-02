#!/usr/bin/env swift
import Foundation
import Vision
import ImageIO
let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("_site")
let extensions: Set<String> = ["png", "jpg", "jpeg", "webp", "ico"]
let files = (FileManager.default.enumerator(at: root, includingPropertiesForKeys: nil)!.allObjects as! [URL]).filter { extensions.contains($0.pathExtension.lowercased()) }.sorted { $0.path < $1.path }
let pattern = #"\b(artificial intelligence|AI[ -](assistant|assisted|generated|powered)|OpenAI|ChatGPT|Codex|Anthropic|Claude|Gemini|Copilot|GPT(-?[0-9]+)?|large language model|software[ -]development tools|technical implementation created with)\b"#
let terms = try NSRegularExpression(pattern: pattern, options: .caseInsensitive)
let uppercaseAI = try NSRegularExpression(pattern: #"\bAI\b"#)
var results: [[String: Any]] = []
for file in files {
    do {
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = false
        try VNImageRequestHandler(url: file).perform([request])
        let text = (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
        let source = CGImageSourceCreateWithURL(file as CFURL, nil)
        let metadata = source.flatMap { CGImageSourceCopyPropertiesAtIndex($0, 0, nil) }.map { String(describing: $0) } ?? ""
        let content = text + "\n" + metadata
        let range = NSRange(content.startIndex..., in: content)
        let matches = (terms.matches(in: content, range: range) + uppercaseAI.matches(in: content, range: range)).map { (content as NSString).substring(with: $0.range) }
        results.append(["file": String(file.path.dropFirst(root.path.count + 1)), "text": text, "matches": matches])
    } catch { results.append(["file": file.lastPathComponent, "error": String(describing: error)]) }
}
let report = try JSONSerialization.data(withJSONObject: results, options: [.prettyPrinted, .sortedKeys])
try report.write(to: URL(fileURLWithPath: ".review/2026-10-02/image-text.json"))
let errors = results.filter { $0["error"] != nil }
let matches = results.filter { !(($0["matches"] as? [String]) ?? []).isEmpty }
print("Raster OCR and metadata: \(results.count) files; \(errors.count) errors; \(matches.count) matching files")
if !errors.isEmpty || !matches.isEmpty { print(errors); print(matches); exit(1) }
