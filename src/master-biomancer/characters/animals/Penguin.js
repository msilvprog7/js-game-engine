"use strict";

// Duration will equal (HEALTH / DECAY_AMOUNT) * ANIMAL_VARS.NEXT_DECAY
var PENGUIN_VARS = {
	count: 0,
	HEALTH: 30,
	LAUNCH_IDLE: "biomancer/animals/penguin/penguin-launch.png",
	LAUNCH_IDLE_PIVOT: {x: 6, y: 6},
	LAUNCH_SPEED: 2,
	LAUNCH_DURATION: 500,
	SPAWN_IDLE: "biomancer/animals/penguin/penguin-spawn.png",
	SPAWN_IDLE_PIVOT: {x: 30, y: 30},
	DECAY_AMOUNT: 1,
	TURN_PROBABILITY: 0.1,
	WALK_PROBABILITY: 0.75,
	WALK_SPEED: 1,
	RUN_SPEED: 2,	
	WALK_RANGE: 400,
	SIGHT_RANGE: 700,
	ATTACK_RATE: 1500,
	ATTACK_RANGE: 500,
	ATTACK_DMG: 10,
	BULLET_SPEED: 10,
	BULLET_IMG: "biomancer/misc/snowball.png",
	BULLET_FUNCTION: function(collider, dmg) {
		if(collider instanceof Enemy) {
			collider.removeHealth(dmg);
			collider.addStatus("move-slow", 3000, 0.6);
		}
	}
};

/**
 * Our first animal, a friendly wolf
 */
class Penguin extends Animal {
	
	constructor() {
		super("spider-" + PENGUIN_VARS.count, PENGUIN_VARS.HEALTH, PENGUIN_VARS.LAUNCH_IDLE, PENGUIN_VARS.LAUNCH_IDLE_PIVOT, 
			PENGUIN_VARS.SPAWN_IDLE, PENGUIN_VARS.SPAWN_IDLE_PIVOT,
			PENGUIN_VARS.LAUNCH_SPEED, PENGUIN_VARS.LAUNCH_DURATION, 
			PENGUIN_VARS.DECAY_AMOUNT, PENGUIN_VARS.WALK_RANGE, PENGUIN_VARS.SIGHT_RANGE,
			PENGUIN_VARS.ATTACK_RATE, PENGUIN_VARS.ATTACK_RANGE);

		PENGUIN_VARS.count++;
	}

	move() {
		// Random movement in radius
		if(this.enemyFocus !== undefined && this.enemyFocus.obj.isAlive()) {
			//Move towards enemy
			let posToMove = this.enemyFocus.obj.getNormalizedPivotPoint(),
				myPos = this.getNormalizedPivotPoint(),
				xMove = (myPos.x-CHARACTER_VARS.MOVE_EPSILON > posToMove.x) ? -1 : (myPos.x+CHARACTER_VARS.MOVE_EPSILON < posToMove.x) ? 1 : 0, 
				yMove = (myPos.y-CHARACTER_VARS.MOVE_EPSILON > posToMove.y) ? -1 : (myPos.y+CHARACTER_VARS.MOVE_EPSILON < posToMove.y) ? 1 : 0;

			if(this.enemyFocus.distance <= this.attackRange) { 
				this.orient(xMove, yMove);
				this.vX = 0;
				this.vY = 0;
				super.move();
				return; 
			} 

			if(xMove === 0 && yMove === 0) { 
				this.vX = 0;
				this.vY = 0;
				super.move();
				return; 
			}

			this.vX = xMove*PENGUIN_VARS.RUN_SPEED;
			this.vY = yMove*PENGUIN_VARS.RUN_SPEED;

			this.orient(xMove, yMove);
		} else {
			let enemies = this.getInSightRange();
			if(enemies.length > 0) {
				this.enemyFocus = enemies[0];
			} else {
				if(this.enemyFocus !== undefined) {
					//reset search radius
					this.walkRangePosition = {x: this.position.x + this.spawnIdlePivot.x, y: this.position.y + this.spawnIdlePivot.y};
				}
				this.enemyFocus = undefined;
				this.randomMove();
			}
		}	

		super.move();	
	}

	randomMove() {
		var forceTurn = false;

		// Try to move forward
		if (Math.random() < PENGUIN_VARS.WALK_PROBABILITY) {
			var movement = this.movementForward(PENGUIN_VARS.WALK_SPEED);

			if (this.positionInWalkRange(movement)) {
				this.vX = movement.x;
				this.vY = movement.y;
			} else {
				forceTurn = true;
			}
		}

		// Change direction
		if (Math.random() < PENGUIN_VARS.TURN_PROBABILITY || forceTurn) {
			this.setDirection(MathUtil.modRadians(this.rotation + MathUtil.either(-1, 1) * (MathUtil.PI4)));
		}
	}

	attack() {
		super.attack();
		
		//ATTACK CLOSEST ENEMY TARGET
		let enemyPivot = this.enemyFocus.obj.getNormalizedPivotPoint(),
			myPivot = this.getNormalizedPivotPoint(),
			direction = MathUtil['3PI2']-Math.atan2((myPivot.y - enemyPivot.y), (enemyPivot.x - myPivot.x));

		if(direction >= MathUtil['2PI']) { 
			direction -= MathUtil['2PI'];
		}
		
 		new Bullet(PENGUIN_VARS.BULLET_IMG, PENGUIN_VARS.BULLET_SPEED, PENGUIN_VARS.ATTACK_DMG, direction, this, this.getLevel(), PENGUIN_VARS.BULLET_FUNCTION);
	}
	
}