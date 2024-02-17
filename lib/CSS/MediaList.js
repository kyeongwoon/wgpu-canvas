'use strict'

class MediaList {
	constructor() {
		this.length = 0;
	}
	get mediaText() {
		return Array.prototype.join.call(this, ', ');
	}
	set mediaText(value) {
		var values = value.split(',');
		var length = this.length = values.length;
		for (var i=0; i<length; i++) {
			this[i] = values[i].trim();
		}
	}
	appendMedium(medium) {
		if (Array.prototype.indexOf.call(this, medium) === -1) {
			this[this.length] = medium;
			this.length++;
		}
	}
	deleteMedium(medium) {
		var index = Array.prototype.indexOf.call(this, medium);
		if (index !== -1) {
			Array.prototype.splice.call(this, index, 1);
		}
	}
}

export default MediaList;