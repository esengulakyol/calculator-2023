const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");
let expression = "";      // ekranda görünen ifade
let calcExpression = "";  // hesaplamada kullanılacak ifade
let memory = 0;

function updateDisplay() {
  display.textContent = expression || "0";
}

function calculateExpression(expr) {
  try {
    // Açık parantezleri kapat
    const openParens = (expr.match(/\(/g) || []).length;
    const closeParens = (expr.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      expr += ")".repeat(openParens - closeParens);
    }

    expr = expr
      .replace(/√\(([^)]+)\)/g, "Math.sqrt($1)")
      .replace(/÷/g, "/")
      .replace(/×/g, "*");

    const result = Function('"use strict";return (' + expr + ')')();
    return Number.isFinite(result) ? result : "Error";
  } catch {
    return "Error";
  }
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = btn.dataset.value;
    const action = btn.dataset.action;

    switch (action) {
      case undefined: // rakam tuşları
        expression += value;
        calcExpression += value;
        break;

      case "op":
        if (/[+\-*/]$/.test(calcExpression)) calcExpression = calcExpression.slice(0, -1);
        if (/[+\-*/]$/.test(expression)) expression = expression.slice(0, -1);
        calcExpression += value;
        expression += value;
        break;

      case "dot":
        if (!/[0-9.]$/.test(calcExpression)) {
          expression += "0";
          calcExpression += "0";
        }
        expression += ".";
        calcExpression += ".";
        break;

      case "ce":
        expression = expression.replace(/([+\-*/]?[^+\-*/]*)$/, "");
        calcExpression = calcExpression.replace(/([+\-*/]?[^+\-*/]*)$/, "");
        break;

      case "ac":
        expression = "";
        calcExpression = "";
        memory = 0;
        break;

      case "delete":
        expression = expression.slice(0, -1);
        calcExpression = calcExpression.slice(0, -1);
        break;

      case "sqrt":
        const matchSqrt = calcExpression.match(/(\d+(\.\d*)?)$/);
        if (matchSqrt) {
          const num = matchSqrt[0];
          const result = Math.sqrt(parseFloat(num));
          expression = expression.slice(0, -num.length) + result.toString();
          calcExpression = calcExpression.slice(0, -num.length) + result.toString();
        } else {
          expression += "√(";
          calcExpression += "√(";
        }
        break;

      case "percent":
        const matchPercent = calcExpression.match(/(\d+(\.\d*)?)$/);
        if (matchPercent) {
          const num = matchPercent[0];
          const result = parseFloat(num) / 100;
          expression = expression.slice(0, -num.length) + num + "%";
          calcExpression = calcExpression.slice(0, -num.length) + result.toString();
        } else {
          expression += "%";
          calcExpression += "/100";
        }
        break;

      case "negate":
        const matchNeg = calcExpression.match(/(\d+(\.\d*)?)$/);
        if (matchNeg) {
          const num = matchNeg[0];
          if (num.startsWith("-")) {
            expression = expression.slice(0, -num.length) + num.slice(1);
            calcExpression = calcExpression.slice(0, -num.length) + num.slice(1);
          } else {
            expression = expression.slice(0, -num.length) + "-(" + num + ")";
            calcExpression = calcExpression.slice(0, -num.length) + "-(" + num + ")";
          }
        }
        break;

      case "mplus":
        const val1 = parseFloat(calculateExpression(calcExpression));
        if (!isNaN(val1)) memory += val1;
        break;

      case "mminus":
        const val2 = parseFloat(calculateExpression(calcExpression));
        if (!isNaN(val2)) memory -= val2;
        break;

      case "mrc":
        expression += memory.toString();
        calcExpression += memory.toString();
        break;

      case "doublezero":
        expression += "00";
        calcExpression += "00";
        break;

      case "equals":
        const result = calculateExpression(calcExpression);
        expression = result === "Error" ? "" : result.toString();
        calcExpression = result === "Error" ? "" : result.toString();
        break;
    }

    updateDisplay();
  });
});
