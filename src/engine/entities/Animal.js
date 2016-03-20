"use strict";

var ANIMAL_VARS = {
	NEXT_DECAY: 1000 // ms
}

/**
 * Abstract Animals for shared qualities for the different animals
 */
class Animal extends Entity {

	constructor(id, health, launchIdle, launchIdlePivot, spawnIdle, spawnIdlePivot, launchSpeed, launchDuration, decayAmount) {
		super(id, health, launchIdle);
		this.launchIdlePivot = launchIdlePivot;
		this.spawnIdle = spawnIdle;
		this.spawnIdlePivot = spawnIdlePivot;
		this.launchSpeed = launchSpeed;
		this.spawnTime = new Date().getTime() + launchDuration;
		this.spawned = false;
		this.direction = 0;
		this.decayAmount = decayAmount;
	}

	update(pressedKeys) {
		super.update(pressedKeys);

		var currentTime = new Date().getTime();

		// Spawn
		if (!this.spawned && currentTime >= this.spawnTime) {
			this.spawn();
		}

		// Launch
		if (!this.spawned) {
			this.launch();
		}

		// Move
		if (this.spawned) {
			this.move();
		}

		// Decay
		if (this.spawned && currentTime >= this.nextDecay) {
			this.decay();
		}
	}

	draw(g) {
		super.draw(g);
	}

	hasSpawned() {
		return this.spawned;
	}

	setDirection(direction) {
		// Assumes clockwise from south in Radians
		this.direction = direction;
		this.rotation = direction;
	}

	spawn() {
		//
		var flipX = this.getRotation() > Math.PI / 2 && this.getRotation() <= 3 * Math.PI / 2,
			flipY = this.getRotation() > Math.PI / 2 && this.getRotation() <= 3 * Math.PI / 2;

		// Change idle image and reposition to center
		this.addAnimation("idle", {images: [this.spawnIdle], loop: true});
		this.hitbox.setHitboxFromImage({width: 2 * this.spawnIdlePivot.x, height: 2 * this.spawnIdlePivot.y});
		this.hitbox.update();
		this.setPosition({
			x: this.position.x + ((flipX) ? -1 : 1) * (this.launchIdlePivot.x - this.spawnIdlePivot.x),
			y: this.position.y + ((flipY) ? -1 : 1) * (this.launchIdlePivot.y - this.spawnIdlePivot.y)
		});

		// Time till next decay
		this.nextDecay = new Date().getTime() + ANIMAL_VARS.NEXT_DECAY;

		this.spawned = true;
	}

	launch() {
		// Launch further, based on direction in Radians, clockwise from south
		this.setPosition({
			x: this.position.x - this.launchSpeed * Math.sin(this.direction), 
			y: this.position.y + this.launchSpeed * Math.cos(this.direction)
		});
	}

	move() {
		// Nothing here, override in subclasses for AI when spawned
	}

	decay() {
		this.health -= this.decayAmount;
		console.log("[DECAY] " + this.id + ": " + this.health);
		// Time till next decay
		this.nextDecay = new Date().getTime() + ANIMAL_VARS.NEXT_DECAY;
	}
}