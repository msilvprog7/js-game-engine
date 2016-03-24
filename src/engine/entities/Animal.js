"use strict";

// A specific animal's duration will equal (HEALTH / DECAY_AMOUNT) * ANIMAL_VARS.NEXT_DECAY
var ANIMAL_VARS = {
	NEXT_DECAY: 250 // ms
}

/**
 * Abstract Animals for shared qualities for the different animals
 */
class Animal extends Entity {

	constructor(id, health, launchIdle, launchIdlePivot, spawnIdle, spawnIdlePivot, launchSpeed, launchDuration, decayAmount, radius) {
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
		this.radius = radius;
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
		if (this.spawned && this.health > 0) {
			this.move();
		}

		// Decay
		if (this.spawned && this.health > 0 && currentTime >= this.nextDecay) {
			this.decay();
		}
	}

	draw(g) {
		// DEBUG: radius
		if (this.spawned && this.health > 0) {
			this.drawRadius(g);
		}

		super.draw(g);
	}

	hasSpawned() {
		return this.spawned;
	}

	getRadius() {
		return this.radius;
	}

	drawRadius(g) {
		// Save state
		g.save();

		// Colors and styles
		g.strokeStyle = "#4472C1";
		g.fillStyle = "#5381C6";
		g.lineWidth = 2;
		g.globalAlpha = 0.8;

		// Draw circle
		g.beginPath();
		g.arc(this.radiusPosition.x, this.radiusPosition.y, this.radius, 0, 2 * Math.PI, false);
		g.fill();
		g.stroke();

		// Cleanup
		g.restore();
	}

	positionInRadius(position) {
		var afterMove = {
			x: this.position.x + this.spawnIdlePivot.x + position.x, 
			y: this.position.y + this.spawnIdlePivot.y + position.y
		};
		return (MathUtil.euclidianDist(afterMove, this.radiusPosition) <= this.radius);
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
		this.setPivotPoint({x: this.spawnIdlePivot.x, y: this.spawnIdlePivot.y});

		// Reapply rotation and reform hitbox
		this.setRotation(this.rotation);

		// Set radius location
		this.radiusPosition = {x: this.position.x + this.spawnIdlePivot.x, y: this.position.y + this.spawnIdlePivot.y};

		// Time till next decay
		this.nextDecay = new Date().getTime() + ANIMAL_VARS.NEXT_DECAY;	
		// Tell level to monitor health
		this.getLevel().monitorHealth(this);

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
		super.move();
	}

	decay() {
		// Apply decay
		this.removeHealth(this.decayAmount);
		// Time till next decay
		if(this.health > 0) {
			this.nextDecay = new Date().getTime() + ANIMAL_VARS.NEXT_DECAY;			
		}
	}
}