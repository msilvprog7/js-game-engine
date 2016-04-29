"use strict";

var BASIC_ENEMY_VARS = {
	count: 0,
	SIGHT_RANGE: 500,
	ATTACK_RANGE: 300,
	ATTACK_DMG: 10,
	DAMAGE_TYPE: DAMAGE_TYPES["LASER"],
	BULLET_SPEED: 10,
	ATTACK_RATE: 2000, //ms between attacks
	HEALTH: 50,
	SPEED: 2,
	MAX_SPEED: 2,
	RESISTANCES: {
		[DAMAGE_TYPES["EXPLOSIVE"]]: 0.5
	},
	SPAWN_IDLE: "biomancer/enemies/basic-enemy/basic-enemy.png",
	SPAWN_IDLE_PIVOT: {x: 35, y: 15},
	SPAWN_DIMENSIONS: {width: 70, height: 70},
	BULLET_IMG: "biomancer/misc/bullet.png",
	BULLET_FUNCTION: function(collider, dmg, dmgType) {
		if(collider instanceof Friendly) {
			collider.removeHealth(dmg, dmgType);
		}
	},
	ATTACK_SOUNDS: [
		{id: "gun-shot-0", sound: "biomancer/weapons/basic-enemy/gun-shot-0.mp3"},
		{id: "gun-shot-1", sound: "biomancer/weapons/basic-enemy/gun-shot-1.mp3"},
		{id: "gun-shot-2", sound: "biomancer/weapons/basic-enemy/gun-shot-2.mp3"},
		{id: "gun-shot-3", sound: "biomancer/weapons/basic-enemy/gun-shot-3.mp3"}
	],
	ATTACK_SOUNDS_LIST: ["gun-shot-0", "gun-shot-1", "gun-shot-2", "gun-shot-3"]
};

class BasicEnemy extends Enemy {
	constructor() {
		//constructor(id, health, spawnIdle, spawnIdlePivot, attackRate, attackRange, maxSpeed, resistances)
		super("basic-enemy-" + BASIC_ENEMY_VARS.count, BASIC_ENEMY_VARS.HEALTH, 
			BASIC_ENEMY_VARS.SPAWN_IDLE, BASIC_ENEMY_VARS.SPAWN_IDLE_PIVOT, 
			BASIC_ENEMY_VARS.ATTACK_RATE, BASIC_ENEMY_VARS.ATTACK_RANGE,
			BASIC_ENEMY_VARS.MAX_SPEED, BASIC_ENEMY_VARS.RESISTANCES);

		BASIC_ENEMY_VARS.count++;

		// Load sounds
		var that = this;
		BASIC_ENEMY_VARS.ATTACK_SOUNDS.forEach(function (soundObj) {
			if (!that.SM.hasSound(soundObj.id)) {
				that.SM.loadSound(soundObj.id, soundObj.sound);
			}
		});
	}

	move() {
		let friendlies = this.getInSight(BASIC_ENEMY_VARS.SIGHT_RANGE);
		if(friendlies.length === 0 && (this.friendlyFocus === undefined || !this.friendlyFocus.obj.isAlive())) {
			//No animals or biomancer in range, move randomly
			this.friendlyFocus = undefined;
			this.vX = 0;
			this.vY = 0;
		} else {
			//MOVE TOWARDS HIGHEST PRIORITY FRIENDLY, CLOSEST IF FRIENDLIES SHARE PRIORITY
			if(friendlies.length > 0 && (this.friendlyFocus === undefined || friendlies[0].obj !== this.friendlyFocus || !this.friendlyFocus.obj.isAlive())) {
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
 			BASIC_ENEMY_VARS.DAMAGE_TYPE, direction, this.getLevel(), BASIC_ENEMY_VARS.BULLET_FUNCTION);

 		// Play sound
 		this.SM.playSound(MathUtil.eitherFromList(BASIC_ENEMY_VARS.ATTACK_SOUNDS_LIST));
	}
}
