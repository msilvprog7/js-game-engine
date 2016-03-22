"use strict";

var BASIC_ENEMY_VARS = {
	SIGHT_RANGE: 700,
	ATTACK_RANGE: 700,
	ATTACK_DMG: 10,
	HEALTH: 50,
	SPEED: 2,
	MOVE_BEHAVIOR: 'NONE'
};

class BasicEnemy extends Enemy {
	constructor(id, health, spawnIdle, spawnIdlePivot) {
		super(id, health, spawnIdle, spawnIdlePivot);
		this.closestFriendlyInSight = undefined;
	}

	move() {
		let friendlies = this.getInSight(BASIC_ENEMY_VARS.SIGHT_RANGE);
		if(friendles.length === 0) {//No animals or biomancer in range, move randomly
			this.closestFriendlyInSight = undefined;
			setMovement(0, 0);
		} else {
			this.closestFriendlyInSight = friendles[0]; //MOVE TOWARDS CLOSEST FRIENDLY
			let posToMove = friendles[0].o.getPosition(),
				xMove = (this.position.x > posToMove.x) ? -1 : (this.position.x < posToMove.x) -1 : 0, 
				yMove = (this.position.y > posToMove.y) ? -1 : (this.position.y < posToMove.y) -1 : 0;
			setMovement(xMove, yMove);
		}
	}

	setMovement(xMove, yMove) { //xMove and yMove are just directions
		this.addToMovement(xMove*BASIC_ENEMY_VARS.SPEED, yMove*BASIC_ENEMY_VARS.SPEED);
		this.setPosition({x: this.position.x + this.xMovement, y: this.position.y + this.yMovement});
		this.orient(xMove, yMove);			
		this.resetMovement();
	}

	canAttack() {
		return this.closestFriendlyInSight.distance <= BASIC_ENEMY_VARS.ATTACK_RANGE;
	}

	attack() {
		//ATTACK CLOSEST FRIENDLY TARGET
	}
}
