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
	SPAWN_DIMENSIONS: {width: 70, height: 70},
	BULLET_IMG: "biomancer/misc/bullet.png",
	BULLET_FUNCTION: function(collider, dmg) {
		if(collider instanceof Friendly) {
			collider.removeHealth(dmg);
		}
	}
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
		if(friendlies.length === 0 && (this.friendlyFocus === undefined || !this.friendlyFocus.isAlive())) {
			//No animals or biomancer in range, move randomly
			this.friendlyFocus = undefined;
			this.vX = 0;
			this.vY = 0;
		} else {
			//MOVE TOWARDS HIGHEST PRIORITY FRIENDLY, CLOSEST IF FRIENDLIES SHARE PRIORITY
			if(friendlies.length > 0 && (this.friendlyFocus === undefined || friendlies[0].obj !== this.friendlyFocus || !this.friendlyFocus.isAlive())) {
				this.friendlyFocus = friendlies[0];
			}
			let posToMove = this.friendlyFocus.obj.getPosition(),
				xMove = (this.position.x-CHARACTER_VARS.MOVE_EPSILON > posToMove.x) ? -1 : (this.position.x+CHARACTER_VARS.MOVE_EPSILON < posToMove.x) ? 1 : 0, 
				yMove = (this.position.y-CHARACTER_VARS.MOVE_EPSILON > posToMove.y) ? -1 : (this.position.y+CHARACTER_VARS.MOVE_EPSILON < posToMove.y) ? 1 : 0;

			if(this.friendlyFocus.distance <= this.attackRange) { 
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
		let friendPivot = this.friendlyFocus.obj.getNormalizedPivotPoint(),
			myPivot = this.getNormalizedPivotPoint(),
			direction = MathUtil['3PI2']-Math.atan2((myPivot.y - friendPivot.y), (friendPivot.x - myPivot.x));

		if(direction >= MathUtil['2PI']) { 
			direction -= MathUtil['2PI'];
		}
		
 		new Bullet(this, BASIC_ENEMY_VARS.BULLET_IMG, BASIC_ENEMY_VARS.BULLET_SPEED, BASIC_ENEMY_VARS.ATTACK_DMG, 
 			direction, this.getLevel(), BASIC_ENEMY_VARS.BULLET_FUNCTION);
	}
}
