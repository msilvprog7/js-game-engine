"use strict";

/**
 * Main event dispatcher
 */
class EventDispatcher{
	
	constructor() {
		this.events = {};
	}

	addEventListener(eventType, listener, callback, context) {
		// Create list if necessary
		if (this.events[eventType] === undefined) {
			this.events[eventType] = [];
		}

		// Add listener and callback
		if (listener !== undefined && callback !== undefined && typeof(callback) === "function") {
			this.events[eventType].push({"listener": listener, "callback": callback, "context": context});
		}

		return this;
	}

	removeEventListener(eventType, listener) {
		let index = this.hasEventListener(eventType, listener);

		// Return undefined if not found
		if (index === -1) {
			return undefined;
		}

		return this.events[eventType].splice(index, 1)[0];
	}

	hasEventListener(eventType, listener) {
		// If empty list or not found, -1
		let index = -1;
		if (this.events[eventType] === undefined) { 
			return index; 
		}

		// Get index
		this.events[eventType].forEach((e, i) => { if(e.listener === listener) { index = i; }});

		// Return index or -1
		return index;
	}

	dispatchEvent(eventType, data) {
		// End early
		if (this.events[eventType] === undefined) {
			return;
		}		
		// Call callbacks
		if (data === undefined) { data = []; }
		else if(data.iterator === undefined) { data = [data];}
		this.events[eventType].forEach(e => { if (typeof(e.callback) === "function") { e.callback.call(e.context, ...data); } });
	}

}