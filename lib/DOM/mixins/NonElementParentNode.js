'use strict'

const NonElementParentNode = {
    getElementById(id) {
		let rtv = null;
		const callback = node => {
			if (node.nodeType === Node.ELEMENT_NODE) {
				if (node.getAttribute('id') === id) {
					rtv = node;
					return true;
				}
			}
		}

		function visit(node, callback) {
			if(callback(node)) return true;
			if (node = node.firstChild) {
				do {
					if (visit(node, callback)) {
						return true;
					}
				} while (node = node.nextSibling);
			}
		}
		visit(this, callback)
		return rtv;
    },
}

export default NonElementParentNode;