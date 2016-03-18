"use strict";

var BIOMANCER_VARS = {
	ID: "player",
	HEALTH: 100
};


/**
 * Main character
 */
class Biomancer extends Entity {

	constructor(id) {
		super(BIOMANCER_VARS.ID, BIOMANCER_VARS.HEALTH);
		this.gun = new Gun();
	}

}