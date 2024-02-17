'use strict'

class MatcherList {
	constructor() {
		this.length = 0;
	}
    get matcherText() {
        return Array.prototype.join.call(this, ', ');
    }

    set matcherText(value) {
        var values = value.split(',');
        var length = this.length = values.length;
        for (var i=0; i<length; i++) {
            this[i] = values[i].trim();
        }
    }

    appendMatcher(matcher) {
        if (Array.prototype.indexOf.call(this, matcher) === -1) {
            this[this.length] = matcher;
            this.length++;
        }
    }
    deleteMatcher(matcher) {
        var index = Array.prototype.indexOf.call(this, matcher);
        if (index !== -1) {
            Array.prototype.splice.call(this, index, 1);
        }
    }
}

export default MatcherList;