(function () {
  const DEFAULT_TOLERANCE = 1e-9;
  const UNICODE_SUPERSCRIPT_MAP = {
    "⁰": "0",
    "¹": "1",
    "²": "2",
    "³": "3",
    "⁴": "4",
    "⁵": "5",
    "⁶": "6",
    "⁷": "7",
    "⁸": "8",
    "⁹": "9",
    "⁺": "+",
    "⁻": "-"
  };

  function replaceSimpleLatexFractions(value) {
    let result = value;
    let previousResult = "";

    while (result !== previousResult) {
      previousResult = result;
      result = result.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, "(($1)/($2))");
    }

    return result;
  }

  function replaceUnicodeSuperscripts(value) {
    return value.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, function (match, offset, fullValue) {
      const translated = match.split("").map(function (character) {
        return UNICODE_SUPERSCRIPT_MAP[character] || "";
      }).join("");

      if (!translated) {
        return match;
      }

      if (offset > 0 && fullValue[offset - 1] === "^") {
        return translated.length > 1 ? "(" + translated + ")" : translated;
      }

      return "^" + (translated.length > 1 ? "(" + translated + ")" : translated);
    });
  }

  function normaliseMathInput(value) {
    if (!value) {
      return "";
    }

    let normalised = value.toLowerCase();
    normalised = normalised.replace(/[−–—]/g, "-");
    normalised = normalised.replace(/[×⋅·]/g, "*");
    normalised = normalised.replace(/[÷∕]/g, "/");
    normalised = replaceUnicodeSuperscripts(normalised);
    normalised = normalised.replace(/\\left|\\right/g, "");
    normalised = normalised.replace(/\\sqrt\s*\{([^{}]+)\}/g, "sqrt($1)");
    normalised = normalised.replace(/\\ln\s*\{([^{}]+)\}/g, "\\ln($1)");
    normalised = normalised.replace(/\\sin\s*\{([^{}]+)\}/g, "\\sin($1)");
    normalised = normalised.replace(/\\cos\s*\{([^{}]+)\}/g, "\\cos($1)");
    normalised = normalised.replace(/\\tan\s*\{([^{}]+)\}/g, "\\tan($1)");
    normalised = normalised.replace(/ln\s*\{([^{}]+)\}/g, "ln($1)");
    normalised = normalised.replace(/sin\s*\{([^{}]+)\}/g, "sin($1)");
    normalised = normalised.replace(/cos\s*\{([^{}]+)\}/g, "cos($1)");
    normalised = normalised.replace(/tan\s*\{([^{}]+)\}/g, "tan($1)");
    normalised = replaceSimpleLatexFractions(normalised);
    normalised = normalised.replace(/[{}\[\]]/g, function (character) {
      return character === "{" || character === "[" ? "(" : ")";
    });
    normalised = normalised.replace(/\\cdot|\\times/g, "*");
    normalised = normalised.replace(/\\div/g, "/");
    normalised = normalised.replace(/\\pi/g, "pi");
    normalised = normalised.replace(/\\ln/g, "ln");
    normalised = normalised.replace(/\\sin/g, "sin");
    normalised = normalised.replace(/\\cos/g, "cos");
    normalised = normalised.replace(/\\tan/g, "tan");
    normalised = normalised.replace(/\s+/g, "");
    normalised = normalised.replace(/\b(ln|sin|cos|tan|sqrt)([a-z])(?![a-z])/g, "$1($2)");

    return normalised;
  }

  function splitTopLevel(value, delimiter) {
    const parts = [];
    let depth = 0;
    let current = "";

    for (let index = 0; index < value.length; index += 1) {
      const character = value[index];

      if (character === "(") {
        depth += 1;
      } else if (character === ")") {
        depth -= 1;
        if (depth < 0) {
          return null;
        }
      }

      if (character === delimiter && depth === 0) {
        parts.push(current);
        current = "";
        continue;
      }

      current += character;
    }

    if (depth !== 0) {
      return null;
    }

    parts.push(current);
    return parts;
  }

  function stripOuterParens(value) {
    if (!value || value[0] !== "(" || value[value.length - 1] !== ")") {
      return value;
    }

    let depth = 0;
    for (let index = 0; index < value.length; index += 1) {
      const character = value[index];

      if (character === "(") {
        depth += 1;
      } else if (character === ")") {
        depth -= 1;
      }

      if (depth === 0 && index < value.length - 1) {
        return value;
      }
    }

    return value.slice(1, -1);
  }

  function tokenizeMathExpression(value) {
    const tokens = [];
    let index = 0;
    const functionNames = ["sqrt", "sin", "cos", "tan", "exp", "ln"];
    const constantNames = ["pi", "e"];

    while (index < value.length) {
      const character = value[index];

      if (/\d|\./.test(character)) {
        let number = character;
        index += 1;

        while (index < value.length && /[\d.]/.test(value[index])) {
          number += value[index];
          index += 1;
        }

        if ((number.match(/\./g) || []).length > 1) {
          return null;
        }

        tokens.push({ type: "number", value: number });
        continue;
      }

      if (/[a-z]/.test(character)) {
        const remainingText = value.slice(index);
        const functionName = functionNames.find(function (name) {
          return remainingText.startsWith(name);
        });
        const constantName = constantNames.find(function (name) {
          return remainingText.startsWith(name);
        });

        if (functionName) {
          tokens.push({ type: "function", value: functionName });
          index += functionName.length;
        } else if (constantName) {
          tokens.push({ type: "constant", value: constantName });
          index += constantName.length;
        } else {
          tokens.push({ type: "variable", value: character });
          index += 1;
        }
        continue;
      }

      if ("+-*/^".includes(character)) {
        tokens.push({ type: "operator", value: character });
        index += 1;
        continue;
      }

      if (character === "(") {
        tokens.push({ type: "open", value: character });
        index += 1;
        continue;
      }

      if (character === ")") {
        tokens.push({ type: "close", value: character });
        index += 1;
        continue;
      }

      return null;
    }

    return tokens;
  }

  function shouldInsertImplicitMultiplication(previousToken, currentToken) {
    if (!previousToken || !currentToken) {
      return false;
    }

    const leftCanMultiply = previousToken.type === "number"
      || previousToken.type === "variable"
      || previousToken.type === "constant"
      || previousToken.type === "close";
    const rightCanMultiply = currentToken.type === "number"
      || currentToken.type === "variable"
      || currentToken.type === "constant"
      || currentToken.type === "function"
      || currentToken.type === "open";

    return leftCanMultiply && rightCanMultiply;
  }

  function buildExpressionTokens(value) {
    const rawTokens = tokenizeMathExpression(value);
    if (!rawTokens) {
      return null;
    }

    const expressionTokens = [];

    rawTokens.forEach(function (token, index) {
      const previousToken = index > 0 ? rawTokens[index - 1] : null;

      if (shouldInsertImplicitMultiplication(previousToken, token)) {
        expressionTokens.push({ type: "operator", value: "*", implicit: true });
      }

      expressionTokens.push({ type: token.type, value: token.value, implicit: false });
    });

    return expressionTokens;
  }

  function parseMathExpression(value) {
    const normalised = normaliseMathInput(value);
    if (!normalised) {
      return null;
    }

    const tokens = buildExpressionTokens(normalised);
    if (!tokens) {
      return null;
    }

    let index = 0;

    function peek() {
      return tokens[index] || null;
    }

    function consume() {
      const token = tokens[index] || null;
      index += 1;
      return token;
    }

    function parseExpression() {
      return parseAddSubtract();
    }

    function parseAddSubtract() {
      let node = parseMultiplyDivide();
      if (!node) {
        return null;
      }

      while (peek() && peek().type === "operator" && (peek().value === "+" || peek().value === "-")) {
        const operatorToken = consume();
        const rightNode = parseMultiplyDivide();

        if (!rightNode) {
          return null;
        }

        node = {
          type: "binary",
          operator: operatorToken.value,
          implicit: false,
          left: node,
          right: rightNode
        };
      }

      return node;
    }

    function parseMultiplyDivide() {
      let node = parsePower();
      if (!node) {
        return null;
      }

      while (peek() && peek().type === "operator" && (peek().value === "*" || peek().value === "/")) {
        const operatorToken = consume();
        const rightNode = parsePower();

        if (!rightNode) {
          return null;
        }

        node = {
          type: "binary",
          operator: operatorToken.value,
          implicit: Boolean(operatorToken.implicit),
          left: node,
          right: rightNode
        };
      }

      return node;
    }

    function parsePower() {
      const leftNode = parseUnary();
      if (!leftNode) {
        return null;
      }

      if (peek() && peek().type === "operator" && peek().value === "^") {
        consume();
        const rightNode = parsePower();

        if (!rightNode) {
          return null;
        }

        return {
          type: "binary",
          operator: "^",
          implicit: false,
          left: leftNode,
          right: rightNode
        };
      }

      return leftNode;
    }

    function parseUnary() {
      if (peek() && peek().type === "operator" && (peek().value === "+" || peek().value === "-")) {
        const operatorToken = consume();
        const operand = parseUnary();

        if (!operand) {
          return null;
        }

        return {
          type: "unary",
          operator: operatorToken.value,
          operand: operand
        };
      }

      return parsePrimary();
    }

    function parsePrimary() {
      const token = peek();

      if (!token) {
        return null;
      }

      if (token.type === "number" || token.type === "variable" || token.type === "constant") {
        consume();
        return token;
      }

      if (token.type === "function") {
        consume();
        const argument = parsePrimary();

        if (!argument) {
          return null;
        }

        return {
          type: "function-call",
          name: token.value,
          argument: argument
        };
      }

      if (token.type === "open") {
        consume();
        const expression = parseExpression();

        if (!expression || !peek() || peek().type !== "close") {
          return null;
        }

        consume();
        return {
          type: "group",
          expression: expression
        };
      }

      return null;
    }

    const ast = parseExpression();

    if (!ast || index !== tokens.length) {
      return null;
    }

    return ast;
  }

  function getNodePrecedence(node) {
    if (!node) {
      return 0;
    }

    if (node.type === "group" || node.type === "number" || node.type === "variable" || node.type === "constant" || node.type === "function-call") {
      return 5;
    }

    if (node.type === "unary") {
      return 4;
    }

    if (node.type === "binary") {
      if (node.operator === "^") {
        return 3;
      }

      if (node.operator === "*" || node.operator === "/") {
        return 2;
      }

      return 1;
    }

    return 0;
  }

  function wrapLatexIfNeeded(node, latex, shouldWrap) {
    if (!shouldWrap) {
      return latex;
    }

    return "\\left(" + latex + "\\right)";
  }

  function astToLatex(node) {
    if (!node) {
      return null;
    }

    if (node.type === "number" || node.type === "variable") {
      return node.value;
    }

    if (node.type === "constant") {
      return node.value === "pi" ? "\\pi" : "e";
    }

    if (node.type === "group") {
      return "\\left(" + astToLatex(node.expression) + "\\right)";
    }

    if (node.type === "function-call") {
      const argumentNode = node.argument.type === "group" ? node.argument.expression : node.argument;
      const argumentLatex = astToLatex(argumentNode);

      if (node.name === "sqrt") {
        return "\\sqrt{" + argumentLatex + "}";
      }

      if (node.name === "exp") {
        return "e^{" + argumentLatex + "}";
      }

      return "\\" + node.name + "\\left(" + argumentLatex + "\\right)";
    }

    if (node.type === "unary") {
      const operandPrecedence = getNodePrecedence(node.operand);
      const operandLatex = astToLatex(node.operand);
      const wrappedOperand = wrapLatexIfNeeded(node.operand, operandLatex, operandPrecedence < getNodePrecedence(node));
      return node.operator === "+" ? wrappedOperand : "-" + wrappedOperand;
    }

    if (node.type !== "binary") {
      return null;
    }

    if (node.operator === "/") {
      return "\\frac{" + astToLatex(node.left) + "}{" + astToLatex(node.right) + "}";
    }

    if (node.operator === "^") {
      const baseLatex = astToLatex(node.left);
      const exponentLatex = astToLatex(node.right);
      const wrappedBase = wrapLatexIfNeeded(
        node.left,
        baseLatex,
        getNodePrecedence(node.left) < getNodePrecedence(node) || node.left.type === "unary"
      );

      return wrappedBase + "^{" + exponentLatex + "}";
    }

    const leftLatex = astToLatex(node.left);
    const rightLatex = astToLatex(node.right);
    const leftNeedsWrap = getNodePrecedence(node.left) < getNodePrecedence(node);
    const rightNeedsWrapForMultiply = getNodePrecedence(node.right) < getNodePrecedence(node);
    const rightNeedsWrapForSubtract = node.operator === "-" && node.right.type === "binary" && (node.right.operator === "+" || node.right.operator === "-");
    const operatorLatex = node.operator === "+"
      ? " + "
      : node.operator === "-"
        ? " - "
        : node.implicit
          ? " "
          : " \\cdot ";

    return wrapLatexIfNeeded(node.left, leftLatex, leftNeedsWrap)
      + operatorLatex
      + wrapLatexIfNeeded(node.right, rightLatex, rightNeedsWrapForMultiply || rightNeedsWrapForSubtract);
  }

  function parseListInput(value, options) {
    const settings = options || {};
    const normalised = normaliseMathInput(value);
    if (!normalised) {
      return null;
    }

    const content = settings.stripOuterParens ? stripOuterParens(normalised) : normalised;
    const parts = splitTopLevel(content, ",");
    if (!parts || parts.some(function (part) { return !part; })) {
      return null;
    }

    const expressions = parts.map(function (part) {
      return parseMathExpression(part);
    });

    if (expressions.some(function (expression) { return !expression; })) {
      return null;
    }

    return {
      normalised: normalised,
      parts: parts,
      expressions: expressions
    };
  }

  function parseEquationInput(value) {
    const normalised = normaliseMathInput(value);
    if (!normalised) {
      return null;
    }

    const parts = splitTopLevel(normalised, "=");
    if (!parts || parts.length !== 2 || !parts[0] || !parts[1]) {
      return null;
    }

    const leftExpression = parseMathExpression(parts[0]);
    const rightExpression = parseMathExpression(parts[1]);

    if (!leftExpression || !rightExpression) {
      return null;
    }

    return {
      normalised: normalised,
      left: parts[0],
      right: parts[1],
      leftExpression: leftExpression,
      rightExpression: rightExpression
    };
  }

  function formatListForPreview(value, options) {
    const parsed = parseListInput(value, options);
    if (!parsed) {
      return null;
    }

    const itemLatex = parsed.expressions.map(function (expression) {
      return astToLatex(expression);
    }).join(",\\ ");

    if (options && options.wrapWithParens) {
      return "\\left(" + itemLatex + "\\right)";
    }

    return itemLatex;
  }

  function formatEquationForPreview(value) {
    const parsed = parseEquationInput(value);
    if (!parsed) {
      return null;
    }

    return astToLatex(parsed.leftExpression) + " = " + astToLatex(parsed.rightExpression);
  }

  function formatPartialEquationForPreview(value, options) {
    const settings = options || {};
    const normalised = normaliseMathInput(value);
    if (!normalised) {
      return null;
    }

    if (!normalised.includes("=")) {
      const ast = parseMathExpression(normalised);
      if (!ast) {
        return null;
      }

      const expressionLatex = astToLatex(ast);

      if (settings.equationLhs) {
        return settings.equationLhs + " = " + expressionLatex;
      }

      if (settings.equationRhs) {
        return expressionLatex + " = " + settings.equationRhs;
      }

      return expressionLatex;
    }

    const parts = splitTopLevel(normalised, "=");
    if (!parts || parts.length !== 2) {
      return null;
    }

    if (parts[0] && !parts[1]) {
      const leftExpression = parseMathExpression(parts[0]);
      return leftExpression ? astToLatex(leftExpression) + " =" : null;
    }

    if (!parts[0] && parts[1]) {
      const rightExpression = parseMathExpression(parts[1]);
      return rightExpression ? "= " + astToLatex(rightExpression) : null;
    }

    return null;
  }

  function formatMathForPreview(value, options) {
    const settings = options || {};
    if (!value) {
      return "";
    }

    if (settings.mode === "equation") {
      return formatEquationForPreview(value) || formatPartialEquationForPreview(value, settings);
    }

    if (settings.mode === "list") {
      return formatListForPreview(value, {
        stripOuterParens: Boolean(settings.stripOuterParens),
        wrapWithParens: Boolean(settings.wrapWithParens)
      });
    }

    const ast = parseMathExpression(value);
    if (!ast) {
      return null;
    }

    return astToLatex(ast);
  }

  function setupMathInputPreview(inputId, previewId, options) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    if (!input || !preview) {
      return;
    }

    function updatePreview() {
      const value = input.value.trim();

      if (!value) {
        preview.textContent = "Preview will appear here.";
        preview.classList.add("is-placeholder");
        preview.classList.remove("is-error");
        return;
      }

      const previewLatex = formatMathForPreview(value, options);

      if (!previewLatex) {
        preview.textContent = "Check your maths formatting.";
        preview.classList.add("is-error");
        preview.classList.remove("is-placeholder");
        return;
      }

      try {
        katex.render(previewLatex, preview, {
          throwOnError: true,
          displayMode: true
        });
        preview.classList.remove("is-placeholder", "is-error");
      } catch (error) {
        preview.textContent = "Check your maths formatting.";
        preview.classList.add("is-error");
        preview.classList.remove("is-placeholder");
      }
    }

    input.addEventListener("input", updatePreview);
    updatePreview();
  }

  function bindMathInputCheck(inputId, checkHandler) {
    const input = document.getElementById(inputId);
    if (!input) {
      return;
    }

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        checkHandler();
      }
    });
  }

  function compileMathExpression(value) {
    const normalised = normaliseMathInput(value);
    if (!normalised) {
      return null;
    }

    const tokens = buildExpressionTokens(normalised);
    if (!tokens) {
      return null;
    }

    const jsExpression = [];

    tokens.forEach(function (token) {
      if (token.type === "function") {
        if (token.value === "ln") {
          jsExpression.push("Math.log");
        } else if (token.value === "exp") {
          jsExpression.push("Math.exp");
        } else {
          jsExpression.push("Math." + token.value);
        }
      } else if (token.type === "variable") {
        jsExpression.push('(scope[' + JSON.stringify(token.value) + '])');
      } else if (token.type === "constant") {
        jsExpression.push(token.value === "pi" ? "Math.PI" : "Math.E");
      } else if (token.type === "operator" && token.value === "^") {
        jsExpression.push("**");
      } else {
        jsExpression.push(token.value);
      }
    });

    try {
      return new Function("scope", "\"use strict\"; return (" + jsExpression.join("") + ");");
    } catch (error) {
      return null;
    }
  }

  function valuesAreEquivalent(actualValue, expectedValue, tolerance) {
    const maxMagnitude = Math.max(1, Math.abs(actualValue), Math.abs(expectedValue));
    return Math.abs(actualValue - expectedValue) <= tolerance * maxMagnitude;
  }

  function evaluateCompiledExpression(compiledExpression, sample) {
    const scope = sample || {};
    const value = compiledExpression(scope);
    return Number.isFinite(value) ? value : null;
  }

  function checkEquivalentExpression(value, acceptedAnswers, samples, tolerance) {
    const candidate = compileMathExpression(value);
    if (!candidate) {
      return false;
    }

    const evaluationSamples = samples && samples.length ? samples : [{}];
    const comparisonTolerance = tolerance || DEFAULT_TOLERANCE;

    return acceptedAnswers.some(function (acceptedAnswer) {
      const accepted = compileMathExpression(acceptedAnswer);
      if (!accepted) {
        return false;
      }

      return evaluationSamples.every(function (sample) {
        const actualValue = evaluateCompiledExpression(candidate, sample);
        const expectedValue = evaluateCompiledExpression(accepted, sample);

        return actualValue !== null
          && expectedValue !== null
          && valuesAreEquivalent(actualValue, expectedValue, comparisonTolerance);
      });
    });
  }

  function buildCandidateEquationValues(value, settings) {
    const candidateValues = [value];
    if (!settings.allowBareExpression || (!settings.equationLhs && !settings.equationRhs)) {
      return candidateValues;
    }

    const normalised = normaliseMathInput(value);
    if (!normalised || normalised.includes("=")) {
      return candidateValues;
    }

    if (settings.equationLhs) {
      candidateValues.unshift(settings.equationLhs + "=" + normalised);
    }

    if (settings.equationRhs) {
      candidateValues.unshift(normalised + "=" + settings.equationRhs);
    }

    return candidateValues;
  }

  function checkEquivalentEquation(value, acceptedAnswers, samples, options, tolerance) {
    const settings = typeof options === "number" && typeof tolerance === "undefined" ? {} : (options || {});
    const evaluationSamples = samples && samples.length ? samples : [{}];
    const comparisonTolerance = typeof options === "number" && typeof tolerance === "undefined"
      ? options
      : (tolerance || DEFAULT_TOLERANCE);

    return buildCandidateEquationValues(value, settings).some(function (candidateValue) {
      const candidateEquation = parseEquationInput(candidateValue);
      if (!candidateEquation) {
        return false;
      }

      const candidateLeft = compileMathExpression(candidateEquation.left);
      const candidateRight = compileMathExpression(candidateEquation.right);
      if (!candidateLeft || !candidateRight) {
        return false;
      }

      return acceptedAnswers.some(function (acceptedAnswer) {
        const acceptedEquation = parseEquationInput(acceptedAnswer);
        if (!acceptedEquation) {
          return false;
        }

        const acceptedLeft = compileMathExpression(acceptedEquation.left);
        const acceptedRight = compileMathExpression(acceptedEquation.right);
        if (!acceptedLeft || !acceptedRight) {
          return false;
        }

        let scale = null;

        return evaluationSamples.every(function (sample) {
          const candidateResidual = evaluateCompiledExpression(function (scope) {
            return candidateLeft(scope) - candidateRight(scope);
          }, sample);
          const acceptedResidual = evaluateCompiledExpression(function (scope) {
            return acceptedLeft(scope) - acceptedRight(scope);
          }, sample);

          if (candidateResidual === null || acceptedResidual === null) {
            return false;
          }

          if (Math.abs(candidateResidual) <= comparisonTolerance && Math.abs(acceptedResidual) <= comparisonTolerance) {
            return true;
          }

          if (Math.abs(candidateResidual) <= comparisonTolerance || Math.abs(acceptedResidual) <= comparisonTolerance) {
            return false;
          }

          const ratio = candidateResidual / acceptedResidual;

          if (!Number.isFinite(ratio) || Math.abs(ratio) <= comparisonTolerance) {
            return false;
          }

          if (scale === null) {
            scale = ratio;
            return true;
          }

          return valuesAreEquivalent(ratio, scale, comparisonTolerance);
        });
      });
    });
  }

  function listItemsEquivalent(candidateItems, acceptedItems, samples, ordered, tolerance) {
    if (candidateItems.length !== acceptedItems.length) {
      return false;
    }

    const comparisonTolerance = tolerance || DEFAULT_TOLERANCE;

    if (ordered) {
      return candidateItems.every(function (candidateItem, index) {
        return checkEquivalentExpression(candidateItem, [acceptedItems[index]], samples, comparisonTolerance);
      });
    }

    const usedIndexes = new Set();

    function backtrack(candidateIndex) {
      if (candidateIndex >= candidateItems.length) {
        return true;
      }

      for (let acceptedIndex = 0; acceptedIndex < acceptedItems.length; acceptedIndex += 1) {
        if (usedIndexes.has(acceptedIndex)) {
          continue;
        }

        if (!checkEquivalentExpression(candidateItems[candidateIndex], [acceptedItems[acceptedIndex]], samples, comparisonTolerance)) {
          continue;
        }

        usedIndexes.add(acceptedIndex);
        if (backtrack(candidateIndex + 1)) {
          return true;
        }
        usedIndexes.delete(acceptedIndex);
      }

      return false;
    }

    return backtrack(0);
  }

  function checkEquivalentList(value, acceptedAnswers, samples, options, tolerance) {
    const settings = options || {};
    const candidate = parseListInput(value, {
      stripOuterParens: Boolean(settings.stripOuterParens)
    });

    if (!candidate) {
      return false;
    }

    return acceptedAnswers.some(function (acceptedAnswer) {
      const accepted = parseListInput(acceptedAnswer, {
        stripOuterParens: Boolean(settings.stripOuterParens)
      });

      if (!accepted) {
        return false;
      }

      return listItemsEquivalent(candidate.parts, accepted.parts, samples, Boolean(settings.ordered), tolerance);
    });
  }

  function getMatcher(mode) {
    if (mode === "equation") {
      return checkEquivalentEquation;
    }

    if (mode === "list") {
      return checkEquivalentList;
    }

    return checkEquivalentExpression;
  }

  function matcherAcceptsOptions(mode) {
    return mode === "list" || mode === "equation";
  }

  function runMatcher(mode, value, acceptedAnswers, samples, options, tolerance) {
    const matcher = getMatcher(mode);

    if (matcherAcceptsOptions(mode)) {
      return matcher(value, acceptedAnswers, samples, options, tolerance);
    }

    return matcher(value, acceptedAnswers, samples, tolerance);
  }

  function hideElement(elementId) {
    if (!elementId) {
      return;
    }

    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add("hidden");
    }
  }

  function showElement(elementId) {
    if (!elementId) {
      return;
    }

    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove("hidden");
    }
  }

  function checkTypedStep(config) {
    const input = document.getElementById(config.inputId);
    const setFeedback = config.setFeedback || window.setFeedback;
    const toggleNextStepButton = config.toggleNextStepButton || window.toggleNextStepButton;
    const mode = config.mode || "expression";
    const options = config.options || {};

    if (!input || typeof setFeedback !== "function") {
      return false;
    }

    const value = input.value.trim();

    if (!value) {
      setFeedback(config.feedbackId, config.emptyMessage || "Type an answer before checking.");
      if (config.nextButtonId && typeof toggleNextStepButton === "function") {
        toggleNextStepButton(config.nextButtonId, false);
      }
      hideElement(config.successRevealId);
      return false;
    }

    if (runMatcher(mode, value, config.acceptedAnswers, config.samples, options, config.tolerance)) {
      setFeedback(config.feedbackId, config.successMessage, true);
      if (config.nextButtonId && typeof toggleNextStepButton === "function") {
        toggleNextStepButton(config.nextButtonId, true);
      }
      showElement(config.successRevealId);
      return true;
    }

    const targetedFeedback = config.targetedFeedback || [];
    const targetedMatch = targetedFeedback.find(function (entry) {
      const entryMode = entry.mode || mode;
      const entryOptions = entry.options || options;
      return runMatcher(entryMode, value, entry.answers, config.samples, entryOptions, config.tolerance);
    });

    if (targetedMatch) {
      setFeedback(config.feedbackId, targetedMatch.message);
    } else {
      setFeedback(config.feedbackId, config.genericMessage);
    }

    if (config.nextButtonId && typeof toggleNextStepButton === "function") {
      toggleNextStepButton(config.nextButtonId, false);
    }
    hideElement(config.successRevealId);

    return false;
  }

  window.TypedMath = {
    bindMathInputCheck: bindMathInputCheck,
    checkEquivalentEquation: checkEquivalentEquation,
    checkEquivalentExpression: checkEquivalentExpression,
    checkEquivalentList: checkEquivalentList,
    checkTypedStep: checkTypedStep,
    formatMathForPreview: formatMathForPreview,
    normaliseMathInput: normaliseMathInput,
    setupMathInputPreview: setupMathInputPreview
  };
}());
