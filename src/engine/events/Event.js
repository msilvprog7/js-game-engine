"use strict";


class Event {
	constructor(eventType, source) {
		this.eventType = eventType;
		this.source = source; 
	}

	setEventType(eventType) {
		this.eventType = eventType;
		return this;
	}

	getEventType() { return this.eventType; }

	setSource(source) {
		this.source = source;
		return this;
	}

	getSource() { return this.source; }

}