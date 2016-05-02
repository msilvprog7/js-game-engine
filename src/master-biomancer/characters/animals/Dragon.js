"use strict";

// Duration will equal (HEALTH / DECAY_AMOUNT) * ANIMAL_VARS.NEXT_DECAY
var DRAGON_VARS = {
	count: 0,
	HEALTH: 40,
	LAUNCH_IDLE: "biomancer/animals/dragon/dragon_launch_0.png",
	LAUNCH_IDLE_PIVOT: {x: 6, y: 15},
	LAUNCH_SPEED: 8,
	LAUNCH_DURATION: 750,
	SPAWN_IDLE: "biomancer/animals/dragon/dragon_idle_0.png",
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
	ATTACK_DAMAGE: 5,
	DAMAGE_TYPE: DAMAGE_TYPES["PHYSICAL"],
	RESISTANCES: {
		[DAMAGE_TYPES["FIRE"]]: 0.5,
		[DAMAGE_TYPES["LASER"]]: 0.8,
		[DAMAGE_TYPES["PHYSICAL"]]: 0.7
	},
	IMAGE_PATH: "biomancer/animals/dragon/",
	ANIMATIONS: {
		"walk": {
			images: ["dragon_walk_0.png","dragon_walk_1.png","dragon_walk_2.png","dragon_walk_3.png"],
			loop: true,
			speed: 30
		},
		"run": {
			images: ["dragon_run_0.png","dragon_run_1.png","dragon_run_2.png","dragon_run_3.png"],
			loop: true,
			speed: 15
		},
		"attack": {
			images: ["dragon_attack_0.png","dragon_attack_1.png","dragon_attack_2.png","dragon_attack_3.png", "dragon_attack_4.png"],
			loop: false,
			speed: 15
		},
		"death": {
			images: ["dragon_death_0.png", "dragon_death_1.png", "dragon_death_2.png"],
			loop: false,
			speed: 50
		}
	},
	ATTACK_SOUNDS: [
		"biomancer/animals/dragon/dragon_attack_0.mp3",
		"biomancer/animals/dragon/dragon_attack_1.mp3",
		"biomancer/animals/dragon/dragon_attack_2.mp3",
		"biomancer/animals/dragon/dragon_attack_3.mp3"
	],
	ATTACK_SOUNDS_VOLUME: 0.3,
	MAX_VOLUME_RANGE: 1500,
	DEATH_SOUND: "biomancer/animals/dragon/dragon-whimper.mp3",
	DEATH_SOUND_ID: "dragon-death-whimper",
	PRIORTY: 2
};

/**
 * Our first animal, a friendly dragon
 */
class Dragon extends Animal {
	/* constructor(id, health, launchIdle, launchIdlePivot, spawnIdle, spawnIdlePivot, 
	*	launchSpeed, launchDuration, decayAmount, walkRange, sightRange,
	*	attackRate, attackRange, maxSpeed, priority)
	*/
	constructor() {
		super("dragon-" + DRAGON_VARS.count, DRAGON_VARS.HEALTH, DRAGON_VARS.LAUNCH_IDLE, DRAGON_VARS.LAUNCH_IDLE_PIVOT, 
			DRAGON_VARS.SPAWN_IDLE, DRAGON_VARS.SPAWN_IDLE_PIVOT,
			DRAGON_VARS.LAUNCH_SPEED, DRAGON_VARS.LAUNCH_DURATION, 
			DRAGON_VARS.DECAY_AMOUNT, DRAGON_VARS.WALK_RANGE, DRAGON_VARS.SIGHT_RANGE,
			DRAGON_VARS.ATTACK_RATE, DRAGON_VARS.ATTACK_RANGE, DRAGON_VARS.MAX_SPEED, 
			DRAGON_VARS.PRIORTY, DRAGON_VARS.RESISTANCES);

		DRAGON_VARS.count++;
		for(var animation in DRAGON_VARS.ANIMATIONS) {
			let currentAnimation = DRAGON_VARS.ANIMATIONS[animation];
			let animationInfo = {
				images: currentAnimation.images.map(image => DRAGON_VARS.IMAGE_PATH+image),
				loop: currentAnimation.loop,
				speed: currentAnimation.speed
			}
			this.addAnimation(animation, animationInfo);
		}

		var that = this;
		DRAGON_VARS.ATTACK_SOUNDS.forEach(function(soundfile, index) {
			if (!that.SM.hasSound("dragon-attack-"+index)) {
				that.SM.loadSound("dragon-attack-"+index, soundfile);
			}
		});

		// Death sound
		if (!this.SM.hasSound(DRAGON_VARS.DEATH_SOUND_ID)) {
			this.SM.loadSound(DRAGON_VARS.DEATH_SOUND_ID, DRAGON_VARS.DEATH_SOUND);
		}
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
			} else {
				let currentAnimation = this.getCurrentAnimation();
				if(currentAnimation.id !== "attack" || currentAnimation.finished) {
					this.setCurrentAnimation("run");
				}
			}

			this.vX = xMove*DRAGON_VARS.RUN_SPEED;
			this.vY = yMove*DRAGON_VARS.RUN_SPEED;

			this.orient(xMove, yMove);
		} else {
			let enemies = this.getInSightRange(["Wolf"]);
			if(enemies.length > 0) {
				let wolfFocus  = enemies.find(enemy => enemy instanceof Wolf);
				if(wolfFocus) {
					this.enemyFocus = wolfFocus; 
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
		if (Math.random() < DRAGON_VARS.WALK_PROBABILITY) {
			var movement = this.movementForward(DRAGON_VARS.WALK_SPEED);

			if (this.positionInWalkRange(movement)) {
				this.vX = movement.x;
				this.vY = movement.y;
			} else {
				forceTurn = true;
			}
		}

		// Change direction
		if (Math.random() < DRAGON_VARS.TURN_PROBABILITY || forceTurn) {
			this.setDirection(MathUtil.modRadians(this.rotation + MathUtil.either(-1, 1) * (MathUtil.PI4)));
		}
	}

	die() {
		this.setCurrentAnimation("death");
		this.getCurrentAnimation().setFinishedCallback(function() {
			this.alive = false;
			this.dispatchEvent(EVENTS.DIED);
		}, this);
		this.SM.playSound(DRAGON_VARS.DEATH_SOUND_ID);
	}

	attack() {
		super.attack();
		this.setCurrentAnimation("attack");
		let sound = MathUtil.randomInt(0, DRAGON_VARS.ATTACK_SOUNDS.length-1);
		this.SM.playSound("dragon-attack-"+sound, {
			volume: MathUtil.normalizeVolumeDistance(DRAGON_VARS.ATTACK_SOUNDS_VOLUME, 
				DRAGON_VARS.MAX_VOLUME_RANGE, this.getNormalizedPivotPoint(), this.getLevel().focusChild.getNormalizedPivotPoint())
		});
		//ATTACK CLOSEST FRIENDLY TARGET		
 		this.enemyFocus.obj.removeHealth(DRAGON_VARS.ATTACK_DAMAGE, DRAGON_VARS.DAMAGE_TYPE);
	}
	
}