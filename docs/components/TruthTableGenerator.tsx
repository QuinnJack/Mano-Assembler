import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

function TruthTableGenerator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const kScannerConstants = {
    EOF: "$",
  };

  useEffect(() => {
    if (input) {
      generateTable();
    } else {
      setResult(null);
      setError(null);
    }
  }, [input]);

  function scan(input) {
    checkIntegrity(input);
    const expanded = expandImplicitAnd(input);
    const preliminary = preliminaryScan(expanded);
    return numberVariables(preliminary);
  }

  function expandImplicitAnd(input) {
    let expanded = "";
    for (let i = 0; i < input.length; i++) {
      expanded += input[i];
      if (i < input.length - 1 && isAlpha(input[i]) && isAlpha(input[i + 1])) {
        expanded += "/\\";
      }
    }
    return expanded;
  }

  function isAlpha(char) {
    return /[A-Za-z]/.test(char);
  }

  function preliminaryScan(input) {
    input += kScannerConstants.EOF;
    let i = 0;
    const variableSet = {};
    const tokens = [];

    while (true) {
      const curr = input.charAt(i);

      if (curr === kScannerConstants.EOF) {
        tokens.push(makeIdentityToken(curr, i));
        return { tokens, variableSet };
      } else if (isVariableStart(input, i)) {
        const variable = scanVariable(input, i, variableSet);
        tokens.push(makeVariableToken(variable, i, i + variable.length));
        i += variable.length;
      } else if (isOperatorStart(input, i)) {
        const token = tryReadOperator(input, i);
        tokens.push(makeIdentityToken(token, i));
        i += token.length;
      } else if (isWhitespace(input.charAt(i))) {
        i++;
      } else {
        scannerFail(
          `The character ${input.charAt(i)} shouldn't be here.`,
          i,
          i + 1
        );
      }
    }
  }

  function makeIdentityToken(str, index) {
    return { type: translate(str), start: index, end: index + str.length };
  }

  function makeVariableToken(varIndex, start, end) {
    return { type: "variable", index: varIndex, start, end };
  }

  function isVariableStart(input, index) {
    return tryReadVariableName(input, index) !== null;
  }

  function tryReadVariableName(input, index) {
    if (!/[A-Za-z]/.test(input.charAt(index))) return null;
    return input.charAt(index);
  }

  function isReservedWord(token) {
    return (
      token === "T" ||
      token === "F" ||
      token === "and" ||
      token === "or" ||
      token === "not" ||
      token === "iff" ||
      token === "implies" ||
      token === "true" ||
      token === "false"
    );
  }

  function scanVariable(input, index, variableSet) {
    const variableName = tryReadVariableName(input, index);
    variableSet[variableName] = true;
    return variableName;
  }

  function isOperatorStart(input, index) {
    return tryReadOperator(input, index) !== null;
  }

  function tryReadOperator(input, index) {
    const operators = [
      "⋅",
      "\\cdot",
      "\\leftrightarrow",
      "\\Leftrightarrow",
      "\\rightarrow",
      "\\Rightarrow",
      "implies",
      "\\wedge",
      "false",
      "\\lnot",
      "\\lneg",
      "\\land",
      "true",
      "\\top",
      "\\bot",
      "\\lor",
      "\\vee",
      "\\neg",
      "<->",
      "and",
      "<=>",
      "not",
      "iff",
      "\\to",
      "/\\",
      "\\/",
      "->",
      "&&",
      "||",
      "or",
      "=>",
      "(",
      ")",
      "~",
      "T",
      "F",
      "^",
      "!",
      "+",
      "\u2227",
      "\u2228",
      "\u2192",
      "\u2194",
      "\u22A4",
      "\u22A5",
      "\u00AC",
    ];

    for (let op of operators) {
      if (input.startsWith(op, index)) {
        return op;
      }
    }
    return null;
  }

  function translate(input) {
    const translations = {
      "&&": "/\\",
      "\\cdot": "/\\",
      "⋅": "/\\",
      and: "/\\",
      "\u2227": "/\\",
      "\\land": "/\\",
      "\\wedge": "/\\",
      "^": "/\\",
      "||": "\\/",
      or: "\\/",
      "+": "\\/",
      "\u2228": "\\/",
      "\\lor": "\\/",
      "\\vee": "\\/",
      "=>": "->",
      "\u2192": "->",
      implies: "->",
      "\\to": "->",
      "\\rightarrow": "->",
      "\\Rightarrow": "->",
      "<=>": "<->",
      "\u2194": "<->",
      iff: "<->",
      "\\leftrightarrow": "<->",
      "\\Leftrightarrow": "<->",
      not: "~",
      "!": "~",
      "\u00AC": "~",
      "\\lnot": "~",
      "\\neg": "~",
      "\u22A4": "T",
      true: "T",
      "\\top": "T",
      "\u22A5": "F",
      false: "F",
      "\\bot": "F",
    };
    return translations[input] || input;
  }

  function isWhitespace(char) {
    return /\s/.test(char);
  }

  function scannerFail(why, start, end) {
    throw { description: why, start, end };
  }

  function checkIntegrity(input) {
    const okayChars =
      /[A-Za-z_0-9\\\/<>\-~+^()\s\&\|\=\!\u2227\u2228\u2192\u2194\u22A4\u22A5\u00AC\u00B7\u22C5]/;
    for (let i = 0; i < input.length; i++) {
      if (!okayChars.test(input.charAt(i))) {
        scannerFail("Illegal character", i, i + 1);
      }
    }
  }

  function numberVariables(preliminary) {
    const variables = Object.keys(preliminary.variableSet).sort();
    const variableSet = {};
    variables.forEach((v, i) => (variableSet[v] = i));

    const tokens = preliminary.tokens.map((token) =>
      token.type === "variable"
        ? { ...token, index: variableSet[token.index] }
        : token
    );

    return { tokens, variables };
  }

  function parse(input) {
    const scanResult = scan(input);
    const tokens = scanResult.tokens;
    const operators = [];
    const operands = [];
    let needOperand = true;

    for (let i = 0; i < tokens.length; i++) {
      const currToken = tokens[i];

      if (needOperand) {
        if (isOperand(currToken)) {
          addOperand(wrapOperand(currToken), operands, operators);
          needOperand = false;
        } else if (currToken.type === "(" || currToken.type === "~") {
          operators.push(currToken);
        } else if (currToken.type === kScannerConstants.EOF) {
          if (operators.length === 0) {
            parseError("", 0, 0);
          }
          if (operators[operators.length - 1].type === "(") {
            parseError(
              "This open parenthesis has no matching close parenthesis.",
              operators[operators.length - 1].start,
              operators[operators.length - 1].end
            );
          }
          parseError(
            "This operator is missing an operand.",
            operators[operators.length - 1].start,
            operators[operators.length - 1].end
          );
        } else {
          parseError(
            "We were expecting a variable, constant, or open parenthesis here.",
            currToken.start,
            currToken.end
          );
        }
      } else {
        if (
          isBinaryOperator(currToken) ||
          currToken.type === kScannerConstants.EOF
        ) {
          while (
            operators.length > 0 &&
            operators[operators.length - 1].type !== "(" &&
            priorityOf(operators[operators.length - 1]) > priorityOf(currToken)
          ) {
            const operator = operators.pop();
            const rhs = operands.pop();
            const lhs = operands.pop();
            addOperand(
              createOperatorNode(lhs, operator, rhs),
              operands,
              operators
            );
          }
          operators.push(currToken);
          needOperand = true;
          if (currToken.type === kScannerConstants.EOF) break;
        } else if (currToken.type === ")") {
          while (
            operators.length > 0 &&
            operators[operators.length - 1].type !== "("
          ) {
            if (operators.length === 0) {
              parseError(
                "This close parenthesis doesn't match any open parenthesis.",
                currToken.start,
                currToken.end
              );
            }
            const currOp = operators.pop();
            if (currOp.type === "~") {
              parseError(
                "Nothing is negated by this operator.",
                currOp.start,
                currOp.end
              );
            }
            const rhs = operands.pop();
            const lhs = operands.pop();
            addOperand(
              createOperatorNode(lhs, currOp, rhs),
              operands,
              operators
            );
          }
          if (
            operators.length === 0 ||
            operators[operators.length - 1].type !== "("
          ) {
            parseError(
              "This close parenthesis doesn't match any open parenthesis.",
              currToken.start,
              currToken.end
            );
          }
          operators.pop();
          const expr = operands.pop();
          addOperand(expr, operands, operators);
        } else {
          parseError(
            "We were expecting a close parenthesis or a binary connective here.",
            currToken.start,
            currToken.end
          );
        }
      }
    }

    if (
      operators.length > 1 ||
      (operators.length === 1 && operators[0].type !== kScannerConstants.EOF)
    ) {
      const mismatchedOp = operators[operators.length - 1];
      parseError(
        "No matching close parenthesis for this open parenthesis.",
        mismatchedOp.start,
        mismatchedOp.end
      );
    }

    return {
      ast: operands[0],
      variables: scanResult.variables,
    };
  }

  function addOperand(node, operands, operators) {
    while (
      operators.length > 0 &&
      operators[operators.length - 1].type === "~"
    ) {
      operators.pop();
      node = new NegateNode(node);
    }
    operands.push(node);
  }

  function isOperand(token) {
    return (
      token.type === "T" || token.type === "F" || token.type === "variable"
    );
  }

  function wrapOperand(token) {
    if (token.type === "T") return new TrueNode();
    if (token.type === "F") return new FalseNode();
    if (token.type === "variable") return new VariableNode(token.index);
    throw new Error("Token " + token.type + " isn't an operand.");
  }

  function isBinaryOperator(token) {
    return (
      token.type === "<->" ||
      token.type === "->" ||
      token.type === "/\\" ||
      token.type === "\\/"
    );
  }

  function priorityOf(token) {
    if (token.type === kScannerConstants.EOF) return -1;
    if (token.type === "<->") return 0;
    if (token.type === "->") return 1;
    if (token.type === "\\/") return 2;
    if (token.type === "/\\") return 3;
    throw new Error("Should never need the priority of " + token.type);
  }

  function createOperatorNode(lhs, token, rhs) {
    if (token.type === "<->") return new IffNode(lhs, rhs);
    if (token.type === "->") return new ImpliesNode(lhs, rhs);
    if (token.type === "\\/") return new OrNode(lhs, rhs);
    if (token.type === "/\\") return new AndNode(lhs, rhs);
    throw new Error(
      "Should never need to create an operator node from " + token.type
    );
  }

  function parseError(why, start, end) {
    throw { description: why, start, end };
  }

  class TrueNode {
    evaluate() {
      return true;
    }
  }

  class FalseNode {
    evaluate() {
      return false;
    }
  }

  class VariableNode {
    constructor(index) {
      this.index = index;
    }
    evaluate(assignment) {
      return assignment[this.index];
    }
  }

  class NegateNode {
    constructor(child) {
      this.child = child;
    }
    evaluate(assignment) {
      return !this.child.evaluate(assignment);
    }
  }

  class AndNode {
    constructor(left, right) {
      this.left = left;
      this.right = right;
    }
    evaluate(assignment) {
      return this.left.evaluate(assignment) && this.right.evaluate(assignment);
    }
  }

  class OrNode {
    constructor(left, right) {
      this.left = left;
      this.right = right;
    }
    evaluate(assignment) {
      return this.left.evaluate(assignment) || this.right.evaluate(assignment);
    }
  }

  class ImpliesNode {
    constructor(left, right) {
      this.left = left;
      this.right = right;
    }
    evaluate(assignment) {
      return !this.left.evaluate(assignment) || this.right.evaluate(assignment);
    }
  }

  class IffNode {
    constructor(left, right) {
      this.left = left;
      this.right = right;
    }
    evaluate(assignment) {
      return this.left.evaluate(assignment) === this.right.evaluate(assignment);
    }
  }

  function generateTruthTable(parseResult, callback) {
    const assignment = new Array(parseResult.variables.length).fill(false);

    do {
      callback(assignment.slice(), parseResult.ast.evaluate(assignment));
    } while (nextAssignment(assignment));
  }

  function nextAssignment(assignment) {
    let flipIndex = assignment.length - 1;
    while (flipIndex >= 0 && assignment[flipIndex]) flipIndex--;

    if (flipIndex === -1) return false;

    assignment[flipIndex] = true;
    for (let i = flipIndex + 1; i < assignment.length; i++) {
      assignment[i] = false;
    }

    return true;
  }

  const generateTable = () => {
    try {
      setError(null);
      const parseResult = parse(input);
      const table = [];
      generateTruthTable(parseResult, (assignment, value) => {
        table.push({ assignment, value });
      });
      setResult({ variables: parseResult.variables, table });
    } catch (err) {
      setError(err.description);
      setResult(null);
    }
  };

  return (
    <div style={{ paddingTop: '20px', maxWidth: '64rem', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>
        Truth Table Generator
      </h1>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a propositional logic formula"
          style={{ flexGrow: 1, padding: '8px', borderRadius: '0.5rem' }}
        />
      </div>

      {error && (
        <Alert variant="destructive" style={{ marginBottom: '16px' }}>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {result.variables.map((variable, index) => (
                  <th key={index} style={{ border: '1px solid', padding: '8px' }}>
                    {variable}
                  </th>
                ))}
                <th style={{ border: '1px solid', padding: '8px' }}>{input}</th>
              </tr>
            </thead>
            <tbody>
              {result.table.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.assignment.map((value, colIndex) => (
                    <td key={colIndex} style={{ border: '1px solid', padding: '8px', textAlign: 'center' }}>
                      {value ? 'T' : 'F'}
                    </td>
                  ))}
                  <td style={{ border: '1px solid', padding: '8px', textAlign: 'center' }}>
                    {row.value ? 'T' : 'F'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function MyApp() {
  return <TruthTableGenerator />;
}
