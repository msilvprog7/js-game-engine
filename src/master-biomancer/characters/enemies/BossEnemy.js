"use strict";

var BOSS_ENEMY_VARS = {
	count: 0,
	SIGHT_RANGE: 3000,
	ENGAGE_RANGE: 200,
	ATTACK_RANGE: [500, 100, 700, 3000],
	ATTACK_DMG: [10, 15, 15, 20],
	DAMAGE_TYPE: [
		DAMAGE_TYPES["LASER"],
		DAMAGE_TYPES["PHYSICAL"],
		DAMAGE_TYPES["POISON"],
		DAMAGE_TYPES["FIRE"],
	],
	BULLET_SPEED: 10,
	ATTACK_RATE: [1500, 500, 1000, 1000], //ms between attacks
	HEALTH: 500,
	SPEED: 2,
	MAX_SPEED: 4,
	RESISTANCES: [
		{
			[DAMAGE_TYPES["EXPLOSIVE"]]: 1.5,
			[DAMAGE_TYPES["PHYSICAL"]]: 0.7
		},
		{
			[DAMAGE_TYPES["PHYSICAL"]]: 1.2,
			[DAMAGE_TYPES["ICE"]]: 0.6
		},
		{
			[DAMAGE_TYPES["PHYSICAL"]]: 0.7,
			[DAMAGE_TYPES["ICE"]]: 1.2
		},
		{
			[DAMAGE_TYPES["PHYSICAL"]]: 0.5,
			[DAMAGE_TYPES["ICE"]]: 0.5,
			[DAMAGE_TYPES["EXPLOSIVE"]]: 0.5,
			[DAMAGE_TYPES["FIRE"]]: 1.2,
		}
	],
	SPAWN_IDLE: "biomancer/enemies/basic-enemy/basic-enemy.png",
	SPAWN_IDLE_PIVOT: {x: 35, y: 15},
	SPAWN_DIMENSIONS: {width: 70, height: 70},
	BULLET_IMG: [
		"biomancer/misc/bullet.png",
		"biomancer/misc/bullet.png",
		"biomancer/misc/sawblade-0.png",
		"biomancer/misc/orb.png",
	],
	BULLET_FUNCTION: [
		function(collider, dmg, dmgType) {
			if(collider instanceof Friendly) {
				collider.removeHealth(dmg, dmgType);
				collider.addStatus("move-slow", 3000, 0.6);				
			}
		},
		function(collider, dmg, dmgType) {
			return;	
		},
		function(collider, dmg, dmgType) {
			if(collider instanceof Friendly) {
				collider.removeHealth(dmg, dmgType);
				collider.addStatus("dot", 3000, dmg/4, dmgType);
				collider.addStatus("attack-slow", 3000, 0.6);				
			}
		},
		function(collider, dmg, dmgType) {
			if(collider instanceof Friendly) {
				collider.removeHealth(dmg, dmgType);
				collider.addStatus("move-slow", 3000, 0.3);
				collider.addStatus("attack-slow", 3000, 0.6);
				collider.addStatus("dot", 3000, dmg/4, dmgType);
			}
		}
	],
	ATTACK_SOUNDS: [
		{id: "gun-shot-0", sound: "biomancer/weapons/basic-enemy/gun-shot-0.mp3"},
		{id: "gun-shot-1", sound: "biomancer/weapons/basic-enemy/gun-shot-1.mp3"},
		{id: "gun-shot-2", sound: "biomancer/weapons/basic-enemy/gun-shot-2.mp3"},
		{id: "gun-shot-3", sound: "biomancer/weapons/basic-enemy/gun-shot-3.mp3"},
		{id: "sword-attack-0", sound: "biomancer/weapons/boss/sword-attack-0.mp3"},
		{id: "sword-attack-1", sound: "biomancer/weapons/boss/sword-attack-1.mp3"},
		{id: "shoot-orb", sound: "biomancer/weapons/boss/shoot-orb.mp3"},
	],
	ATTACK_SOUNDS_LIST: [
		["gun-shot-0", "gun-shot-1", "gun-shot-2", "gun-shot-3"],
		["sword-attack-0", "sword-attack-1"],
		["sword-attack-0", "sword-attack-1"],
		["shoot-orb"]
	],
	ENGAGE_MESSAGE: "So we finally meet Biomancer. I will enjoy killing you and taking all your science.",
	PHASE_2_MESSAGE: ["That's enough scientist. I don't need this gun to kill you."],
	PHASE_3_MESSAGE: ["I am done toying with you, Biomancer. Behold the invention that will be your demise."],
	PHASE_4_MESSAGE: ["I have not come this far to be stopped! The future I have planned will not be jeopardized. Now you will taste true power!",
	"I guess the testing phase for this new animal is over. Time to bring out the big guns."],
	DEATH_MESSAGE: "Who is the true monster here...",
	PHASE_1_ERROR_MESSAGE: "He is dodging all my animals attacks. He is moving too quickly."
};

