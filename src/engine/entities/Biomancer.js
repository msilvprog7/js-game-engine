"use strict";

var BIOMANCER_VARS = {
	ID: "player",
	HEALTH: 100,
	FILENAME: "biomancer/main-char/biomancer.png",
	DIMENSIONS: {width: 60, height: 70},
	PIVOT: {x: 30, y: 35},
	GUN_POSITION: {x: 45, y: 52},
	SPEED: 3
};

/**
 * Main character
 */
class Biomancer extends Entity {

	constructor() {
		super(BIOMANCER_VARS.ID, BIOMANCER_VARS.HEALTH, BIOMANCER_VARS.FILENAME);
		this.setGun(new Gun());
	}

	setGun() {
		if (this.gun !== undefined) {
			this.removeChild(this.gun);
		}

		this.gun = new Gun();
		this.gun.setParent(this);
		this.gun.setPosition(BIOMANCER_VARS.GUN_POSITION);
		this.addChild(this.gun);
	}

	getLevel() {
		return this.getParent();
	}

	update(pressedKeys) {
		super.update(pressedKeys);

		// Left
		if (pressedKeys.contains(37)) {
			this.addToMovement(-BIOMANCER_VARS.SPEED, 0);
		}

		// Up
		if (pressedKeys.contains(38)) {
			this.addToMovement(0, -BIOMANCER_VARS.SPEED);
		}

		// Right
		if (pressedKeys.contains(39)) {
			this.addToMovement(BIOMANCER_VARS.SPEED, 0);
		}

		// Down
		if (pressedKeys.contains(40)) {
			this.addToMovement(0, BIOMANCER_VARS.SPEED);
		}

		// Set Rotation
		this.orient(pressedKeys);

		this.move();
	}

	orient(pressedKeys) {
		if (pressedKeys.length == 0 || pressedKeys.length > 2) {
			return;
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
	}

}
