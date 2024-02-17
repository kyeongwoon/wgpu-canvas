'use strict'

import CSSValue from "./CSSValue.js";

class CSSValueExpression extends CSSValue {
    constructor(token, idx) {
        super();
        this._token = token;
        this._idx = idx;
    }

    parse() {
        var token = this._token,
            idx = this._idx;

        var character = '',
            expression = '',
            error = '',
            info,
            paren = [];


        for (; ; ++idx) {
            character = token.charAt(idx);

            // end of token
            if (character === '') {
                error = 'css expression error: unfinished expression!';
                break;
            }

            switch (character) {
                case '(':
                    paren.push(character);
                    expression += character;
                    break;

                case ')':
                    paren.pop(character);
                    expression += character;
                    break;

                case '/':
                    if ((info = this._parseJSComment(token, idx))) { // comment?
                        if (info.error) {
                            error = 'css expression error: unfinished comment in expression!';
                        } else {
                            idx = info.idx;
                            // ignore the comment
                        }
                    } else if ((info = this._parseJSRexExp(token, idx))) { // regexp
                        idx = info.idx;
                        expression += info.text;
                    } else { // other
                        expression += character;
                    }
                    break;

                case "'":
                case '"':
                    info = this._parseJSString(token, idx, character);
                    if (info) { // string
                        idx = info.idx;
                        expression += info.text;
                    } else {
                        expression += character;
                    }
                    break;

                default:
                    expression += character;
                    break;
            }

            if (error) {
                break;
            }

            // end of expression
            if (paren.length === 0) {
                break;
            }
        }

        var ret;
        if (error) {
            ret = {
                error: error
            };
        } else {
            ret = {
                idx: idx,
                expression: expression
            };
        }

        return ret;
    }


    _parseJSComment(token, idx) {
        var nextChar = token.charAt(idx + 1),
            text;

        if (nextChar === '/' || nextChar === '*') {
            var startIdx = idx,
                endIdx,
                commentEndChar;

            if (nextChar === '/') { // line comment
                commentEndChar = '\n';
            } else if (nextChar === '*') { // block comment
                commentEndChar = '*/';
            }

            endIdx = token.indexOf(commentEndChar, startIdx + 1 + 1);
            if (endIdx !== -1) {
                endIdx = endIdx + commentEndChar.length - 1;
                text = token.substring(idx, endIdx + 1);
                return {
                    idx: endIdx,
                    text: text
                };
            } else {
                var error = 'css expression error: unfinished comment in expression!';
                return {
                    error: error
                };
            }
        } else {
            return false;
        }
    }


    _parseJSString = function (token, idx, sep) {
        var endIdx = this._findMatchedIdx(token, idx, sep),
            text;

        if (endIdx === -1) {
            return false;
        } else {
            text = token.substring(idx, endIdx + sep.length);

            return {
                idx: endIdx,
                text: text
            };
        }
    }

    _parseJSRexExp(token, idx) {
        var before = token.substring(0, idx).replace(/\s+$/, ''),
            legalRegx = [
                /^$/,
                /\($/,
                /\[$/,
                /\!$/,
                /\+$/,
                /\-$/,
                /\*$/,
                /\/\s+/,
                /\%$/,
                /\=$/,
                /\>$/,
                /<$/,
                /\&$/,
                /\|$/,
                /\^$/,
                /\~$/,
                /\?$/,
                /\,$/,
                /delete$/,
                /in$/,
                /instanceof$/,
                /new$/,
                /typeof$/,
                /void$/
            ];

        var isLegal = legalRegx.some(function (reg) {
            return reg.test(before);
        });

        if (!isLegal) {
            return false;
        } else {
            var sep = '/';

            // same logic as string
            return this._parseJSString(token, idx, sep);
        }
    }

    _findMatchedIdx(token, idx, sep) {
        var startIdx = idx,
            endIdx;

        var NOT_FOUND = -1;

        while (true) {
            endIdx = token.indexOf(sep, startIdx + 1);

            if (endIdx === -1) { // not found
                endIdx = NOT_FOUND;
                break;
            } else {
                var text = token.substring(idx + 1, endIdx),
                    matched = text.match(/\\+$/);
                if (!matched || matched[0] % 2 === 0) { // not escaped
                    break;
                } else {
                    startIdx = endIdx;
                }
            }
        }

        // boundary must be in the same line(js sting or regexp)
        var nextNewLineIdx = token.indexOf('\n', idx + 1);
        if (nextNewLineIdx < endIdx) {
            endIdx = NOT_FOUND;
        }


        return endIdx;
    }
}

export default CSSValueExpression;