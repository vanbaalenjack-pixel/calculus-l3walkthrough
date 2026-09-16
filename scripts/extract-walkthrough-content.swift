#!/usr/bin/env swift

import CryptoKit
import Foundation
import JavaScriptCore

private let expectedRouteCount = 447
private let expectedPhysicalPageCount = 335
private let expectedQueryRouteCount = 120
private let expectedExternalRouteCount = 420
private let expectedInlineRouteCount = 27
private let expectedExternalDataFileCount = 28
private let sharedAuditOverlayFile = "walkthrough-audit-data.js"

private enum ExtractorError: Error, CustomStringConvertible {
    case message(String)

    var description: String {
        switch self {
        case .message(let message):
            return message
        }
    }
}

private struct CatalogueRoute {
    let href: String
    let pageFile: String
    let standardID: String
    let paperID: String
    let questionID: String
}

private struct PageSource {
    let dataFile: String?
    let inlineScript: String?
}

private func fail(_ message: String) throws -> Never {
    throw ExtractorError.message(message)
}

private func repoRoot() throws -> URL {
    let arguments = Array(CommandLine.arguments.dropFirst())
    if !arguments.isEmpty {
        guard arguments.count == 2, arguments[0] == "--root" else {
            try fail("Usage: swift scripts/extract-walkthrough-content.swift [--root REPOSITORY]")
        }
        return URL(fileURLWithPath: arguments[1], isDirectory: true).standardizedFileURL
    }

    let currentDirectory = URL(
        fileURLWithPath: FileManager.default.currentDirectoryPath,
        isDirectory: true
    ).standardizedFileURL
    if FileManager.default.fileExists(
        atPath: currentDirectory.appendingPathComponent("question-catalogue.js").path
    ) {
        return currentDirectory
    }

    let scriptPath = URL(fileURLWithPath: #filePath)
    let absoluteScriptPath = scriptPath.path.hasPrefix("/")
        ? scriptPath
        : currentDirectory.appendingPathComponent(scriptPath.path)
    let inferredRoot = absoluteScriptPath
        .standardizedFileURL
        .deletingLastPathComponent()
        .deletingLastPathComponent()
    guard FileManager.default.fileExists(
        atPath: inferredRoot.appendingPathComponent("question-catalogue.js").path
    ) else {
        try fail("Could not locate question-catalogue.js; run from the repository root or pass --root.")
    }
    return inferredRoot
}

private func readData(_ url: URL) throws -> Data {
    do {
        return try Data(contentsOf: url)
    } catch {
        try fail("Could not read \(url.path): \(error.localizedDescription)")
    }
}

private func readText(_ url: URL) throws -> String {
    let data = try readData(url)
    guard let text = String(data: data, encoding: .utf8) else {
        try fail("Expected UTF-8 text in \(url.path)")
    }
    return text
}

private func sha256(_ data: Data) -> String {
    let digest = SHA256.hash(data: data)
    return "sha256:" + digest.map { String(format: "%02x", $0) }.joined()
}

private func captureGroups(
    pattern: String,
    in text: String,
    options: NSRegularExpression.Options = []
) throws -> [[String]] {
    let expression = try NSRegularExpression(pattern: pattern, options: options)
    let fullRange = NSRange(text.startIndex..<text.endIndex, in: text)
    return expression.matches(in: text, range: fullRange).map { match in
        (1..<match.numberOfRanges).map { index in
            let range = match.range(at: index)
            guard range.location != NSNotFound, let swiftRange = Range(range, in: text) else {
                return ""
            }
            return String(text[swiftRange])
        }
    }
}

private func catalogueRoutes(root: URL) throws -> [CatalogueRoute] {
    let catalogueURL = root.appendingPathComponent("question-catalogue.js")
    let source = try readText(catalogueURL)
    let assignment = "window.CALC_NZ_QUESTION_CATALOGUE ="
    guard let assignmentRange = source.range(of: assignment) else {
        try fail("question-catalogue.js does not contain the expected catalogue assignment.")
    }

    let remainder = source[assignmentRange.upperBound...]
    guard let terminator = remainder.lastIndex(of: ";") else {
        try fail("question-catalogue.js catalogue assignment has no terminating semicolon.")
    }
    let jsonText = String(remainder[..<terminator]).trimmingCharacters(in: .whitespacesAndNewlines)
    guard let jsonData = jsonText.data(using: .utf8),
          let catalogue = try JSONSerialization.jsonObject(with: jsonData) as? [String: Any],
          let levels = catalogue["levels"] as? [[String: Any]] else {
        try fail("question-catalogue.js does not contain a JSON-compatible levels array.")
    }

    var routes: [CatalogueRoute] = []
    var seenHrefs = Set<String>()

    for level in levels {
        guard let standards = level["standards"] as? [[String: Any]] else {
            try fail("A catalogue level is missing its standards array.")
        }
        for standard in standards {
            guard let standardID = standard["id"] as? String,
                  let papers = standard["papers"] as? [[String: Any]] else {
                try fail("A catalogue standard is missing id or papers.")
            }
            for paper in papers {
                guard let paperID = paper["id"] as? String,
                      let questions = paper["questions"] as? [[String: Any]] else {
                    try fail("A catalogue paper under \(standardID) is missing id or questions.")
                }
                for question in questions {
                    guard let questionID = question["id"] as? String,
                          let href = question["href"] as? String,
                          !questionID.isEmpty,
                          !href.isEmpty else {
                        try fail("A catalogue question under \(paperID) is missing id or href.")
                    }
                    guard seenHrefs.insert(href).inserted else {
                        try fail("Duplicate logical route in question-catalogue.js: \(href)")
                    }
                    let pageFile = href.split(whereSeparator: { $0 == "?" || $0 == "#" }).first.map(String.init) ?? ""
                    guard !pageFile.isEmpty else {
                        try fail("Could not resolve a physical page for logical route \(href)")
                    }
                    routes.append(CatalogueRoute(
                        href: href,
                        pageFile: pageFile,
                        standardID: standardID,
                        paperID: paperID,
                        questionID: questionID
                    ))
                }
            }
        }
    }

    guard routes.count == expectedRouteCount else {
        try fail("Expected \(expectedRouteCount) catalogue routes, found \(routes.count).")
    }
    let queryCount = routes.filter { $0.href.contains("?") }.count
    guard queryCount == expectedQueryRouteCount else {
        try fail("Expected \(expectedQueryRouteCount) query routes, found \(queryCount).")
    }
    let physicalPageCount = Set(routes.map(\.pageFile)).count
    guard physicalPageCount == expectedPhysicalPageCount else {
        try fail("Expected \(expectedPhysicalPageCount) physical walkthrough pages, found \(physicalPageCount).")
    }
    return routes
}

private func pageSource(pageFile: String, root: URL) throws -> PageSource {
    let pageURL = root.appendingPathComponent(pageFile)
    let html = try readText(pageURL)
    let scriptTags = try captureGroups(
        pattern: #"<script\b([^>]*)>([\s\S]*?)</script\s*>"#,
        in: html,
        options: [.caseInsensitive]
    )

    var dataFiles: [String] = []
    var configScripts: [String] = []
    let sourcePattern = try NSRegularExpression(
        pattern: #"\bsrc\s*=\s*["']([^"']+)["']"#,
        options: [.caseInsensitive]
    )

    for groups in scriptTags {
        let attributes = groups[0]
        let body = groups[1]
        let attributeRange = NSRange(attributes.startIndex..<attributes.endIndex, in: attributes)
        if let match = sourcePattern.firstMatch(in: attributes, range: attributeRange),
           let valueRange = Range(match.range(at: 1), in: attributes) {
            let rawSource = String(attributes[valueRange])
            let sourceWithoutQuery = rawSource.split(whereSeparator: { $0 == "?" || $0 == "#" }).first.map(String.init) ?? ""
            let fileName = URL(fileURLWithPath: sourceWithoutQuery).lastPathComponent
            if fileName.hasSuffix("-data.js") && fileName != sharedAuditOverlayFile {
                dataFiles.append(fileName)
            }
            continue
        }

        if body.contains("initializeProgressiveWalkthrough(") {
            configScripts.append(body)
        }
    }

    guard dataFiles.count <= 1 else {
        try fail("\(pageFile) references multiple walkthrough data files: \(dataFiles.joined(separator: ", "))")
    }
    if let dataFile = dataFiles.first {
        guard configScripts.isEmpty else {
            try fail("\(pageFile) mixes an external walkthrough data file with an inline progressive config.")
        }
        return PageSource(dataFile: dataFile, inlineScript: nil)
    }

    guard configScripts.count == 1 else {
        try fail("Expected one inline walkthrough config in \(pageFile), found \(configScripts.count).")
    }
    return PageSource(dataFile: nil, inlineScript: configScripts[0])
}

private let projectionJavaScript = #"""
function __calcElementStubs(markup) {
  var elements = Object.create(null);
  var tagPattern = /<([a-z][a-z0-9:-]*)\b([^>]*\bid\s*=\s*(["'])([^"']+)\3[^>]*)>/gi;
  var match;
  while ((match = tagPattern.exec(String(markup || "")))) {
    var attributes = match[2];
    var valueMatch = attributes.match(/\bvalue\s*=\s*(["'])(.*?)\1/i);
    elements[match[4]] = {
      id: match[4],
      tagName: match[1].toLowerCase(),
      innerHTML: "",
      textContent: "",
      value: valueMatch ? valueMatch[2] : "",
      checked: /\bchecked\b/i.test(attributes),
      addEventListener: function () {},
      removeEventListener: function () {},
      setAttribute: function (name, value) { this[name] = String(value); },
      getAttribute: function (name) {
        return Object.prototype.hasOwnProperty.call(this, name) ? this[name] : null;
      }
    };
  }
  return elements;
}

function __calcConfigMarkup(config) {
  var chunks = [config.questionHtml, config.answerHtml];
  ["focus", "tip", "hint"].forEach(function (field) {
    var value = config[field];
    if (typeof value === "string") chunks.push(value);
  });
  ["tips", "hints"].forEach(function (field) {
    if (!Array.isArray(config[field])) return;
    config[field].forEach(function (value) {
      if (typeof value === "string") chunks.push(value);
      else if (value && typeof value === "object") {
        ["html", "text", "content", "body"].forEach(function (key) {
          if (typeof value[key] === "string") chunks.push(value[key]);
        });
      }
    });
  });
  if (Array.isArray(config.guidedSteps)) {
    config.guidedSteps.forEach(function (step) {
      if (!step || typeof step !== "object") return;
      Object.keys(step).forEach(function (key) {
        if (typeof step[key] === "string" && /html$/i.test(key)) chunks.push(step[key]);
      });
    });
  }
  return chunks.join("\n");
}

function __calcEscapeText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function __calcEscapePattern(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function __calcRenderInitialQuestion(config) {
  if (typeof config.afterRender !== "function") {
    return { html: config.questionHtml, count: 0 };
  }
  var elements = __calcElementStubs(__calcConfigMarkup(config));
  var questionElements = __calcElementStubs(config.questionHtml);
  var originalDocument = document;
  document = {
    getElementById: function (id) { return elements[id] || null; },
    addEventListener: function () {}
  };
  try {
    config.afterRender();
  } finally {
    document = originalDocument;
  }

  var html = config.questionHtml;
  var count = 0;
  Object.keys(questionElements).forEach(function (id) {
    var element = elements[id];
    if (!element) return;
    var content = element.innerHTML || (
      element.textContent ? __calcEscapeText(element.textContent) : ""
    );
    if (!content) return;
    var tag = __calcEscapePattern(element.tagName);
    var escapedId = __calcEscapePattern(id);
    var pattern = new RegExp(
      "(<" + tag + "\\b[^>]*\\bid\\s*=\\s*[\\\"']" + escapedId + "[\\\"'][^>]*>)[\\s\\S]*?(</" + tag + "\\s*>)",
      "i"
    );
    if (pattern.test(html)) {
      html = html.replace(pattern, "$1" + content + "$2");
      count += 1;
    }
  });
  return { html: html, count: count };
}

function __calcExtractWalkthrough(config) {
  function requiredString(value, label) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(label + " must be a non-empty string");
    }
    return value;
  }

  function supportValue(value) {
    if (typeof value === "string" && value.trim() !== "") return value;
    if (value && typeof value === "object") {
      var fields = ["html", "text", "content", "body"];
      for (var index = 0; index < fields.length; index += 1) {
        var candidate = value[fields[index]];
        if (typeof candidate === "string" && candidate.trim() !== "") return candidate;
      }
    }
    return null;
  }

  if (!config || typeof config !== "object") {
    throw new Error("walkthrough config is missing");
  }

  var supportKind = null;
  var supportHtml = supportValue(config.focus);
  if (supportHtml) supportKind = "focus";

  if (!supportHtml) {
    supportHtml = supportValue(config.tip);
    if (supportHtml) supportKind = "tip";
  }
  if (!supportHtml && Array.isArray(config.tips) && config.tips.length) {
    supportHtml = supportValue(config.tips[0]);
    if (supportHtml) supportKind = "tip";
  }
  if (!supportHtml) {
    supportHtml = supportValue(config.hint);
    if (supportHtml) supportKind = "hint";
  }
  if (!supportHtml && Array.isArray(config.hints) && config.hints.length) {
    supportHtml = supportValue(config.hints[0]);
    if (supportHtml) supportKind = "hint";
  }
  if (!supportHtml) throw new Error("config has no focus, tip, or hint content");

  if (!Array.isArray(config.guidedSteps) || !config.guidedSteps.length) {
    throw new Error("config has no guided steps");
  }
  var firstStep = config.guidedSteps[0];
  if (!firstStep || typeof firstStep !== "object") {
    throw new Error("first guided step is not an object");
  }

  var hasAfterRender = Object.prototype.hasOwnProperty.call(config, "afterRender")
    && config.afterRender !== null
    && typeof config.afterRender !== "undefined";
  if (hasAfterRender && typeof config.afterRender !== "function") {
    throw new Error("afterRender is present but is not a function");
  }
  var renderedQuestion = __calcRenderInitialQuestion(config);

  return {
    questionHtml: requiredString(renderedQuestion.html, "questionHtml"),
    firstSupport: {
      kind: supportKind,
      html: supportHtml
    },
    firstGuidedStep: {
      title: requiredString(firstStep.title, "first guided-step title"),
      previewHtml: requiredString(firstStep.previewHtml, "first guided-step previewHtml"),
      workingHtml: requiredString(firstStep.workingHtml, "first guided-step workingHtml")
    },
    hasAfterRender: hasAfterRender,
    renderedQuestionElementCount: renderedQuestion.count
  };
}
"""#

private func context(for sourceName: String) throws -> JSContext {
    guard let context = JSContext() else {
        try fail("Could not create a JavaScriptCore context for \(sourceName).")
    }
    var exceptionMessage: String?
    context.exceptionHandler = { _, exception in
        exceptionMessage = exception?.toString() ?? "Unknown JavaScript exception"
    }
    context.evaluateScript(projectionJavaScript)
    if let exceptionMessage {
        try fail("JavaScript bootstrap failed for \(sourceName): \(exceptionMessage)")
    }
    return context
}

private func evaluate(
    _ source: String,
    in context: JSContext,
    sourceURL: URL,
    sourceName: String
) throws {
    var exceptionMessage: String?
    context.exceptionHandler = { _, exception in
        exceptionMessage = exception?.toString() ?? "Unknown JavaScript exception"
    }
    context.evaluateScript(source, withSourceURL: sourceURL)
    if let exceptionMessage {
        try fail("JavaScript evaluation failed for \(sourceName): \(exceptionMessage)")
    }
}

private func jsonString(from context: JSContext, expression: String, label: String) throws -> String {
    var exceptionMessage: String?
    context.exceptionHandler = { _, exception in
        exceptionMessage = exception?.toString() ?? "Unknown JavaScript exception"
    }
    let value = context.evaluateScript(expression)
    if let exceptionMessage {
        try fail("JavaScript extraction failed for \(label): \(exceptionMessage)")
    }
    guard let json = value?.toString(), !json.isEmpty, json != "undefined" else {
        try fail("JavaScript extraction returned no JSON for \(label).")
    }
    return json
}

private func quotedJavaScriptString(_ value: String) throws -> String {
    let data = try JSONSerialization.data(withJSONObject: [value])
    guard var encoded = String(data: data, encoding: .utf8) else {
        try fail("Could not encode a JavaScript string literal.")
    }
    encoded.removeFirst()
    encoded.removeLast()
    return encoded
}

private func jsonObject(_ json: String, label: String) throws -> [String: Any] {
    guard let data = json.data(using: .utf8),
          let object = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
        try fail("Extracted content for \(label) was not a JSON object.")
    }
    return object
}

private func externalConfigKeys(
    context: JSContext,
    globalName: String,
    sourceName: String
) throws -> [String] {
    let quotedGlobal = try quotedJavaScriptString(globalName)
    let json = try jsonString(
        from: context,
        expression: "JSON.stringify(Object.keys(window[\(quotedGlobal)] || {}).sort())",
        label: sourceName
    )
    guard let data = json.data(using: .utf8),
          let keys = try JSONSerialization.jsonObject(with: data) as? [String] else {
        try fail("Could not read walkthrough keys from \(sourceName).")
    }
    return keys
}

private func externalGlobalName(context: JSContext, sourceName: String) throws -> String {
    let json = try jsonString(
        from: context,
        expression: #"JSON.stringify(Object.keys(window).filter(function (key) { return /Walkthroughs$/.test(key); }).sort())"#,
        label: sourceName
    )
    guard let data = json.data(using: .utf8),
          let names = try JSONSerialization.jsonObject(with: data) as? [String],
          names.count == 1,
          let name = names.first else {
        try fail("Expected exactly one *Walkthroughs global from \(sourceName), found \(json).")
    }
    return name
}

private func projectExternalConfig(
    context: JSContext,
    globalName: String,
    questionID: String,
    label: String
) throws -> [String: Any] {
    let quotedGlobal = try quotedJavaScriptString(globalName)
    let quotedQuestion = try quotedJavaScriptString(questionID)
    let json = try jsonString(
        from: context,
        expression: "JSON.stringify(__calcExtractWalkthrough(window[\(quotedGlobal)][\(quotedQuestion)]))",
        label: label
    )
    return try jsonObject(json, label: label)
}

private func inlineContext(script: String, pageURL: URL, pageFile: String) throws -> JSContext {
    let context = try context(for: pageFile)
    let bootstrap = #"""
var window = {};
var document = {
  addEventListener: function (name, callback) {
    if (name === "DOMContentLoaded") callback();
  }
};
window.__capturedConfig = null;
window.__captureCount = 0;
function __captureWalkthrough(config) {
  window.__capturedConfig = config;
  window.__captureCount += 1;
}
function initializeProgressiveWalkthrough(config) { __captureWalkthrough(config); }
function initializeDifferentiationWalkthrough(config) { __captureWalkthrough(config); }
function initializeComplexWalkthrough(config) { __captureWalkthrough(config); }
function initializeAlgebraWalkthrough(config) { __captureWalkthrough(config); }
function renderMath() {}
"""#
    try evaluate(bootstrap, in: context, sourceURL: pageURL, sourceName: "\(pageFile) bootstrap")
    try evaluate(script, in: context, sourceURL: pageURL, sourceName: pageFile)

    let captureCountJSON = try jsonString(
        from: context,
        expression: "JSON.stringify(window.__captureCount)",
        label: pageFile
    )
    guard captureCountJSON == "1" else {
        try fail("Expected one walkthrough initializer call in \(pageFile), found \(captureCountJSON).")
    }
    return context
}

private func projectInlineConfig(context: JSContext, label: String) throws -> [String: Any] {
    let json = try jsonString(
        from: context,
        expression: "JSON.stringify(__calcExtractWalkthrough(window.__capturedConfig))",
        label: label
    )
    return try jsonObject(json, label: label)
}

private func symmetricDifference(_ lhs: Set<String>, _ rhs: Set<String>) -> String {
    let missing = rhs.subtracting(lhs).sorted()
    let extra = lhs.subtracting(rhs).sorted()
    var parts: [String] = []
    if !missing.isEmpty { parts.append("missing: \(missing.joined(separator: ", "))") }
    if !extra.isEmpty { parts.append("unexpected: \(extra.joined(separator: ", "))") }
    return parts.joined(separator: "; ")
}

private func run() throws {
    let root = try repoRoot()
    let routes = try catalogueRoutes(root: root)

    var pageSources: [String: PageSource] = [:]
    for pageFile in Set(routes.map(\.pageFile)).sorted() {
        pageSources[pageFile] = try pageSource(pageFile: pageFile, root: root)
    }

    let externalRoutes = routes.filter { pageSources[$0.pageFile]?.dataFile != nil }
    let inlineRoutes = routes.filter { pageSources[$0.pageFile]?.inlineScript != nil }
    guard externalRoutes.count == expectedExternalRouteCount else {
        try fail("Expected \(expectedExternalRouteCount) external-data routes, found \(externalRoutes.count).")
    }
    guard inlineRoutes.count == expectedInlineRouteCount else {
        try fail("Expected \(expectedInlineRouteCount) inline-config routes, found \(inlineRoutes.count).")
    }

    let referencedDataFiles = Set(externalRoutes.compactMap { pageSources[$0.pageFile]?.dataFile })
    let onDiskDataFiles = Set(
        try FileManager.default.contentsOfDirectory(atPath: root.path)
            .filter { $0.hasSuffix("-data.js") && $0 != sharedAuditOverlayFile }
    )
    guard referencedDataFiles == onDiskDataFiles else {
        try fail("Walkthrough data-file coverage mismatch (\(symmetricDifference(referencedDataFiles, onDiskDataFiles))).")
    }
    guard referencedDataFiles.count == expectedExternalDataFileCount else {
        try fail("Expected \(expectedExternalDataFileCount) external data files, found \(referencedDataFiles.count).")
    }

    var result: [String: Any] = [:]
    var usedConfigSources = Set<String>()

    for dataFile in referencedDataFiles.sorted() {
        let dataURL = root.appendingPathComponent(dataFile)
        let sourceData = try readData(dataURL)
        guard let source = String(data: sourceData, encoding: .utf8) else {
            try fail("Expected UTF-8 text in \(dataFile).")
        }
        let context = try context(for: dataFile)
        try evaluate("var window = {}; var document;", in: context, sourceURL: dataURL, sourceName: "\(dataFile) bootstrap")
        try evaluate(source, in: context, sourceURL: dataURL, sourceName: dataFile)
        let globalName = try externalGlobalName(context: context, sourceName: dataFile)

        let expectedForFile = externalRoutes.filter { pageSources[$0.pageFile]?.dataFile == dataFile }
        let expectedKeys = Set(expectedForFile.map(\.questionID))
        let actualKeys = Set(try externalConfigKeys(context: context, globalName: globalName, sourceName: dataFile))
        guard actualKeys == expectedKeys else {
            try fail("Question-key mismatch in \(dataFile) (\(symmetricDifference(actualKeys, expectedKeys))).")
        }

        let digest = sha256(sourceData)
        for route in expectedForFile.sorted(by: { $0.href < $1.href }) {
            let configIdentity = "\(dataFile)#\(route.questionID)"
            guard usedConfigSources.insert(configIdentity).inserted else {
                try fail("Duplicate external config ownership: \(configIdentity)")
            }
            var record = try projectExternalConfig(
                context: context,
                globalName: globalName,
                questionID: route.questionID,
                label: route.href
            )
            record["standardId"] = route.standardID
            record["paperId"] = route.paperID
            record["questionId"] = route.questionID
            record["pageFile"] = route.pageFile
            record["configSource"] = dataFile
            record["sourceDigest"] = digest
            guard result.updateValue(record, forKey: route.href) == nil else {
                try fail("Duplicate extracted logical route: \(route.href)")
            }
        }
    }

    for route in inlineRoutes.sorted(by: { $0.href < $1.href }) {
        guard let script = pageSources[route.pageFile]?.inlineScript else {
            try fail("Lost inline config source for \(route.href).")
        }
        let configIdentity = "\(route.pageFile)#inline-config"
        guard usedConfigSources.insert(configIdentity).inserted else {
            try fail("Duplicate inline config ownership: \(configIdentity)")
        }
        let pageURL = root.appendingPathComponent(route.pageFile)
        let context = try inlineContext(script: script, pageURL: pageURL, pageFile: route.pageFile)
        var record = try projectInlineConfig(context: context, label: route.href)
        record["standardId"] = route.standardID
        record["paperId"] = route.paperID
        record["questionId"] = route.questionID
        record["pageFile"] = route.pageFile
        record["configSource"] = "\(route.pageFile)#inline-config"
        record["sourceDigest"] = sha256(try readData(pageURL))
        guard result.updateValue(record, forKey: route.href) == nil else {
            try fail("Duplicate extracted logical route: \(route.href)")
        }
    }

    guard result.count == expectedRouteCount else {
        let missing = Set(routes.map(\.href)).subtracting(result.keys).sorted()
        try fail("Expected \(expectedRouteCount) extracted routes, found \(result.count); missing: \(missing.joined(separator: ", ")).")
    }
    guard JSONSerialization.isValidJSONObject(result) else {
        try fail("Extracted walkthrough records cannot be encoded as JSON.")
    }
    let output = try JSONSerialization.data(
        withJSONObject: result,
        options: [.prettyPrinted, .sortedKeys, .withoutEscapingSlashes]
    )
    FileHandle.standardOutput.write(output)
    FileHandle.standardOutput.write(Data("\n".utf8))
}

do {
    try run()
} catch {
    FileHandle.standardError.write(Data("walkthrough content extraction failed: \(error)\n".utf8))
    exit(1)
}
