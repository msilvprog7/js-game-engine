"use strict";

// Duration will equal (HEALTH / DECAY_AMOUNT) * ANIMAL_VARS.NEXT_DECAY
var WOLF_VARS = {
	count: 0,
	HEALTH: 40,
	LAUNCH_IDLE: "biomancer/animals/wolf/wolf-launch.png",
	LAUNCH_IDLE_PIVOT: {x: 6, y: 6},
	LAUNCH_SPEED: 8,
	LAUNCH_DURATION: 750,
	SPAWN_IDLE: "biomancer/animals/wolf/wolf-spawn.png",
	SPAWN_IDLE_PIVOT: {x: 25, y: 25},
	DECAY_AMOUNT: 1,
	TURN_PROBABILITY: 0.1,
	WALK_PROBABILITY: 0.75,
	WALK_SPEED: 1,
	RUN_SPEED: 8,
	MAX_SPEED: 8,
	WALK_RANGE: 100,
	SIGHT_RANGE: 350,
	ATTACK_RATE: 1000,
	ATTACK_RANGE: 100,
	ATTACK_DAMAGE: 5,
	DAMAGE_TYPE: DAMAGE_TYPES["PHYSICAL"],
	RESISTANCES: {

	},
	PRIORTY: 2
};

/**
 * Our first animal, a friendly wolf
 */
class Wolf extends Animal {
	/* constructor(id, health, launchIdle, launchIdlePivot, spawnIdle, spawnIdlePivot, 
	*	launchSpeed, launchDuration, decayAmount, walkRange, sightRange,
	*	attackRate, attackRange, maxSpeed, priority)
	*/
	constructor() {
		super("wolf-" + WOLF_VARS.count, WOLF_VARS.HEALTH, WOLF_VARS.LAUNCH_IDLE, WOLF_VARS.LAUNCH_IDLE_PIVOT, 
			WOLF_VARS.SPAWN_IDLE, WOLF_VARS.SPAWN_IDLE_PIVOT,
			WOLF_VARS.LAUNCH_SPEED, WOLF_VARS.LAUNCH_DURATION, 
			WOLF_VARS.DECAY_AMOUNT, WOLF_VARS.WALK_RANGE, WOLF_VARS.SIGHT_RANGE,
			WOLF_VARS.ATTACK_RATE, WOLF_VARS.ATTACK_RANGE, WOLF_VARS.MAX_SPEED, 
			WOLF_VARS.PRIORTY, WOLF_VARS.RESISTANCES);

		WOLF_VARS.count++;
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

			this.vX = xMove*WOLF_VARS.RUN_SPEED;
			this.vY = yMove*WOLF_VARS.RUN_SPEED;

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
		if (Math.random() < WOLF_VARS.WALK_PROBABILITY) {
			var movement = this.movementForward(WOLF_VARS.WALK_SPEED);

			if (this.positionInWalkRange(movement)) {
				this.vX = movement.x;
				this.vY = movement.y;
			} else {
				forceTurn = true;
			}
		}

		// Change direction
		if (Math.random() < WOLF_VARS.TURN_PROBABILITY || forceTurn) {
			this.setDirection(MathUtil.modRadians(this.rotation + MathUtil.either(-1, 1) * (MathUtil.PI4)));
		}
	}

	attack() {
		super.attack();
		
		//ATTACK CLOSEST FRIENDLY TARGET		
 		this.enemyFocus.obj.removeHealth(WOLF_VARS.ATTACK_DAMAGE, WOLF_VARS.DAMAGE_TYPE);
	}
	
}