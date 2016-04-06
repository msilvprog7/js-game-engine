"use strict";

// Duration will equal (HEALTH / DECAY_AMOUNT) * ANIMAL_VARS.NEXT_DECAY
var TURTLE_VARS = {
	count: 0,
	HEALTH: 100,
	LAUNCH_IDLE: "biomancer/animals/turtle/turtle-launch.png",
	LAUNCH_IDLE_PIVOT: {x: 6, y: 6},
	LAUNCH_SPEED: 6,
	LAUNCH_DURATION: 1000,
	SPAWN_IDLE: "biomancer/animals/turtle/turtle-idle.png",
	SPAWN_IDLE_PIVOT: {x: 25, y: 25},
	SCARED_IMG: "biomancer/animals/turtle/turtle-scared.png",
	DECAY_AMOUNT: 1,
	TURN_PROBABILITY: 0.1,
	WALK_PROBABILITY: 0.75,
	WALK_SPEED: 1,
	RUN_SPEED: 2,
	MAX_SPEED: 2,
	WALK_RANGE: 400,
	SIGHT_RANGE: 500,
	ATTACK_RATE: 10000,
	ATTACK_DAMAGE: 50,
	DAMAGE_TYPE: DAMAGE_TYPES["EXPLOSIVE"],
	ATTACK_RANGE: 150,
	PRIORITY: 3,
	RESISTANCES: {

	}
};

/**
 * 
 */
class Turtle extends Animal {
	/* constructor(id, health, launchIdle, launchIdlePivot, spawnIdle, spawnIdlePivot, 
	*	launchSpeed, launchDuration, decayAmount, walkRange, sightRange,
	*	attackRate, attackRange, maxSpeed, priority)
	*/
	constructor() {
		super("turtle-" + TURTLE_VARS.count, TURTLE_VARS.HEALTH, TURTLE_VARS.LAUNCH_IDLE, TURTLE_VARS.LAUNCH_IDLE_PIVOT, 
			TURTLE_VARS.SPAWN_IDLE, TURTLE_VARS.SPAWN_IDLE_PIVOT,
			TURTLE_VARS.LAUNCH_SPEED, TURTLE_VARS.LAUNCH_DURATION, 
			TURTLE_VARS.DECAY_AMOUNT, TURTLE_VARS.WALK_RANGE, TURTLE_VARS.SIGHT_RANGE,
			TURTLE_VARS.ATTACK_RATE, TURTLE_VARS.ATTACK_RANGE, TURTLE_VARS.MAX_SPEED, 
			TURTLE_VARS.PRIORITY, TURTLE_VARS.RESISTANCES);

		TURTLE_VARS.count++;
		this.addAnimation("scared", {images: [TURTLE_VARS.SCARED_IMG], loop: true});
		this.detonationTime = new Date().getTime() + TURTLE_VARS.ATTACK_RATE;
	}

	canAttack() {
		return new Date().getTime() > this.detonationTime;
	}

	move() {
		// Random movement in radius
		if(this.enemyFocus !== undefined && this.enemyFocus.obj.isAlive()) {
			//Hide in shell
			this.setCurrentAnimation("scared");

			this.vX = 0;
			this.vY = 0;

		} else {
			let enemies = this.getInSightRange();
			if(enemies.length > 0) {
				this.enemyFocus = enemies[0];
			} else {
				this.setCurrentAnimation("idle");
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
		if (Math.random() < TURTLE_VARS.WALK_PROBABILITY) {
			var movement = this.movementForward(TURTLE_VARS.WALK_SPEED);

			if (this.positionInWalkRange(movement)) {
				this.vX = movement.x;
				this.vY = movement.y;
			} else {
				forceTurn = true;
			}
		}

		// Change direction
		if (Math.random() < TURTLE_VARS.TURN_PROBABILITY || forceTurn) {
			this.setDirection(MathUtil.modRadians(this.rotation + MathUtil.either(-1, 1) * (MathUtil.PI4)));
		}
	}

	attack() {
		// Attack enemies in range
		let enemies = this.getInSightRange();
		enemies.forEach(function(enemy) {
			if(enemy.distance <= TURTLE_VARS.ATTACK_RANGE) {
				enemy.obj.removeHealth(TURTLE_VARS.ATTACK_DAMAGE, TURTLE_VARS.DAMAGE_TYPE);
			}
		});

		// Attack destroyable obstacles in range
		let obstacles = this.getObstaclesInSightRange();
		obstacles.forEach(function (obstacle) {
			if (obstacle.distance <= TURTLE_VARS.ATTACK_RANGE) {
				obstacle.obj.destroy();
			}
		});

		this.killSelf();
	}
	
}