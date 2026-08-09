(function () {
  "use strict";

  const TOKEN_ALIASES = {
    conjugates: "conjugate",
    conjugated: "conjugate",
    loci: "locus",
    roots: "root",
    derivatives: "derivative",
    tangents: "tangent",
    normals: "normal",
    asymptotes: "asymptote",
    equations: "equation",
    factors: "factor",
    remainders: "remainder",
    graphs: "graph",
    maxima: "maximum",
    minima: "minimum",
    demoivre: "de moivre",
    moivres: "moivre",
    moivre: "moivre"
  };

  function normalisePunctuation(value) {
    return String(value || "")
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[\u2018\u2019\u02bc\u2032`´]/g, "'")
      .replace(/\bde\s*['-]?\s*moivre(?:'s)?\b/g, "de moivre")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function canonicalTokens(value) {
    const initial = normalisePunctuation(value).split(" ").filter(Boolean);
    const tokens = [];
    initial.forEach(function (token) {
      const replacement = TOKEN_ALIASES[token] || token;
      replacement.split(" ").forEach(function (part) {
        if (part && tokens.indexOf(part) < 0) {
          tokens.push(part);
        }
      });
    });
    return tokens;
  }

  function normalise(value) {
    return canonicalTokens(value).join(" ");
  }

  function recordHaystack(record) {
    const base = normalise([
      record.type,
      record.title,
      record.description,
      record.keywords,
      record.year,
      record.standard
    ].join(" "));
    const additions = [];
    const verified = normalise(record.description + " " + record.keywords);
    if (/\bpolar\b/.test(verified) || /\bcis\b/.test(verified)) {
      additions.push("polar", "cis");
    }
    return normalise(base + " " + additions.join(" "));
  }

  function prepareRecord(record) {
    return Object.assign({}, record, { haystack: recordHaystack(record) });
  }

  function matches(record, query) {
    const tokens = canonicalTokens(query);
    if (!tokens.length) {
      return false;
    }
    const haystack = record.haystack || recordHaystack(record);
    const haystackTokens = haystack.split(" ").filter(Boolean);
    return tokens.every(function (token) {
      return haystackTokens.indexOf(token) >= 0;
    });
  }

  function score(record, query) {
    const tokens = canonicalTokens(query);
    const title = normalise(record.title);
    const description = normalise(record.description);
    const standard = normalise(record.standard);
    let value = 0;
    tokens.forEach(function (token) {
      if (title.indexOf(token) >= 0) value += 8;
      if (standard.indexOf(token) >= 0) value += 5;
      if (String(record.year || "") === token) value += 5;
      if (description.indexOf(token) >= 0) value += 3;
    });
    if ((record.haystack || recordHaystack(record)).indexOf(normalise(query)) >= 0) {
      value += 4;
    }
    return value;
  }

  function search(records, query, limit) {
    const maximum = Number.isFinite(limit) ? limit : 20;
    return records.filter(function (record) {
      return matches(record, query);
    }).map(function (record) {
      return { record: record, score: score(record, query) };
    }).sort(function (first, second) {
      return second.score - first.score
        || String(first.record.type).localeCompare(String(second.record.type))
        || String(first.record.title).localeCompare(String(second.record.title));
    }).slice(0, maximum).map(function (entry) {
      return entry.record;
    });
  }

  window.CalcNzSearch = {
    normalise: normalise,
    canonicalTokens: canonicalTokens,
    prepareRecord: prepareRecord,
    search: search
  };
}());
