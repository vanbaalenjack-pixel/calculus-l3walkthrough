(function () {
  "use strict";

  const TOKEN_ALIASES = {
    conjugates: "conjugate",
    conjugated: "conjugate",
    loci: "locus",
    roots: "root",
    derivatives: "conceptderivative",
    tangents: "tangent",
    normals: "normal",
    asymptotes: "asymptote",
    equations: "equation",
    factors: "factor",
    remainders: "remainder",
    graphs: "graph",
    maxima: "maximum",
    minima: "minimum",
    moivres: "moivre"
  };

  // Long, specific phrases must be replaced before their shorter components.
  // Opaque tokens let learners use familiar alternative terminology without
  // turning an isolated word such as "product" into a broad substring match.
  const PHRASE_ALIASES = [
    {
      token: "conceptnaturallogarithm",
      phrases: [
        "natural logarithms",
        "natural logarithm",
        "natural logs",
        "natural log",
        "logarithms",
        "logarithm",
        "ln"
      ]
    },
    {
      token: "conceptpartialfractions",
      phrases: [
        "rational function integration",
        "rational functions integration",
        "integration of rational functions",
        "partial fraction decomposition",
        "partial fractions"
      ]
    },
    {
      token: "conceptintegrationbyparts",
      phrases: [
        "product rule for integration",
        "product rule integration",
        "reverse product rule",
        "integrating by parts",
        "integration by parts"
      ]
    },
    {
      token: "conceptchainrule",
      phrases: [
        "composite function differentiation",
        "differentiating composite functions",
        "composite differentiation",
        "chain rule"
      ]
    },
    {
      token: "conceptimplicitderivative",
      phrases: ["implicit differentiation", "implicit derivative"]
    },
    {
      token: "conceptparametricderivative",
      phrases: ["parametric differentiation", "parametric derivative"]
    },
    {
      token: "conceptproductderivative",
      phrases: ["leibniz s rule", "leibniz rule", "product rule", "leibniz"]
    },
    {
      token: "conceptpolarform",
      phrases: [
        "roots of unity",
        "root of unity",
        "complex roots",
        "complex root",
        "de moivre theorem",
        "de moivre",
        "polar form",
        "cis form",
        "polar",
        "cis"
      ]
    },
    {
      token: "conceptstationaryoptimisation",
      phrases: [
        "stationary points",
        "stationary point",
        "turning points",
        "turning point",
        "stationary",
        "turning",
        "optimization",
        "optimisation"
      ]
    },
    {
      token: "conceptantiderivative",
      phrases: [
        "anti differentiation",
        "anti differentiate",
        "anti derivative",
        "antidifferentiation",
        "antidifferentiate",
        "antiderivatives",
        "antiderivative",
        "integrating",
        "integrated",
        "integrates",
        "integration"
      ]
    },
    {
      token: "conceptderivative",
      phrases: [
        "differentiated",
        "differentiating",
        "differentiation",
        "differentiates",
        "differentiate",
        "derivatives",
        "derivative"
      ]
    }
  ];

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

  function replacePhraseAliases(value) {
    let output = normalisePunctuation(value);
    PHRASE_ALIASES.forEach(function (group) {
      group.phrases.forEach(function (phrase) {
        const expression = new RegExp("\\b" + phrase.replace(/\s+/g, "\\s+") + "\\b", "g");
        output = output.replace(expression, " " + group.token + " ");
      });
    });
    return output.replace(/\s+/g, " ").trim();
  }

  function canonicalTokens(value) {
    const initial = replacePhraseAliases(value).split(" ").filter(Boolean);
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

  function normaliseIdentifier(value) {
    return normalisePunctuation(value).replace(/\s+/g, "-");
  }

  function normaliseFilterValue(name, value) {
    if (name === "year") {
      return String(value == null ? "" : value).trim();
    }
    const identifier = normaliseIdentifier(value);
    if (name === "level") {
      const match = identifier.match(/^(?:ncea-)?(?:level-?|l)?([23])$/);
      return match ? "level-" + match[1] : identifier;
    }
    return identifier;
  }

  function unique(values) {
    return values.filter(function (value, index, collection) {
      return value && collection.indexOf(value) === index;
    });
  }

  function valuesFrom(value) {
    if (Array.isArray(value)) {
      return value;
    }
    if (value == null || value === "") {
      return [];
    }
    return [value];
  }

  function standardCodes(record) {
    const source = [record.standardCode, record.standard, record.standardId, record.title].filter(Boolean).join(" ");
    return unique((source.match(/AS\d{5}/gi) || []).map(normaliseIdentifier));
  }

  function recordLevelValues(record) {
    const values = valuesFrom(record.levelId || record.level).map(function (value) {
      return normaliseFilterValue("level", value);
    });
    const source = [record.levelId, record.level, record.standardId, record.title].filter(Boolean).join(" ");
    const explicitLevels = source.match(/level[\s-]*[23]/gi) || [];
    explicitLevels.forEach(function (level) {
      values.push(normaliseFilterValue("level", level));
    });
    standardCodes(record).forEach(function (code) {
      if (code.indexOf("as912") === 0) values.push("level-2");
      if (code.indexOf("as915") === 0) values.push("level-3");
    });
    return unique(values);
  }

  function recordStandardValues(record) {
    const values = valuesFrom(record.standardId).concat(valuesFrom(record.standardCode)).map(normaliseIdentifier);
    return unique(values.concat(standardCodes(record)));
  }

  function recordYearValues(record) {
    return unique(valuesFrom(record.year).map(function (year) {
      return String(year).trim();
    }));
  }

  function recordSkillValues(record) {
    const values = valuesFrom(record.skillSlugs)
      .concat(valuesFrom(record.skillSlug))
      .concat(valuesFrom(record.skill))
      .map(normaliseIdentifier);
    const hrefMatch = String(record.href || "").match(/(?:^|\/)skill-([^/?#]+)\.html(?:[?#]|$)/i);
    if (hrefMatch) {
      values.push(normaliseIdentifier(hrefMatch[1]));
    }
    return unique(values);
  }

  function filterValues(record) {
    return {
      level: recordLevelValues(record),
      standard: recordStandardValues(record),
      year: recordYearValues(record),
      skill: recordSkillValues(record)
    };
  }

  function recordHaystack(record) {
    const numericStandardCodes = standardCodes(record).map(function (code) {
      return code.replace(/^as/, "");
    });
    return normalise([
      record.type,
      record.title,
      record.description,
      record.keywords,
      record.year,
      record.standard,
      record.standardCode,
      record.skillSlugs,
      numericStandardCodes
    ].join(" "));
  }

  function prepareRecord(record) {
    return Object.assign({}, record, {
      haystack: recordHaystack(record),
      filterValues: filterValues(record)
    });
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

  function matchesFilters(record, filters) {
    const activeFilters = filters || {};
    const available = record.filterValues || filterValues(record);
    return ["level", "standard", "year", "skill"].every(function (name) {
      const requested = valuesFrom(activeFilters[name]).map(function (value) {
        return normaliseFilterValue(name, value);
      }).filter(Boolean);
      if (!requested.length) {
        return true;
      }
      return requested.some(function (value) {
        return available[name].indexOf(value) >= 0;
      });
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
    if (tokens.length && (record.haystack || recordHaystack(record)).indexOf(normalise(query)) >= 0) {
      value += 4;
    }
    return value;
  }

  function search(records, query, limit, filters) {
    let maximum = limit;
    let activeFilters = filters;
    if (limit && typeof limit === "object") {
      activeFilters = limit;
      maximum = undefined;
    }
    maximum = Number.isFinite(maximum) ? maximum : 20;
    const hasQuery = canonicalTokens(query).length > 0;
    const hasFilters = ["level", "standard", "year", "skill"].some(function (name) {
      return valuesFrom((activeFilters || {})[name]).some(function (value) {
        return Boolean(String(value == null ? "" : value).trim());
      });
    });
    if (!hasQuery && !hasFilters) {
      return [];
    }
    return records.filter(function (record) {
      return (!hasQuery || matches(record, query)) && matchesFilters(record, activeFilters);
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
    matches: matches,
    matchesFilters: matchesFilters,
    search: search
  };
}());
