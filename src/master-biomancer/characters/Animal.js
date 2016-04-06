"use strict";

// A specific animal's duration will equal (HEALTH / DECAY_AMOUNT) * ANIMAL_VARS.NEXT_DECAY
var ANIMAL_VARS = {
	NEXT_DECAY: 250, // ms
	ADD_DEFAULTS: {
		parentIsLevel: true,
		indexReferenceEntity: undefined, //Leave undefined for focusChild
		indexReferencePlacing: true, //True is before, false is after
		monitorHealth: false //True only if monitor health from start
	}
}

/**
 * Abstract Animals for shared qualities for the different animals
 */
class Animal extends Friendly {

	constructor(id, health, launchIdle, launchIdlePivot, spawnIdle, spawnIdlePivot, 
		launchSpeed, launchDuration, decayAmount, walkRange, sightRange,
		attackRate, attackRange, maxSpeed, priority) {

		super(id, health, launchIdle, maxSpeed, priority);

		// Idle images and pivots
		this.launchIdle = launchIdle;
		this.launchIdlePivot = launchIdlePivot;
		this.spawnIdle = spawnIdle;
		this.spawnIdlePivot = spawnIdlePivot;

		// Launch/Spawn times
		this.launchSpeed = launchSpeed;
		this.spawnTime = new Date().getTime() + launchDuration;
		this.spawned = false;

		// Attacks
		this.nextAttackTime = new Date().getTime();
		this.enemyFocus = undefined;
		this.decayAmount = decayAmount;

		// Ranges
		this.walkRange = walkRange;
		this.sightRange = sightRange;
		this.attackRate = attackRate;
		this.attackRange = attackRange;
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

		if (this.spawned && this.canAttack()) {
			this.attack();
		}

		// Decay
		if (this.spawned && this.health > 0 && currentTime >= this.nextDecay) {
			this.decay();
		}
	}

	draw(g) {
		// DEBUG: radius
		/*
		if (this.spawned && this.health > 0) {
			this.drawWalkRange(g);
		}
		*/

		super.draw(g);
	}

	hasSpawned() {
		return this.spawned;
	}

	drawWalkRange(g) {
		// Save state
		g.save();

		// Colors and styles
		g.strokeStyle = "#4472C1";
		g.fillStyle = "#5381C6";
		g.lineWidth = 2;
		g.globalAlpha = 0.8;

		// Draw circle
		g.beginPath();
		g.arc(this.walkRangePosition.x, this.walkRangePosition.y, this.walkRange, 0, MathUtil['2PI'], false);
		g.fill();
		g.stroke();

		// Cleanup
		g.restore();
	}

	positionInWalkRange(position) {
		var afterMove = {
			x: this.position.x + this.spawnIdlePivot.x + position.x, 
			y: this.position.y + this.spawnIdlePivot.y + position.y
		};
		return (MathUtil.euclidianDist(afterMove, this.walkRangePosition) <= this.walkRange);
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
		this.walkRangePosition = {x: this.position.x + this.spawnIdlePivot.x, y: this.position.y + this.spawnIdlePivot.y};

		// Time till next decay
		this.nextDecay = new Date().getTime() + ANIMAL_VARS.NEXT_DECAY;	

		// Tell level to monitor health
		this.getLevel().monitorHealth(this);

		this.spawned = true;
	}

	launch() {
		// Launch further, based on direction in Radians, clockwise from south
		this.vX = -Math.sin(this.direction) * this.launchSpeed;
		this.vY = Math.cos(this.direction) * this.launchSpeed;
		super.move();
	}

	move() {
		// Nothing here, override in subclasses for AI when spawned
		super.move();
	}

	getInSightRange() {
		//Returns a list of all friendly entities (Biomancer and animals)
		//Sorted by distance from the enemy
		let allEnemies = this.getLevel().getEnemyEntities(),
			inRange = [];
		for(let i = 0; i < allEnemies.length; i++) {
			let dist = this.distanceTo(allEnemies[i].getNormalizedPivotPoint());
			if(dist <= this.sightRange) {
				// In range format: obj, distance
				inRange.push({obj: allEnemies[i], distance: dist});
			}
		}
		inRange.sort((a, b) => a.distance - b.distance);
		return inRange;
	}	

	getObstaclesInSightRange() {
		//Returns a list of all obstacles within range
		//sorted by distance
		let allObstacles = this.getLevel().obstacles,
			inRange = [];
		for(let i = 0; i < allObstacles.length; i++) {
			let dist = this.distanceTo(allObstacles[i].getNormalizedPivotPoint());
			if(dist <= this.sightRange) {
				// In range format: obj, distance
				inRange.push({obj: allObstacles[i], distance: dist});
			}
		}
		inRange.sort((a, b) => a.distance - b.distance);
		return inRange;
	}

	canAttack() {
		// Call super in subclasses to enforce attack rate
		return this.enemyFocus !== undefined && 
			new Date().getTime() > this.nextAttackTime && 
			this.distanceTo(this.enemyFocus.obj.getNormalizedPivotPoint()) <= this.attackRange;
	}

	attack() {
		// Calll super in subclasses to enforce attack rate
		this.nextAttackTime = new Date().getTime() + this.attackRate;
	}

	decay() {
		// Apply decay
		this.removeHealth(this.decayAmount, DAMAGE_TYPES["PURE"]);

		// Time till next decay
		if(this.health > 0) {
			this.nextDecay = new Date().getTime() + ANIMAL_VARS.NEXT_DECAY;			
		}
	}
}