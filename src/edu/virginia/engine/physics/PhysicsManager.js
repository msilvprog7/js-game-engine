"use strict";

let _physicsManagerInstance = null;

// Physics constants
var PHYSICS = {
	GRAVITY: 30
};

/**
 * A singleton class to manage physics within our engine for all
 * body components (consist of DisplayObjects)
 * 
 * */
class PhysicsManager{

	constructor() {
		if (!_physicsManagerInstance) {
			_physicsManagerInstance = this;

			this.bodies = [];
		}

		return _physicsManagerInstance;
	}

	update(timedelta) {
		// Modify timedelta
		timedelta = timedelta * 0.005;
		// Update physics on all bodies
		this.bodies.filter(b => b.behavior === BODY.DYNAMIC).forEach(b => b.update(timedelta));
		// Detect collisions
		this.checkCollisions();
	}

	checkCollisions() {
		// For now - check collisions with all bodies that are collidable
		for (let i = 0; i < (this.bodies.length - 1); i++) {
			for (let j = (i + 1); j < this.bodies.length; j++) {
				this.bodies[i].checkCollision(this.bodies[j]);
			}
		}
	}

	addBody(body) {
		this.bodies.push(body);
	}

	removeBody(body) {
		this.bodies.splice(this.bodies.indexOf(body), 1);
	}

}