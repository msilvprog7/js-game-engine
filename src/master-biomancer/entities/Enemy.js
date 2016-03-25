"use strict";

var ENEMY_VARS = {
	MOVE_EPSILON: 10	
};

/**
 * Abstract Animals for shared qualities for the different animals
 */
class Enemy extends Entity {

	constructor(id, health, spawnIdle, spawnIdlePivot, attackRate, attackRange) {
		super(id, health, spawnIdle);
		this.spawnIdle = spawnIdle;
		this.spawnIdlePivot = spawnIdlePivot;
		this.direction = 0;
		this.attackRate = attackRate;
		this.attackRange = attackRange;
		this.nextAttackTime = new Date().getTime();
		this.closestFriendlyInSight = undefined;
		this.hasPhysics = true;
		this.initCollisions();		
	}

	update(pressedKeys) {
		super.update(pressedKeys);
		var currentTime = new Date().getTime();

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
		super.draw(g);
	}

	canAttack() {
		// override in subclasses for AI when spawned
		// CALL SUPER - ENFORCES ATTACK RATE
		return this.closestFriendlyInSight !== undefined && 
			new Date().getTime() > this.nextAttackTime && 
			this.closestFriendlyInSight.distance <= this.attackRange;
	}

	attack() {
		// override in subclasses for AI when spawned
		// CALL SUPER - ENFORCES ATTACK RATE
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
		//Returns a list of all friendly entities (Biomancer and animals)
		//Sorted by distance from the enemy
		let allFriendlies = this.getLevel().getFriendlyEntities(),
			inRange = [];
		for(let i = 0; i < allFriendlies.length; i++) {
			let dist = this.distanceTo(allFriendlies[i].position);
			if(dist <= sight_range) {
				inRange.push({obj: allFriendlies[i], distance: dist});
			}
		}
		inRange.sort((a, b) => a.distance-b.distance)
		//return inRange.map(x => x.o);
		return inRange;
	}	
}