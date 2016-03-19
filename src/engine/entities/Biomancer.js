"use strict";

var BIOMANCER_VARS = {
	ID: "player",
	HEALTH: 100,
	FILENAME: "biomancer/main-char/biomancer.png",
	GUN_POSITION: {x: 45, y: 52},
	SPEED: 3
};
var ROTATION = {
	S: 0,
	SW: Math.PI/4,
	W: Math.PI/2,
	NW: 3 * Math.PI/4,
	N: Math.PI,
	NE: 5 * Math.PI/4,
	E: 3 * Math.PI/2,
	SE: 7 * Math.PI/4
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
			this.rotation = ROTATION.NW;
		} else if (pressedKeys.contains(38) && pressedKeys.contains(39)) {
			// North-east
			this.rotation = ROTATION.NE;
		} else if (pressedKeys.contains(39) && pressedKeys.contains(40)) {
			// South-east
			this.rotation = ROTATION.SE;
		} else if (pressedKeys.contains(40) && pressedKeys.contains(37)) {
			// South-west
			this.rotation = ROTATION.SW;
		} else if (pressedKeys.contains(37)) {
			// West
			this.rotation = ROTATION.W;
		} else if (pressedKeys.contains(38)) {
			// North
			this.rotation = ROTATION.N;
		} else if (pressedKeys.contains(39)) {
			// East
			this.rotation = ROTATION.E;
		} else if (pressedKeys.contains(40)) {
			// South
			this.rotation = ROTATION.S;
		}
	}

}
