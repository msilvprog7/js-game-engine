"use strict";

var WALL_VARS = {
	FILENAME: "brick.png"
};


class Wall extends Sprite {

	constructor(id, filename) {
		super(id, WALL_VARS.FILENAME);
		this.hasPhysics = true;
	}
	
}