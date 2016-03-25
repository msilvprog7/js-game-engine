"use strict";

var ENEMY_VARS = {
	MOVE_EPSILON: 10	
};

/**
 * Abstract Animals for shared qualities for the different animals
 */
class Enemy extends Character {

	constructor(id, health, spawnIdle, spawnIdlePivot, attackRate, attackRange, maxSpeed) {
		super(id, health, spawnIdle, maxSpeed);

		this.spawnIdle = spawnIdle;
		this.spawnIdlePivot = spawnIdlePivot;
		this.direction = 0;
		this.attackRate = attackRate;
		this.attackRange = attackRange;
		this.nextAttackTime = new Date().getTime();
		this.closestFriendlyInSight = undefined;	
	}

	update(pressedKeys) {
		super.update(pressedKeys);

		// Move
		this.move();

		// Attack	
		if(this.canAttack()) {
			this.attack();
		}

		// Die
		if (this.spawned && this.health <= 0) {
			this.dispatchEvent(EVENTS.DIED);
		}
	}

	draw(g) {
		// Call Character's draw
		super.draw(g);
	}

	canAttack() {
		// Call super in subclasses to enforce attack rate and range
		return this.closestFriendlyInSight !== undefined && 
			new Date().getTime() > this.nextAttackTime && 
			this.closestFriendlyInSight.distance <= this.attackRange;
	}

	attack() {
		// Call super in subclasses to enforce attack rate
		this.nextAttackTime = new Date().getTime() + this.attackRate;
	}

	move() {
		// Nothing here, override in subclasses for AI when spawned	
		super.move();		
	}	

	setLevel(level) {
		this.parent = level;
	}

	getInSight(sight_range) {
		// Returns a list of all friendly entities (Biomancer and animals) 
		// sorted by distance from the enemy
		let allFriendlies = this.getLevel().getFriendlyEntities(),
			inRange = [];
		for(let i = 0; i < allFriendlies.length; i++) {
			let dist = this.distanceTo(allFriendlies[i].position);
			if(dist <= sight_range) {
				// In range format: obj, distance
				inRange.push({obj: allFriendlies[i], distance: dist});
			}
		}
		inRange.sort((a, b) => a.distance-b.distance);
		return inRange;
	}	
}