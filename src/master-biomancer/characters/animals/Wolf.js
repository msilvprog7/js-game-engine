"use strict";

// Duration will equal (HEALTH / DECAY_AMOUNT) * ANIMAL_VARS.NEXT_DECAY
var WOLF_VARS = {
	count: 0,
	HEALTH: 40,
	LAUNCH_IDLE: "biomancer/animals/wolf/wolf_launch_0.png",
	LAUNCH_IDLE_PIVOT: {x: 6, y: 15},
	LAUNCH_SPEED: 8,
	LAUNCH_DURATION: 750,
	SPAWN_IDLE: "biomancer/animals/wolf/wolf_idle_0.png",
	SPAWN_IDLE_PIVOT: {x: 12, y: 29},
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
	ATTACK_DAMAGE: 4,
	DAMAGE_TYPE: DAMAGE_TYPES["PHYSICAL"],
	RESISTANCES: {
		[DAMAGE_TYPES["FIRE"]]: 1.5,
		[DAMAGE_TYPES["LASER"]]: 1.25,
		[DAMAGE_TYPES["PHYSICAL"]]: 0.7
	},
	IMAGE_PATH: "biomancer/animals/wolf/",
	ANIMATIONS: {
		"walk": {
			images: ["wolf_walk_0.png","wolf_walk_1.png","wolf_walk_2.png","wolf_walk_3.png"],
			loop: true,
			speed: 30
		},
		"run": {
			images: ["wolf_run_0.png","wolf_run_1.png","wolf_run_2.png","wolf_run_3.png"],
			loop: true,
			speed: 15
		},
		"attack": {
			images: ["wolf_attack_0.png","wolf_attack_1.png","wolf_attack_2.png","wolf_attack_3.png", "wolf_attack_4.png"],
			loop: false,
			speed: 15
		},
		"death": {
			images: ["wolf_death_0.png", "wolf_death_1.png", "wolf_death_2.png"],
			loop: false,
			speed: 50
		}
	},
	ATTACK_SOUNDS: [
		"biomancer/animals/wolf/wolf_attack_0.mp3",
		"biomancer/animals/wolf/wolf_attack_1.mp3",
		"biomancer/animals/wolf/wolf_attack_2.mp3",
		"biomancer/animals/wolf/wolf_attack_3.mp3"
	],
	ATTACK_SOUNDS_VOLUME: 0.3,
	MAX_VOLUME_RANGE: 1500,
	DEATH_SOUND: "biomancer/animals/wolf/wolf-whimper.mp3",
	DEATH_SOUND_ID: "wolf-death-whimper",
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
		for(var animation in WOLF_VARS.ANIMATIONS) {
			let currentAnimation = WOLF_VARS.ANIMATIONS[animation];
			let animationInfo = {
				images: currentAnimation.images.map(image => WOLF_VARS.IMAGE_PATH+image),
				loop: currentAnimation.loop,
				speed: currentAnimation.speed
			}
			this.addAnimation(animation, animationInfo);
		}

		var that = this;
		WOLF_VARS.ATTACK_SOUNDS.forEach(function(soundfile, index) {
			if (!that.SM.hasSound("wolf-attack-"+index)) {
				that.SM.loadSound("wolf-attack-"+index, soundfile);
			}
		});

		// Death sound
		if (!this.SM.hasSound(WOLF_VARS.DEATH_SOUND_ID)) {
			this.SM.loadSound(WOLF_VARS.DEATH_SOUND_ID, WOLF_VARS.DEATH_SOUND);
		}
	}

	move() {
		// Random movement in radius
		if(this.enemyFocus !== undefined && this.enemyFocus.obj.isAlive()) {
			//Move towards enemy
			let posToMove,
				myPos;
			if (this.hasLineOfSight(this.enemyFocus.obj)) {
				posToMove = this.enemyFocus.obj.getNormalizedPivotPoint();
				myPos = this.getNormalizedPivotPoint();
			} else {
				this.updatePath(this.enemyFocus.obj);
				if (this.path.length === 0) {
					return;
				} 
				posToMove = this.path[0];
				myPos = this.getLevel().getGrid().getObject(this.id).getPixelOrigin();
			}


			let xMove = (myPos.x-CHARACTER_VARS.MOVE_EPSILON > posToMove.x) ? -1 : (myPos.x+CHARACTER_VARS.MOVE_EPSILON < posToMove.x) ? 1 : 0, 
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
			} else {
				let currentAnimation = this.getCurrentAnimation();
				if(currentAnimation.id !== "attack" || currentAnimation.finished) {
					this.setCurrentAnimation("run");
				}
			}

			this.vX = xMove*WOLF_VARS.RUN_SPEED;
			this.vY = yMove*WOLF_VARS.RUN_SPEED;

			this.orient(xMove, yMove);
		} else {
			let enemies = this.getInSightRange(["Turtle"]);
			if(enemies.length > 0) {
				let turtleFocus  = enemies.find(enemy => enemy instanceof Turtle);
				if(turtleFocus) {
					this.enemyFocus = turtleFocus; 
				} else {
					this.enemyFocus = enemies[0];
				}
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

		let currentAnimation = this.getCurrentAnimation();
		if(currentAnimation.id !== "attack" || currentAnimation.finished) {
			this.setCurrentAnimation("walk");
		}

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

	die() {
		this.setCurrentAnimation("death");
		this.getCurrentAnimation().setFinishedCallback(function() {
			this.alive = false;
			this.dispatchEvent(EVENTS.DIED);
		}, this);
		this.SM.playSound(WOLF_VARS.DEATH_SOUND_ID);
	}

	attack() {
		super.attack();
		this.setCurrentAnimation("attack");
		let sound = MathUtil.randomInt(0, WOLF_VARS.ATTACK_SOUNDS.length-1);
		this.SM.playSound("wolf-attack-"+sound, {
			volume: MathUtil.normalizeVolumeDistance(WOLF_VARS.ATTACK_SOUNDS_VOLUME, 
				WOLF_VARS.MAX_VOLUME_RANGE, this.getNormalizedPivotPoint(), this.getLevel().focusChild.getNormalizedPivotPoint())
		});
		//ATTACK CLOSEST FRIENDLY TARGET		
 		this.enemyFocus.obj.removeHealth(WOLF_VARS.ATTACK_DAMAGE, WOLF_VARS.DAMAGE_TYPE);
	}
	
}