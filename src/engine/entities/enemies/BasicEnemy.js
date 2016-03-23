"use strict";

var BASIC_ENEMY_VARS = {
	count: 0,
	SIGHT_RANGE: 700,
	ATTACK_RANGE: 300,
	ATTACK_DMG: 10,
	ATTACK_RATE: 2000, //ms between attacks
	HEALTH: 50,
	SPEED: 2,
	MOVE_BEHAVIOR: 'NONE',
	SPAWN_IDLE: "biomancer/enemies/basic-enemy/basic-enemy.png",
	SPAWN_IDLE_PIVOT: {x: 35, y: 40},
	SPAWN_DIMENSIONS: {width: 70, height: 80}
};

class BasicEnemy extends Enemy {
	constructor() {
		super("basic-enemy-" + BASIC_ENEMY_VARS.count, BASIC_ENEMY_VARS.HEALTH, 
			BASIC_ENEMY_VARS.SPAWN_IDLE, BASIC_ENEMY_VARS.SPAWN_IDLE_PIVOT, 
			BASIC_ENEMY_VARS.ATTACK_RATE, BASIC_ENEMY_VARS.ATTACK_RANGE);
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
				xMove = (this.position.x-ENEMY_VARS.MOVE_EPSILON > posToMove.x) ? -1 : (this.position.x+ENEMY_VARS.MOVE_EPSILON < posToMove.x) ? 1 : 0, 
				yMove = (this.position.y-ENEMY_VARS.MOVE_EPSILON > posToMove.y) ? -1 : (this.position.y+ENEMY_VARS.MOVE_EPSILON < posToMove.y) ? 1 : 0;
			if(this.closestFriendlyInSight.distance <= this.attackRange) { 
				this.orient(xMove, yMove);	
				return; 
			}			
			this.setMovement(xMove, yMove);
		}
	}

	setMovement(xMove, yMove) { //xMove and yMove are just directions
		if(xMove === 0 && yMove === 0) { this.resetMovement(); return; }
		this.addToMovement(xMove*BASIC_ENEMY_VARS.SPEED, yMove*BASIC_ENEMY_VARS.SPEED);
		this.setPosition({x: this.position.x + this.xMovement, y: this.position.y + this.yMovement});
		this.orient(xMove, yMove);			
		this.resetMovement();
	}

	attack() {
		super.attack();
		//ATTACK CLOSEST FRIENDLY TARGET
	}
}