class BossEnemy extends Enemy {
	constructor() {
		//constructor(id, health, spawnIdle, spawnIdlePivot, attackRate, attackRange, maxSpeed, resistances)
		super("boss-enemy-" + BOSS_ENEMY_VARS.count, BOSS_ENEMY_VARS.HEALTH, 
			BOSS_ENEMY_VARS.SPAWN_IDLE, BOSS_ENEMY_VARS.SPAWN_IDLE_PIVOT, 
			BOSS_ENEMY_VARS.ATTACK_RATE[0], BOSS_ENEMY_VARS.ATTACK_RANGE[0],
			BOSS_ENEMY_VARS.MAX_SPEED, BOSS_ENEMY_VARS.RESISTANCES[0]);


		BOSS_ENEMY_VARS.count++;

		this.phase = 1;
		this.phase1Error = 0;
		this.engaged = false;
		this.sightRange = BOSS_ENEMY_VARS.ENGAGE_RANGE;
		this.UI = new UserInterface();

		// Load sounds
		var that = this;
		BOSS_ENEMY_VARS.ATTACK_SOUNDS.forEach(function (soundObj) {
			if (!that.SM.hasSound(soundObj.id)) {
				that.SM.loadSound(soundObj.id, soundObj.sound);
			}
		});
		this.addEventListener(EVENTS.BOSS_ENGAGED, this, function() {
			this.engaged = true;
			this.UI.showDialog(BOSS_ENEMY_VARS.ENGAGE_MESSAGE, DIALOGUE_SCRIPT_VARS.OPTIONS);
			this.sightRange = BOSS_ENEMY_VARS.SIGHT_RANGE;
		}, this);
	}

