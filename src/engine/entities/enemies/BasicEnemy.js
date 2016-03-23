"use strict";

var BASIC_ENEMY_VARS = {
	SIGHT_RANGE: 700,
	ATTACK_RANGE: 700,
	ATTACK_DMG: 10,
	HEALTH: 50,
	SPEED: 2,
	MOVE_BEHAVIOR: 'NONE',
	SPAWN_IDLE: "biomancer/enemies/basic-enemy/basic-enemy.png",
	SPAWN_IDLE_PIVOT: {x: 35, y: 40},
	SPAWN_DIMENSIONS: {width: 70, height: 80}
};

class BasicEnemy extends Enemy {
	constructor() {
		super("basic-enemy-" + BASIC_ENEMY_VARS.count, BASIC_ENEMY_VARS.HEALTH, BASIC_ENEMY_VARS.SPAWN_IDLE, BASIC_ENEMY_VARS.SPAWN_IDLE_PIVOT);
		this.closestFriendlyInSight = undefined;
		BASIC_ENEMY_VARS.count++;
	}

	move() {
		let friendlies = this.getInSight(BASIC_ENEMY_VARS.SIGHT_RANGE);
		if(friendlies.length === 0) {//No animals or biomancer in range, move randomly
			this.closestFriendlyInSight = undefined;
			setMovement(0, 0);
		} else {
			this.closestFriendlyInSight = friendlies[0]; //MOVE TOWARDS CLOSEST FRIENDLY
			let posToMove = friendlies[0].o.getPosition(),
				xMove = (this.position.x > posToMove.x) ? -1 : (this.position.x < posToMove.x) ? -1 : 0, 
				yMove = (this.position.y > posToMove.y) ? -1 : (this.position.y < posToMove.y) ? -1 : 0;
			this.setMovement(xMove, yMove);
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
