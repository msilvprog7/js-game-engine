"use strict";

var ENEMY_VARS = {	
};

/**
 * Abstract Animals for shared qualities for the different animals
 */
class Enemy extends Entity {

	constructor(id, health, spawnIdle, spawnIdlePivot) {
		super(id, health, spawnIdle);
		this.spawnIdle = spawnIdle;
		this.spawnIdlePivot = spawnIdlePivot;
		this.direction = 0;
	}

	update(pressedKeys) {
		super.update(pressedKeys);
		var currentTime = new Date().getTime();

		// Move
		this.move();

		// Attack	
		if(this.canAttack) {
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

	setDirection(direction) {
		// Assumes clockwise from south in Radians
		this.direction = direction;
		this.setRotation(direction);

		// Reform hitbox
		this.hitbox.applyBoundingBox();
	}

	canAttack() {
		// Nothing here, override in subclasses for AI when spawned
		return false;
	}

	attack() {
		// Nothing here, override in subclasses for AI when spawned
	}

	move() {
		// Nothing here, override in subclasses for AI when spawned			
	}

	orient(x, y) {
		if (x === 0 && y === 0) {
			return;
		}

		if (x < 0 && y > 0) {
			// North-west
			this.setRotation(ROTATION.NW);
		} else if (x > 0 && y > 0) {
			// North-east
			this.setRotation(ROTATION.NE);
		} else if (x > 0 && y < 0) {
			// South-east
			this.setRotation(ROTATION.SE);
		} else if (x < 0 && y < 0) {
			// South-west
			this.setRotation(ROTATION.SW);
		} else if (x < 0 && y === 0) {
			// West
			this.setRotation(ROTATION.W);
		} else if (x === 0 && y > 0) {
			// North
			this.setRotation(ROTATION.N);
		} else if (x > 0 && y === 0) {
			// East
			this.setRotation(ROTATION.E);
		} else if (x === 0 && y < 0) {
			// South
			this.setRotation(ROTATION.S);
		}
	}

	removeHealth(hit) {
		this.health-=hit;
	}

	setLevel(level) {
		this.parent = level;
	}

	getInSight(sight_range) {
		//Returns a list of all friendly entities (Biomancer and animals)
		//Sorted by distance from the enemy
		let allFriendlies = this.parent.getFriendlyEntities(),
			inRange = [];
		for(let i = 0; i < allFriendlies.length; i++) {
			let dist = this.distanceTo(allFriendlies[i].position);
			if(dist <= sight_range) {
				inRange.push({o: allFriendlies[i], distance: dist});
			}
		}
		inRange.sort((a, b) => a.distance-b.distance)
		//return inRange.map(x => x.o);
		return inRange;
	}	
}