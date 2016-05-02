"use strict";

var BOSS_ENEMY_VARS = {
	count: 0,
	SIGHT_RANGE: 3000,
	ATTACK_RANGE: [500, 100, 700, 3000],
	ATTACK_DMG: [10, 20, 15, 20],
	DAMAGE_TYPE: [
		DAMAGE_TYPES["LASER"],
		DAMAGE_TYPES["PHYSICAL"],
		DAMAGE_TYPES["POISON"],
		DAMAGE_TYPES["FIRE"],
	],
	BULLET_SPEED: 10,
	ATTACK_RATE: 2000, //ms between attacks
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
	BULLET_IMG: "biomancer/misc/bullet.png",
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
		{id: "gun-shot-3", sound: "biomancer/weapons/basic-enemy/gun-shot-3.mp3"}
	],
	ATTACK_SOUNDS_LIST: ["gun-shot-0", "gun-shot-1", "gun-shot-2", "gun-shot-3"]
};

class BossEnemy extends Enemy {
	constructor() {
		//constructor(id, health, spawnIdle, spawnIdlePivot, attackRate, attackRange, maxSpeed, resistances)
		super("boss-enemy-" + BOSS_ENEMY_VARS.count, BOSS_ENEMY_VARS.HEALTH, 
			BOSS_ENEMY_VARS.SPAWN_IDLE, BOSS_ENEMY_VARS.SPAWN_IDLE_PIVOT, 
			BOSS_ENEMY_VARS.ATTACK_RATE, BOSS_ENEMY_VARS.ATTACK_RANGE[0],
			BOSS_ENEMY_VARS.MAX_SPEED, BOSS_ENEMY_VARS.RESISTANCES[0]);


		BOSS_ENEMY_VARS.count++;

		this.phase = 1;

		// Load sounds
		var that = this;
		BOSS_ENEMY_VARS.ATTACK_SOUNDS.forEach(function (soundObj) {
			if (!that.SM.hasSound(soundObj.id)) {
				that.SM.loadSound(soundObj.id, soundObj.sound);
			}
		});
	}

	move() {	
		let friendlies = this.getInSight(BOSS_ENEMY_VARS.SIGHT_RANGE);
		// switch(this.phase) {
		// 	case 4:
		// 		break;
		// 	case 3:
		// 		break;
		// 	case 2:
		// 		break;
		// 	default: //phase 1
		// 		break;
		// }


		if(this.phase === 4  || (friendlies.length === 0 && (this.friendlyFocus === undefined || !this.friendlyFocus.obj.isAlive()))) {
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
				this.getInSight(BOSS_ENEMY_VARS.SIGHT_RANGE).forEach(friendly => {
					let friendPivot = friendly.obj.getNormalizedPivotPoint(),					
						direction = MathUtil['3PI2']-Math.atan2((myPivot.y - friendPivot.y), (friendPivot.x - myPivot.x));
					if(direction >= MathUtil['2PI']) { 
						direction -= MathUtil['2PI'];
					}
			 		new Bullet(this, BOSS_ENEMY_VARS.BULLET_IMG, BOSS_ENEMY_VARS.BULLET_SPEED, BOSS_ENEMY_VARS.ATTACK_DMG, 
			 			BOSS_ENEMY_VARS.DAMAGE_TYPE, direction, this.getLevel(), BOSS_ENEMY_VARS.BULLET_FUNCTION[this.phase-1]);
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
		 		new Bullet(this, BOSS_ENEMY_VARS.BULLET_IMG, BOSS_ENEMY_VARS.BULLET_SPEED, BOSS_ENEMY_VARS.ATTACK_DMG, 
		 			BOSS_ENEMY_VARS.DAMAGE_TYPE, direction, this.getLevel(), BOSS_ENEMY_VARS.BULLET_FUNCTION[this.phase-1]);
				break;
		}
		//PLAY SOUNDS ACCORDING TO THE PHASE
 		this.SM.playSound(MathUtil.eitherFromList(BOSS_ENEMY_VARS.ATTACK_SOUNDS_LIST));
	}

	//PHASE FUNCTIONS CALLED WHEN THE BOSS SWITCHES PHASES
	phase2() {
		this.phase = 2;
		this.attackRange = BOSS_ENEMY_VARS.ATTACK_RANGE[this.phase-1];
		this.resistances = BOSS_ENEMY_VARS.RESISTANCES[this.phase-1];

	}

	phase3() {
		this.phase = 3;
		this.attackRange = BOSS_ENEMY_VARS.ATTACK_RANGE[this.phase-1];

	}

	phase4() {
		this.phase = 4;
		this.attackRange = BOSS_ENEMY_VARS.ATTACK_RANGE[this.phase-1];
		//Give player the dragon so he can defeat the boss
		let level = this.getLevel(),
			biomancerGun = level.biomancer.gun;
		let UI = new UserInterface();
		UI.animalContainer.addAnimal("dragon", 4);
		biomancerGun.addAnimalToGun("DRAGON");

		//Break environment maybe?
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
			case 2:
				break;
			default: //phase 1
				if(!this.statuses["move-slow"].v) {
					return;
				}
				break;
		}
		// Take damage
		if(damageType === undefined || this.resistances[damageType] === undefined) {
			this.health -= hit;
		} else {
			this.health -= hit * this.resistances[damageType];
		}

		let healthPercent = this.health/BOSS_ENEMY_VARS.health;
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
			this.die();
		}
	}
}
