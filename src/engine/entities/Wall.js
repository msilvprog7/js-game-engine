"use strict";

class Wall extends Sprite {
	constructor(id, filename) {
		super(id, "brick.png");
		this.hasPhysics = true;
	}
}