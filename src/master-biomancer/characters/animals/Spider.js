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
	ATTACK_SOUNDS: [
		{id: "spider-attack-0", sound: "biomancer/animals/spider/spider-attack-0.mp3"},
		{id: "spider-attack-1", sound: "biomancer/animals/spider/spider-attack-1.mp3"},
	],
	PRIORITY: FRIENDLY_VARS["PRIORITY_LOW"]
};

/**
 * Our first animal, a friendly wolf
 */
class Spider extends Animal {	
	/* constructor(id, health, launchIdle, launchIdlePivot, spawnIdle, spawnIdlePivot, 
	*	launchSpeed, launchDuration, decayAmount, walkRange, sightRange,
	*	attackRate, attackRange, maxSpeed, priority)
	*/
	constructor() {		
		super("spider-" + SPIDER_VARS.count, SPIDER_VARS.HEALTH, SPIDER_VARS.LAUNCH_IDLE, SPIDER_VARS.LAUNCH_IDLE_PIVOT, 
			SPIDER_VARS.SPAWN_IDLE, SPIDER_VARS.SPAWN_IDLE_PIVOT,
			SPIDER_VARS.LAUNCH_SPEED, SPIDER_VARS.LAUNCH_DURATION, 
			SPIDER_VARS.DECAY_AMOUNT, SPIDER_VARS.WALK_RANGE, SPIDER_VARS.SIGHT_RANGE,
			SPIDER_VARS.ATTACK_RATE, SPIDER_VARS.ATTACK_RANGE, SPIDER_VARS.MAX_SPEED, SPIDER_VARS.PRIORITY);

		SPIDER_VARS.count++;

		// Sound manager
		this.SM = new SoundManager();

		// Load attack sounds
		var that = this;
		SPIDER_VARS.ATTACK_SOUNDS.forEach(function (soundObj) {
			if (!that.SM.hasSound(soundObj.id)) {
				that.SM.loadSound(soundObj.id, soundObj.sound);
			}
		});
	}

	move() {
		// Random movement in radius
		if(this.enemyFocus !== undefined && (this.enemyFocus.obj.constructor.name==="Sawblade" || this.enemyFocus.obj.isAlive())) {
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
			let obstacles = this.getObstaclesInSightRange(),
				obsSet = false;
			for(let k = 0; k < obstacles.length; k++) {
				if(obstacles[k].obj.constructor.name === "Sawblade" && !obstacles[k].obj.stopped) {
					this.enemyFocus = obstacles[k];
					obsSet = true;
					break;
				}
			}
			if(!obsSet) {
				let enemies = this.getInSightRange();
				if(enemies.length > 0) {
					this.enemyFocus = enemies.find(e => !e.obj.statuses["attack-slow"].v);
				} else {
					if(this.enemyFocus !== undefined) {
						//reset search radius
						this.walkRangePosition = {x: this.position.x + this.spawnIdlePivot.x, y: this.position.y + this.spawnIdlePivot.y};
					}
					this.enemyFocus = undefined;
					this.randomMove();
				}
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
		
		if(this.enemyFocus.obj.constructor.name === "Sawblade") {
			this.enemyFocus.obj.stop();
		} else {
			//ATTACK CLOSEST FRIENDLY TARGET		
	 		this.enemyFocus.obj.addStatus("move-slow", 5000, 0.0);
	 		this.enemyFocus.obj.addStatus("attack-slow", 5000, 0.5);
		}		
 		//Change targets after attacking
 		this.enemyFocus = undefined;

 		// Play any attack sound
 		this.SM.playSound(MathUtil.eitherFromList(SPIDER_VARS.ATTACK_SOUNDS.map((soundObj) => soundObj.id)));
	}
	
}