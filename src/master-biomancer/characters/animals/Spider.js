"use strict";

// Duration will equal (HEALTH / DECAY_AMOUNT) * ANIMAL_VARS.NEXT_DECAY
var SPIDER_VARS = {
	count: 0,
	HEALTH: 30,
	LAUNCH_IDLE: "biomancer/animals/spider/spider-launch.png",
	LAUNCH_IDLE_PIVOT: {x: 6, y: 6},
	LAUNCH_SPEED: 20,
	LAUNCH_DURATION: 100,
	SPAWN_IDLE: "biomancer/animals/spider/spider-spawn.png",
	SPAWN_IDLE_PIVOT: {x: 25, y: 25},
	DECAY_AMOUNT: 1,
	TURN_PROBABILITY: 0.1,
	WALK_PROBABILITY: 0.75,
	WALK_SPEED: 1,
	RUN_SPEED: 7,
	MAX_SPEED: 7,
	WALK_RANGE: 200,
	SIGHT_RANGE: 600,
	ATTACK_RATE: 3000,
	ATTACK_RANGE: 500,
	ATTACK_DAMAGE: 0,
	PRIORITY: 1
};

/**
 * Our first animal, a friendly wolf
 */
class Spider extends Animal {
	
	constructor() {
		super("spider-" + SPIDER_VARS.count, SPIDER_VARS.HEALTH, SPIDER_VARS.LAUNCH_IDLE, SPIDER_VARS.LAUNCH_IDLE_PIVOT, 
			SPIDER_VARS.SPAWN_IDLE, SPIDER_VARS.SPAWN_IDLE_PIVOT,
			SPIDER_VARS.LAUNCH_SPEED, SPIDER_VARS.LAUNCH_DURATION, 
			SPIDER_VARS.DECAY_AMOUNT, SPIDER_VARS.WALK_RANGE, SPIDER_VARS.SIGHT_RANGE,
			SPIDER_VARS.ATTACK_RATE, SPIDER_VARS.ATTACK_RANGE, SPIDER_VARS.MAX_SPEED, SPIDER_VARS.PRIORITY);

		SPIDER_VARS.count++;
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
				super.move();
				return; 
			}	

			if(xMove === 0 && yMove === 0) { 
				this.vX = 0;
				this.vY = 0;
				super.move();
				return; 
			}

			this.vX = xMove*SPIDER_VARS.RUN_SPEED;
			this.vY = yMove*SPIDER_VARS.RUN_SPEED;

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
		if (Math.random() < SPIDER_VARS.WALK_PROBABILITY) {
			var movement = this.movementForward(SPIDER_VARS.WALK_SPEED);

			if (this.positionInWalkRange(movement)) {
				this.vX = movement.x;
				this.vY = movement.y;
			} else {
				forceTurn = true;
			}
		}

		// Change direction
		if (Math.random() < SPIDER_VARS.TURN_PROBABILITY || forceTurn) {
			this.setDirection(MathUtil.modRadians(this.rotation + MathUtil.either(-1, 1) * (MathUtil.PI4)));
		}
	}

	attack() {
		super.attack();
		
		//ATTACK CLOSEST FRIENDLY TARGET		
 		this.enemyFocus.obj.addStatus("move-slow", 5000, 0.0);
	}
	
}