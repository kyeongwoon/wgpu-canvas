'use strict'

import cssom from 'rrweb-cssom'
import { CSSStyleDeclaration } from 'cssstyle'
import specificity from './specificity.js'

const inherit = [
    'azimuth',
    'border-collapse',
    'border-spacing',
    'caption-side',
    'color',
    'cursor',
    'direction',
    'elevation',
    'empty-cells',
    'font-family',
    'font-size',
    'font-style',
    'font-variant',
    'font-weight',
    'font',
    'letter-spacing',
    'line-height',
    'list-style-image',
    'list-style-position',
    'list-style-type',
    'list-style',
    'orphans',
    'pitch-range',
    'pitch',
    'quotes',
    'richness',
    'speak-header',
    'speak-numeral',
    'speak-punctuation',
    'speak',
    'speech-rate',
    'stress',
    'text-align',
    'text-decoration', // kwll
    'text-indent',
    'text-transform',
    'visibility',
    'voice-family',
    'volume',
    'white-space',
    'widows',
    'word-spacing',
];


// getComputedStyle
function getSpecificity(selectorText) {
    return specificity
        .calculate(selectorText)[0]
        .specificity
        .split(',')
        .map(function(s) {
            return parseInt(s, 10);
        });
}

function compareSpecificity(first, second) {
    for (let i = 0; i < first.length; i++) {
        const a = first[i];
        const b = second[i];
        if (a === b) {
            continue;
        }
        return b - a;
    }
    return 0;
}

function normalizePseudo(value) {
    return value ? value.toLowerCase().replace(/\:+(\w+)$/, '$1') : '';
}

function cascade(element, pseudo) {
    pseudo = normalizePseudo(pseudo);

    var cacheKey = '_cascade::' + pseudo;

    if (element[cacheKey]) {
        return element[cacheKey];
    }

    var document = element.ownerDocument;
    var cssStyleDeclarations = [];
    var style = new CSSStyleDeclaration();
    var importants = {};
    var forEach = Array.prototype.forEach;
    var pseudoRe = pseudo ? new RegExp('\\:+' + pseudo + '$', 'i') : null;

    cssStyleDeclarations.push(element.style);
    if (!element.style._specificity) {
        element.style._specificity = [1, 0, 0, 0];
    }

    // StyleSheetList > CSSStyleSheet.cssRules > CSSStyleRule
    eachCssStyleRule(document, function(rule) {
        var selectorText = rule.selectorText;
        if (matches(element, selectorText)) {
            if(element.nodeName === 'div') {
                console.log(element.nodeName)
                rule.style._specificity = getSpecificity(selectorText);
            } else {
                rule.style._specificity = getSpecificity(selectorText);
            }
            cssStyleDeclarations.push(rule.style);
        }
    });

    const decls = cssStyleDeclarations.sort(function(a, b) {
        return compareSpecificity(a._specificity, b._specificity);
    });
    decls.forEach(function(cssStyleDeclaration) {
        forEach.call(cssStyleDeclaration, cssStyleDeclarationForEach, cssStyleDeclaration);
    });

    function matches(element, selector) {
        if (pseudoRe) {
            // *::after
            // ::after
            // element::after
            selector = selector.replace(pseudoRe, '') || '*';
        }
        try {
            return element.matches(selector);
        } catch (e) {}
    }

    function cssStyleDeclarationForEach(key) {
        var cssStyleDeclaration = this;
        var important = cssStyleDeclaration.getPropertyPriority(key);

        //if (!important  || !importants[key] || !style[key]) {
        if (important !== '' || importants[key] !== '' || !style[key]) {
            style[key] = cssStyleDeclaration[key];
        }
        importants[key] = important;
    }

    if(element.nodeName === 'div') {
        const display = style.display
        console.log(display)
    }
    element[cacheKey] = style;
    return style;
}


var SCREEN_CONFIG = {
    type: 'screen',
    width: '1440px'
};

function cssRuleListFor(cssRuleList, callback) {
    for (var n = 0; n < cssRuleList.length; n++) {
        var cssRule = cssRuleList[n];

        const ctor = cssRule.constructor;
        //if(ctor.name === 'CSSStyleRule') {
        if (cssRule instanceof cssom.CSSStyleRule) {
            callback(cssRule);
        } else if (cssRule instanceof cssom.CSSImportRule) {

            var cssStyleSheet = cssRule.styleSheet;
            cssRuleListFor(cssStyleSheet.cssRules || [], callback);

        } else if (cssRule instanceof cssom.CSSMediaRule) {
            Array.prototype.forEach.call(cssRule.media, function(media) {
                if (cssMediaQuery.match(media, SCREEN_CONFIG)) {
                    cssRuleListFor(cssRule.cssRules || [], callback);
                }
            });
        }

    }
}

function eachCssStyleRule(document, callback) {
    var window = document.defaultView;
    var styleSheetList = document.styleSheets;

    for (var i = 0; i < styleSheetList.length; i++) {
        var cssStyleSheet = styleSheetList[i];
        var cssRuleList = cssStyleSheet.cssRules || [];
        cssRuleListFor(cssRuleList, callback);
    }
};

function getComputedStyle(node, pseudo = null) {
    //console.log(node.nodeName)
    const cacheKey = '_computedStyle::' + pseudo;
    if (node[cacheKey]) {
        return node[cacheKey];
    }
    var currentStyle = cascade(node, pseudo);
    let parentNode = pseudo ? node : node.parentNode;
    var INHERIT = 'inherit';
    var DOCUMENT = '#document';
  
    for(const key of inherit) {
        //console.log(key)
        var currentValue = currentStyle[key];

        var parentStyle;
        var parentStyleValue;
        var styles = [];

        if (!currentValue || currentValue === INHERIT) {
            out: while (parentNode && parentNode.nodeName !== DOCUMENT) {

                parentStyle = cascade(parentNode);
                parentStyleValue = parentStyle[key];

                if (parentStyleValue && parentStyleValue !== INHERIT) {
                    styles.push(currentStyle);
                    //setInheritValue(styles, key, parentStyleValue);
                    for(const style of styles) {
                        style[key] = parentStyleValue;
                    }
                    break out;
                }

                styles.push(parentStyle);
                parentNode = parentNode.parentNode;
            }
        }
    }
    node[cacheKey] = currentStyle;
    return currentStyle;
}

export default getComputedStyle;