	move() {
		let friendlies = this.getInSight(this.sightRange);		

		if(friendlies.length === 0 && (this.friendlyFocus === undefined || !this.friendlyFocus.obj.isAlive())) {
			//No animals or biomancer in range, move randomly
			this.friendlyFocus = undefined;
			this.vX = 0;
			this.vY = 0;
		} else {
			let posToMove,
				myPos = this.getMidpoint(),
				hasLOS; // = this.hasLineOfSight(this.friendlyFocus.obj);

			//MOVE TOWARDS HIGHEST PRIORITY FRIENDLY, CLOSEST IF FRIENDLIES SHARE PRIORITY
			if(friendlies.length > 0 && (this.friendlyFocus === undefined || friendlies[0].obj !== this.friendlyFocus || !this.friendlyFocus.obj.isAlive())) {
				this.friendlyFocus = friendlies[0];
				if(!this.engaged) {
					this.dispatchEvent(EVENTS.BOSS_ENGAGED);
				}	
			}

			hasLOS = this.hasLineOfSight(this.friendlyFocus.obj);
			if (hasLOS) {
				posToMove = this.friendlyFocus.obj.getPosition();
			} else {
				// get aStarPath if needed
				let time = new Date().getTime(),
					grid = this.getLevel().getGrid();

				myPos = grid.getObject(this.id).getPixelOrigin();

				this.updatePath(this.friendlyFocus.obj);
				// try to find secondary target
				if (this.path.length === 0) {
					let newTarget = this.getSecondaryTarget(friendlies);
					if (newTarget !== -1) {
						// found target
						this.friendlyFocus = newTarget;
						this.path = [this.friendlyFocus.obj.getPosition()];
						hasLOS = true;
					} else {
						// no target found, don't move
						return;
					}
				}
				
				posToMove = this.path[0];
			}

			// Not sure if we should use move_epsilon, do on others
			// let	xMove = (myPos.x-CHARACTER_VARS.MOVE_EPSILON > posToMove.x) ? -1 : (myPos.x+CHARACTER_VARS.MOVE_EPSILON < posToMove.x) ? 1 : 0, 
			// 	yMove = (myPos.y-CHARACTER_VARS.MOVE_EPSILON > posToMove.y) ? -1 : (myPos.y+CHARACTER_VARS.MOVE_EPSILON < posToMove.y) ? 1 : 0;

			let	xMove = (myPos.x > posToMove.x) ? -1 : (myPos.x < posToMove.x) ? 1 : 0, 
				yMove = (myPos.y > posToMove.y) ? -1 : (myPos.y < posToMove.y) ? 1 : 0;		

			if(this.friendlyFocus.distance <= this.attackRange && hasLOS) { 
				this.orient(xMove, yMove);
				return; 
			}

			this.vX = xMove*BOSS_ENEMY_VARS.SPEED;
			this.vY = yMove*BOSS_ENEMY_VARS.SPEED;
			this.orient(xMove, yMove);	
		}

		super.move();
	}

	attack() {
		super.attack();
		let myPivot = this.getNormalizedPivotPoint();
		switch(this.phase) {			
			case 2:
				this.friendlyFocus.obj.removeHealth(BOSS_ENEMY_VARS.ATTACK_DMG[this.phase-1], BOSS_ENEMY_VARS.DAMAGE_TYPE[this.phase-1]);
				this.friendlyFocus.obj.addStatus("move-slow", 5000, 0.0);
				break;
			case 4:				
				let that = this,
				//ATTACK CLOSEST FRIENDLY TARGET
					friendlies = this.getInSight(this.sightRange);
				friendlies.forEach(function(friendly) {
					let friendPivot = friendly.obj.getNormalizedPivotPoint(),
					direction = MathUtil['3PI2']-Math.atan2((myPivot.y - friendPivot.y), (friendPivot.x - myPivot.x));

					if(direction >= MathUtil['2PI']) { 
						direction -= MathUtil['2PI'];
					}
			 		new Bullet(that, BOSS_ENEMY_VARS.BULLET_IMG[that.phase-1], BOSS_ENEMY_VARS.BULLET_SPEED, BOSS_ENEMY_VARS.ATTACK_DMG[that.phase-1], 
			 			BOSS_ENEMY_VARS.DAMAGE_TYPE[that.phase-1], direction, that.getLevel(), BOSS_ENEMY_VARS.BULLET_FUNCTION[that.phase-1]);
				});
				break;
			case 3:
			default: //phase 1
			//ATTACK CLOSEST FRIENDLY TARGET
				let friendPivot = this.friendlyFocus.obj.getNormalizedPivotPoint(),
					direction = MathUtil['3PI2']-Math.atan2((myPivot.y - friendPivot.y), (friendPivot.x - myPivot.x));

				if(direction >= MathUtil['2PI']) { 
					direction -= MathUtil['2PI'];
				}
		 		new Bullet(this, BOSS_ENEMY_VARS.BULLET_IMG[this.phase-1], BOSS_ENEMY_VARS.BULLET_SPEED, BOSS_ENEMY_VARS.ATTACK_DMG[this.phase-1], 
		 			BOSS_ENEMY_VARS.DAMAGE_TYPE, direction, this.getLevel(), BOSS_ENEMY_VARS.BULLET_FUNCTION[this.phase-1]);
				break;
		}
		//PLAY SOUNDS ACCORDING TO THE PHASE
 		this.SM.playSound(MathUtil.eitherFromList(BOSS_ENEMY_VARS.ATTACK_SOUNDS_LIST[this.phase-1]));
	}

