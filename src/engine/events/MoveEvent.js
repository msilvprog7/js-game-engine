"use strict";

class MoveEvent extends Event {
	constructor(eventType, source, tl, br) {
		super(eventType, source);
		this.tl = tl;
		this.br = br;
	}

	static POSITION_CHANGED() {
		return 'POSITION_CHANGED';
	}
}