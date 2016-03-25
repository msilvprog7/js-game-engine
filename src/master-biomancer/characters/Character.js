"use strict";

var ROTATION = {
	S: 0,
	SW: MathUtil['PI4'],
	W: MathUtil['PI2'],
	NW: MathUtil['3PI4'],
	N: MathUtil['PI'],
	NE: MathUtil['5PI4'],
	E: MathUtil['3PI2'],
	SE: MathUtil['7PI4']
};

class Character extends AnimatedSprite {
	constructor(id, health, idle, maxSpeed) {
		super(id, idle);

		// Initialize direction
		this.direction = 0;

		// Set health
		this.maxHealth = health;
		this.health = health;

		// Set physics
		this.hasPhysics = true;
		this.friction = 0.3;
		this.initCollisions();

		// Set max speed
		this.maxSpeed = maxSpeed;
	}

	update(pressedKeys) {
		// Update animated sprite
		super.update(pressedKeys);
	}

	movementForward(amount) {
		return {
			x: -Math.sin(this.rotation) * amount,
			y: Math.cos(this.rotation) * amount
		};
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
		this.aX = (Math.abs(this.vX) >= Math.abs(-Math.sin(this.rotation) * this.maxSpeed)) ? 0 : this.aX;
		this.aY = (Math.abs(this.vY) >= Math.abs(Math.cos(this.rotation) * this.maxSpeed)) ? 0 : this.aY;
	}

	draw(g) {
		// Draw animated sprite
		super.draw(g);
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

	setLevel(level) {
		this.parent = level;
	}

	getHealthRatio() {
		return (this.maxHealth <= 0) ? 0 : this.health / this.maxHealth;
	}

	removeHealth(hit) {
		// Take damage
		this.health -= hit;

		// Dispatch event
		if (this.health > 0) {
			this.dispatchEvent(EVENTS.HEALTH_UPDATED, {health: this.health});
		} else {
			this.dispatchEvent(EVENTS.DIED);
			this.die();
		}
	}

	isAlive() {
		return this.health > 0;
	}

	die() {
		// Override in subclasses
	}
}