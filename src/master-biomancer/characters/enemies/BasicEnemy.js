"use strict";

var BASIC_ENEMY_VARS = {
	count: 0,
	SIGHT_RANGE: 500,
	ATTACK_RANGE: 300,
	ATTACK_DMG: 10,
	BULLET_SPEED: 10,
	ATTACK_RATE: 2000, //ms between attacks
	HEALTH: 50,
	SPEED: 2,
	MOVE_BEHAVIOR: 'NONE',
	SPAWN_IDLE: "biomancer/enemies/basic-enemy/basic-enemy.png",
	SPAWN_IDLE_PIVOT: {x: 35, y: 15},
	SPAWN_DIMENSIONS: {width: 70, height: 70}
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
		if(friendlies.length === 0) {
			//No animals or biomancer in range, move randomly
			this.closestFriendlyInSight = undefined;
			this.vX = 0;
			this.vY = 0;
		} else {
			//MOVE TOWARDS CLOSEST FRIENDLY
			this.closestFriendlyInSight = friendlies[0];
			let posToMove = friendlies[0].obj.getPosition(),
				xMove = (this.position.x-ENEMY_VARS.MOVE_EPSILON > posToMove.x) ? -1 : (this.position.x+ENEMY_VARS.MOVE_EPSILON < posToMove.x) ? 1 : 0, 
				yMove = (this.position.y-ENEMY_VARS.MOVE_EPSILON > posToMove.y) ? -1 : (this.position.y+ENEMY_VARS.MOVE_EPSILON < posToMove.y) ? 1 : 0;

			if(this.closestFriendlyInSight.distance <= this.attackRange) { 
				this.orient(xMove, yMove);
				return; 
			}

			this.vX = xMove*BASIC_ENEMY_VARS.SPEED;
			this.vY = yMove*BASIC_ENEMY_VARS.SPEED;
			this.orient(xMove, yMove);	
		}

		super.move();
	}

	attack() {
		super.attack();

		//ATTACK CLOSEST FRIENDLY TARGET
		let friendPivot = this.closestFriendlyInSight.obj.getNormalizedPivotPoint(),
			myPivot = this.getNormalizedPivotPoint(),
			direction = MathUtil['3PI2']-Math.atan2((myPivot.y - friendPivot.y), (friendPivot.x - myPivot.x));

		if(direction >= MathUtil['2PI']) { 
			direction -= MathUtil['2PI'];
		}
		
 		new Bullet(BASIC_ENEMY_VARS.BULLET_SPEED, BASIC_ENEMY_VARS.ATTACK_DMG, direction, myPivot, this.getLevel());
	}
}