	//PHASE FUNCTIONS CALLED WHEN THE BOSS SWITCHES PHASES
	phase2() {
		this.phase = 2;
		this.phaseUpdate();
		BOSS_ENEMY_VARS.PHASE_2_MESSAGE.forEach(message => { this.UI.showDialog(message, DIALOGUE_SCRIPT_VARS.OPTIONS); });
		
	}

	phase3() {
		this.phase = 3;
		this.phaseUpdate();
		BOSS_ENEMY_VARS.PHASE_3_MESSAGE.forEach(message => { this.UI.showDialog(message, DIALOGUE_SCRIPT_VARS.OPTIONS); });		
	}

	phase4() {
		this.phase = 4;
		this.phaseUpdate();
		BOSS_ENEMY_VARS.PHASE_4_MESSAGE.forEach(message => { this.UI.showDialog(message, DIALOGUE_SCRIPT_VARS.OPTIONS); });

		this.addHealth(BOSS_ENEMY_VARS.HEALTH-this.health, 1000);
		//Give player the dragon so he can defeat the boss
		let level = this.getLevel(),
			biomancerGun = level.biomancer.gun;
		
		this.UI.animalContainer.newAnimal("dragon");
		biomancerGun.addAnimalToGun("DRAGON");
		//Break environment maybe?
	}

	phaseUpdate() {
		this.attackRange = BOSS_ENEMY_VARS.ATTACK_RANGE[this.phase-1];
		this.resistances = BOSS_ENEMY_VARS.RESISTANCES[this.phase-1];
		this.attackRate = BOSS_ENEMY_VARS.ATTACK_RATE[this.phase-1];
	}

	removeHealth(hit, damageType) {
		switch(this.phase) {
			case 4:
				if(!this.statuses["dot"].v || this.statuses["dot"].damageType !== DAMAGE_TYPES["FIRE"]) {
					return;
				}
				break;
			case 3:
				if(!this.statuses["move-slow"].v || this.statuses["move-slow"].amount > 0.1) {
					return;
				}
				break;
			default: //phase 1
				if(!this.statuses["move-slow"].v) {
					if(this.phase1Error === 5) {
						this.UI.showDialog(BOSS_ENEMY_VARS.PHASE_1_ERROR_MESSAGE, DIALOGUE_SCRIPT_VARS.OPTIONS)
						this.phase1Error++;
					}
					return;
				} else {
					this.phase1Error++;
				}
				break;
		}
		// Take damage
		if(damageType === undefined || this.resistances[damageType] === undefined) {
			this.health -= hit;
		} else {
			this.health -= hit * this.resistances[damageType];
		}

		let healthPercent = this.health/BOSS_ENEMY_VARS.HEALTH;
		if(this.phase === 1 && healthPercent <= 0.7) {
			this.phase2();
		} else if(this.phase === 2 && healthPercent <= 0.4) {
			this.phase3();
		} else if(this.phase === 3 && healthPercent <= 0.1) {
			this.phase4();
		}

		// Dispatch event
		if (this.health > 0) {
			this.dispatchEvent(EVENTS.HEALTH_UPDATED, {health: this.health});
		} else {
			if(this.phase === 4) {
				this.UI.showDialog(BOSS_ENEMY_VARS.DEATH_MESSAGE, DIALOGUE_SCRIPT_VARS.OPTIONS);
				this.die();
			}
		}
	}
}
