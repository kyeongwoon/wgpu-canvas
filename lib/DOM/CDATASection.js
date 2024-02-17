'use strict'

import { CDATA_SECTION_NODE } from './Node.js';
import Text from './Text.js';

class CDATASection extends Text {
	nodeType = CDATA_SECTION_NODE;
	nodeName = '#cdata-section';
	constructor(data) {
		super(data);
	}
}

export default CDATASection;