"use strict";

var BIOMANCER_VARS = {
	ID: "player",
	HEALTH: 100,
	FILENAME: "biomancer/main-char/biomancer.png",
	DIMENSIONS: {width: 60, height: 70},
	PIVOT: {x: 30, y: 35},
	GUN_POSITION: {x: 45, y: 52},
	SPEED: 3,
	V_MAX: 4,
	RUN_ACC: 1,
	ADD_DEFAULTS: {
		parentIsLevel: true,
		indexReferenceEntity: undefined, //Leave undefined for before focus child, or if no child exists appending to end
		indexReferencePlacing: true, //True or undefined is before, false is after
		monitorHealth: true //True only if monitor health from start
	}
};


/**
 * Main character
 */
class Biomancer extends Character {

	constructor() {
		super(BIOMANCER_VARS.ID, BIOMANCER_VARS.HEALTH, BIOMANCER_VARS.FILENAME, BIOMANCER_VARS.V_MAX);

		// Set your gun
		this.setGun(new Gun());
	}

	setGun() {
		// Remove old gun
		if (this.gun !== undefined) {
			this.removeChild(this.gun);
		}

		// Create and add new gun
		this.gun = new Gun();
		this.gun.setParent(this);
		this.gun.setPosition(BIOMANCER_VARS.GUN_POSITION);
		this.addChild(this.gun);
	}

	update(pressedKeys) {
		// Parent update
		super.update(pressedKeys);

		// Reset
		this.aX = 0;
		this.aY = 0;

		// Orient and move
		if (this.orient(pressedKeys)) {
			this.aX = -Math.sin(this.rotation) * BIOMANCER_VARS.RUN_ACC;
			this.aY = Math.cos(this.rotation) * BIOMANCER_VARS.RUN_ACC;
		}

		// Cap the move
		super.move();
	}

	orient(pressedKeys) {
		var arrowKeys = [37, 38, 39, 40],
			numArrowKeys = pressedKeys.contents.filter(x => arrowKeys.indexOf(x) >= 0).length;

		if (numArrowKeys <= 0 || numArrowKeys > 2) {
			return false;
		}

		if (pressedKeys.contains(37) && pressedKeys.contains(38)) {
			// North-west
			this.setRotation(ROTATION.NW);
		} else if (pressedKeys.contains(38) && pressedKeys.contains(39)) {
			// North-east
			this.setRotation(ROTATION.NE);
		} else if (pressedKeys.contains(39) && pressedKeys.contains(40)) {
			// South-east
			this.setRotation(ROTATION.SE);
		} else if (pressedKeys.contains(40) && pressedKeys.contains(37)) {
			// South-west
			this.setRotation(ROTATION.SW);
		} else if (pressedKeys.contains(37)) {
			// West
			this.setRotation(ROTATION.W);
		} else if (pressedKeys.contains(38)) {
			// North
			this.setRotation(ROTATION.N);
		} else if (pressedKeys.contains(39)) {
			// East
			this.setRotation(ROTATION.E);
		} else if (pressedKeys.contains(40)) {
			// South
			this.setRotation(ROTATION.S);
		}

		return true;
	}

}
