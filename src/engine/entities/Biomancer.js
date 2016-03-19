"use strict";

var BIOMANCER_VARS = {
	ID: "player",
	HEALTH: 100,
	FILENAME: "biomancer/main-char/biomancer.png",
	GUN_POSITION: {x: 45, y: 52}
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
		this.gun.setPosition(BIOMANCER_VARS.GUN_POSITION);
		this.addChild(this.gun);
	}

	update(pressedKeys) {
		super.update(pressedKeys);

		// Left
		if (pressedKeys.contains(37)) {
			this.addToMovement(-1, 0);
		}

		// Up
		if (pressedKeys.contains(38)) {
			this.addToMovement(0, -1);
		}

		// Right
		if (pressedKeys.contains(39)) {
			this.addToMovement(1, 0);
		}

		// Down
		if (pressedKeys.contains(40)) {
			this.addToMovement(0, 1);
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
			this.rotation = 3 * Math.PI / 4;
		} else if (pressedKeys.contains(38) && pressedKeys.contains(39)) {
			// North-east
			this.rotation = 5 * Math.PI / 4;
		} else if (pressedKeys.contains(39) && pressedKeys.contains(40)) {
			// South-east
			this.rotation = 7 * Math.PI / 4;
		} else if (pressedKeys.contains(40) && pressedKeys.contains(37)) {
			// South-west
			this.rotation = Math.PI / 4;
		} else if (pressedKeys.contains(37)) {
			// West
			this.rotation = Math.PI / 2;
		} else if (pressedKeys.contains(38)) {
			// North
			this.rotation = Math.PI;
		} else if (pressedKeys.contains(39)) {
			// East
			this.rotation = 3 * Math.PI / 2;
		} else if (pressedKeys.contains(40)) {
			// South
			this.rotation = 0;
		}
	}

}