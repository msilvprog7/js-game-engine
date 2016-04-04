"use strict";

var FRIENDLY_VARS = {
	PRIORITY_LOW: 0,
	PRIORITY_MEDIUM: 1,
	PRIORITY_HIGH: 2,
	PRIORITY_MAX: 3
}

class Friendly extends Character {
	constructor(id, health, idle, maxSpeed, priority) {
		super(id, health, idle, maxSpeed);
		if(priority === undefined || priority > 3 || priority < 0) {
			this.priority = FRIENDLY_VARS.PRIORITY_MEDIUM;
		} else {
			this.priority = priority;
		}
	}
}