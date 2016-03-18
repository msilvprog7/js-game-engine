"use strict";

class Entity extends AnimatedSprite {
	constructor(id, health) {
		super(id, undefined);
		this.health = health;
	}

	update(pressedKeys) {
		// Update aanimated sprite
		super.update();
		// Move
		this.move();
	}

	move() {
		// Nothing at this level
	}

	draw() {
		// Draw animated sprite
		super.draw();
	}

	isAlive() {
		return this.health > 0;
	}
}