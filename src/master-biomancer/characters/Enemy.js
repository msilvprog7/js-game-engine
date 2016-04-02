"use strict";

var ENEMY_VARS = {
	ADD_DEFAULTS: {
		parentIsLevel: true,
		indexReferenceEntity: undefined, //Leave undefined for focusChild
		indexReferencePlacing: false, //True is before, false is after
		monitorHealth: true //True only if monitor health from start
	}
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
		let cur_time = new Date().getTime();
		this.nextAttackTime = cur_time;
		this.nextUpdate = cur_time;

	}

	update(pressedKeys) {
		super.update(pressedKeys);

		let cur_time = new Date().getTime();
			if(cur_time > this.nextUpdate) {
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
			this.nextUpdate = cur_time + 30;
		}		
	}

	draw(g) {
		// Call Character's draw
		super.draw(g);
	}

	canAttack() {
		return this.friendlyFocus !== undefined && 
			new Date().getTime() > this.nextAttackTime && 
			this.friendlyFocus.distance <= this.attackRange;
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
			priorityInRange = [];
		for(let i = 0; i < allFriendlies.length; i++) {
			if(allFriendlies[i].isAlive()) {
				let dist = this.distanceTo(allFriendlies[i].position);
				if(dist <= sight_range) {
					// In range format: obj, distance
					priorityInRange.push({obj: allFriendlies[i], distance: dist});
				}
			}			
		}
		priorityInRange.sort((a, b) => {
			if(a.obj.priority === b.obj.priority) {
				return (a.distance - b.distance);
			} else {
				return b.obj.priority-a.obj.priority;
			}
		});
		return priorityInRange;
	}	
}