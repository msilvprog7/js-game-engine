"use strict";

class Entity extends AnimatedSprite {
	constructor(id, health, idle) {
		super(id, idle);
		this.health = health;
		this.xMovement = 0;
		this.yMovement = 0;
	}

	update(pressedKeys) {
		// Update animated sprite
		super.update(pressedKeys);
	}

	addToMovement(x, y) {
		this.xMovement += x;
		this.yMovement += y;
	}

	resetMovement() {
		this.xMovement = 0;
		this.yMovement = 0;
	}

	move() {
		this.setPosition({x: this.position.x + this.xMovement, y: this.position.y + this.yMovement});
		this.resetMovement();
	}

	draw(g) {
		// Draw animated sprite
		super.draw(g);
	}

	isAlive() {
		return this.health > 0;
	}
}