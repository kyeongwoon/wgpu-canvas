'use strict';

import fs from 'fs'
import assert from 'assert'
import { App, Window } from '../index.js'

var eachCssStyleRule = require('../../../src/style/each-css-style-rule');

describe('css3-compat', function() {
    var url = './html/css3-compat.html';
    var html = fs.readFileSync(url, 'utf8');
    var window = browser.sync(html, {
        url: url,
        loadCssFile: false
    });

    var document = window.document;
    window.location.hash = '#target';

    eachCssStyleRule(document, function(cssRule) {
        var selectorText = cssRule.selectorText;
        it(selectorText, function() {
            var elements = document.querySelectorAll(selectorText);
            assert.equal(true, elements.length > 0);
        });
    });
});