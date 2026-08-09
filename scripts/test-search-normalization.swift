#!/usr/bin/env swift

import Foundation
import JavaScriptCore

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let coreURL = root.appendingPathComponent("search-core.js")
let catalogueURL = root.appendingPathComponent("question-catalogue.js")

guard let context = JSContext() else {
    fputs("Could not create JavaScriptCore context.\n", stderr)
    exit(1)
}

var javascriptError: String?
context.exceptionHandler = { _, exception in
    javascriptError = exception?.toString() ?? "Unknown JavaScript exception"
}
context.evaluateScript("var window = this;")

for url in [coreURL, catalogueURL] {
    do {
        context.evaluateScript(try String(contentsOf: url, encoding: .utf8), withSourceURL: url)
    } catch {
        fputs("Could not read \(url.lastPathComponent): \(error)\n", stderr)
        exit(1)
    }
    if let javascriptError {
        fputs("\(url.lastPathComponent): \(javascriptError)\n", stderr)
        exit(1)
    }
}

let harness = #"""
(function () {
  const records = [];
  (window.CALC_NZ_QUESTION_CATALOGUE.levels || []).forEach(function (level) {
    (level.standards || []).forEach(function (standard) {
      (standard.papers || []).forEach(function (paper) {
        (paper.questions || []).forEach(function (question) {
          records.push(window.CalcNzSearch.prepareRecord({
            type: "Question",
            title: question.label + " · " + (question.methodTitle || question.method),
            description: question.methodPlain || question.method,
            href: question.href,
            year: paper.year,
            standard: standard.code + " " + standard.label,
            keywords: Array.isArray(question.skillSlugs) ? question.skillSlugs.join(" ") : ""
          }));
        });
      });
    });
  });

  function hrefs(query) {
    return window.CalcNzSearch.search(records, query, 1000)
      .map(function (record) { return record.href; })
      .sort();
  }

  const pairs = [
    ["conjugate", "conjugates"],
    ["locus", "loci"],
    ["De Moivre", "de-moivre's"],
    ["De Moivre", "demoivre"],
    ["polar", "cis"],
    ["  CONJUGATE!!  ", "conjugate"]
  ];
  const pairResults = pairs.map(function (pair) {
    const first = hrefs(pair[0]);
    const second = hrefs(pair[1]);
    return {
      firstQuery: pair[0],
      secondQuery: pair[1],
      first: first,
      second: second,
      equal: JSON.stringify(first) === JSON.stringify(second),
      nonempty: first.length > 0
    };
  });
  const fuzzyOnly = window.CalcNzSearch.prepareRecord({
    type: "Question",
    title: "Unrelated algebra",
    description: "Using a formula",
    href: "synthetic.html"
  });
  return JSON.stringify({
    pairs: pairResults,
    avoidsSubstringMatch: window.CalcNzSearch.search([fuzzyOnly], "sin", 10).length === 0
  });
}());
"""#

guard let encoded = context.evaluateScript(harness)?.toString(),
      let data = encoded.data(using: .utf8),
      let payload = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
      let results = payload["pairs"] as? [[String: Any]] else {
    fputs("Search test harness returned invalid data.\n", stderr)
    exit(1)
}

if payload["avoidsSubstringMatch"] as? Bool != true {
    failures.append("search matched the token sin inside the unrelated word using")
}

var failures: [String] = []
for result in results {
    let first = result["firstQuery"] as? String ?? "?"
    let second = result["secondQuery"] as? String ?? "?"
    if result["nonempty"] as? Bool != true {
        failures.append("\(first) produced no relevant results")
    }
    if result["equal"] as? Bool != true {
        let firstResults = result["first"] as? [String] ?? []
        let secondResults = result["second"] as? [String] ?? []
        failures.append("\(first) and \(second) differed (\(firstResults.count) vs \(secondResults.count))")
    }
}

if !failures.isEmpty {
    failures.forEach { fputs("FAIL: \($0)\n", stderr) }
    exit(1)
}

print("Search normalization passed: \(results.count) equivalent non-empty query pairs and exact-token matching.")
