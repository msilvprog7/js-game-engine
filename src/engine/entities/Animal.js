"use strict";

// A specific animal's duration will equal (HEALTH / DECAY_AMOUNT) * ANIMAL_VARS.NEXT_DECAY
var ANIMAL_VARS = {
	NEXT_DECAY: 250 // ms
}

/**
 * Abstract Animals for shared qualities for the different animals
 */
class Animal extends Entity {

	constructor(id, health, launchIdle, launchIdlePivot, spawnIdle, spawnIdlePivot, launchSpeed, launchDuration, decayAmount) {
		super(id, health, launchIdle);
		this.launchIdle = launchIdle;
		this.launchIdlePivot = launchIdlePivot;
		this.spawnIdle = spawnIdle;
		this.spawnIdlePivot = spawnIdlePivot;
		this.launchSpeed = launchSpeed;
		this.spawnTime = new Date().getTime() + launchDuration;
		this.spawned = false;
		this.direction = 0;
		this.decayAmount = decayAmount;
		this.level = undefined;
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
		if (this.spawned && this.health > 0 && currentTime >= this.nextDecay) {
			this.decay();
		}
	}

	draw(g) {
		super.draw(g);
	}

	setLevel(level) {
		this.level = level;
	}

	getLevel() {
		return this.level;
	}

	hasSpawned() {
		return this.spawned;
	}

	setDirection(direction) {
		// Assumes clockwise from south in Radians
		this.direction = direction;
		this.setRotation(direction);

		// Reform hitbox
		this.hitbox.applyBoundingBox();
	}

	spawn() {
		// Change idle image and reposition to center
		this.addAnimation("idle", {images: [this.spawnIdle], loop: true});

		// Reset hitbox
		this.hitbox.setHitboxFromImage({width: 2 * this.spawnIdlePivot.x, height: 2 * this.spawnIdlePivot.y});

		// Set position
		this.setPosition({
			x: this.position.x + (this.launchIdlePivot.x - this.spawnIdlePivot.x),
			y: this.position.y + (this.launchIdlePivot.y - this.spawnIdlePivot.y)
		});

		// Set pivot point
		this.setPivotPoint({x: this.spawnIdlePivot.x, y: this.spawnIdlePivot.y });

		// Reapply rotation and reform hitbox
		this.setRotation(this.rotation);

		// Time till next decay
		this.nextDecay = new Date().getTime() + ANIMAL_VARS.NEXT_DECAY;

		// Tell level to monitor health
		this.level.monitorHealth(this);

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
		// Apply decay
		this.health -= this.decayAmount;

		// Update event
		if (this.health > 0) {
			// Dispatch event
			this.dispatchEvent(EVENTS.HEALTH_UPDATED, {health: this.health});

			// Time till next decay
			this.nextDecay = new Date().getTime() + ANIMAL_VARS.NEXT_DECAY;
		} else {
			// Dispatch event
			this.dispatchEvent(EVENTS.DIED);
		}
	}
}