const syntax = require('./syntax.js');
const Exp = require('./expression.js');
const lexical = require('./lexical.js');
const _ = require('lodash');

function evalExp(exp, scope) {
    if (!scope) throw new Error('unable to evalExp: scope undefined');
    var operatorREs = lexical.operators;
    for (var i = 0; i < operatorREs.length; i++) {
        var operatorRE = operatorREs[i];
        var expRE = new RegExp(`^(${lexical.quoteBalanced.source})(${operatorRE.source})(${lexical.quoteBalanced.source})$`);
        var match = exp.match(expRE);
        if (match) {
            var l = evalExp(match[1], scope);
            var op = syntax.operators[match[2].trim()];
            var r = evalExp(match[3], scope);
            return op(l, r);
        }
    }

    if (match = exp.match(lexical.rangeLine)) {
        var low = evalValue(match[1], scope),
            high = evalValue(match[2], scope) + 1;
        return _.range(low, high);
    }

    return evalValue(exp, scope);
}

function evalValue(str, scope) {
    str = str && str.trim();
    if (!str) return undefined;

    if (lexical.isLiteral(str)) {
        var a = lexical.parseLiteral(str);
        return lexical.parseLiteral(str);
    }
    if (lexical.isVariable(str)) {
        return scope.get(str);
    }
}

function isTruthy(val) {
    if (val instanceof Array) return !!val.length;
    return !!val;
}

function isFalsy(val) {
    return !isTruthy(val);
}

module.exports = {
    evalExp, evalValue, isTruthy, isFalsy
};
