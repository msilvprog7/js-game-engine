"use strict";

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

class Entity extends AnimatedSprite {
	constructor(id, health, idle) {
		super(id, idle);
		this.maxHealth = health;
		this.health = health;
		// this.xMovement = 0;
		// this.yMovement = 0;
		this.friction = 0.3;
	}

	update(pressedKeys) {
		// Update animated sprite
		super.update(pressedKeys);
	}

	addToMovement(x, y) {
		// this.xMovement += x;
		// this.yMovement += y;
		this.vX += x;
		this.vY += y;
	}

	movementForward(amount) {
		return {
			x: -Math.sin(this.rotation) * amount,
			y: Math.cos(this.rotation) * amount
		};
	}

	resetMovement() {
		// this.xMovement = 0;
		// this.yMovement = 0;
		this.vX = 0;
		this.vY = 0;
	}

	setDirection(direction) {
		// Assumes clockwise from south in Radians
		this.direction = direction;
		this.setRotation(direction);

		// Reform hitbox
		this.hitbox.applyBoundingBox();
	}

	orient(x, y) {
		if (x === 0 && y === 0) {
			return;
		}

		if (x < 0 && y < 0) {
			// North-west
			this.setDirection(ROTATION.NW);
		} else if (x > 0 && y < 0) {
			// North-east
			this.setDirection(ROTATION.NE);
		} else if (x > 0 && y > 0) {
			// South-east
			this.setDirection(ROTATION.SE);
		} else if (x < 0 && y > 0) {
			// South-west
			this.setDirection(ROTATION.SW);
		} else if (x < 0 && y === 0) {
			// West
			this.setDirection(ROTATION.W);
		} else if (x === 0 && y < 0) {
			// North
			this.setDirection(ROTATION.N);
		} else if (x > 0 && y === 0) {
			// East
			this.setDirection(ROTATION.E);
		} else if (x === 0 && y > 0) {
			// South
			this.setDirection(ROTATION.S);
		}
	}	

	move() {
		// this.setPosition({x: this.position.x + this.xMovement, y: this.position.y + this.yMovement});
		// this.setPosition({x: this.position.x + this.vX, y: this.position.y + this.vY});

		this.resetMovement();
	}

	draw(g) {
		// Draw animated sprite
		super.draw(g);
	}

	getHealthRatio() {
		return (this.maxHealth <= 0) ? 0 : this.health / this.maxHealth;
	}

	removeHealth(hit) {
		this.health-=hit;
		if (this.health > 0) {
			// Dispatch event
			this.dispatchEvent(EVENTS.HEALTH_UPDATED, {health: this.health});
			
		} else {
			// Dispatch event
			this.dispatchEvent(EVENTS.DIED);
		}
	}

	isAlive() {
		return this.health > 0;
	}

	getLevel() {
		let l = this.parent, iters = 0;
		while(!(l instanceof Level)) {
			l = l.parent;
			iters++;
			if(iters > 10) { return undefined; }
		}
		return l;
	}
}