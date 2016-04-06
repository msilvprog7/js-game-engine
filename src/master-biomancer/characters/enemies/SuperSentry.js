"use strict";

var SUPER_SENTRY_VARS = {
	count: 0,
	SIGHT_RANGE: 700,
	ATTACK_RANGE: 700,
	ATTACK_DMG: 15,
	DAMAGE_TYPE: DAMAGE_TYPES["LASER"],
	BULLET_SPEED: 10,
	ATTACK_RATE: 1500, //ms between attacks
	HEALTH: 60,
	SPEED: 0,
	MAX_SPEED: 0,
	RESISTANCES: {
		[DAMAGE_TYPES["PHYSICAL"]]: 0.4,
		[DAMAGE_TYPES["POISON"]]: 0.5,
		[DAMAGE_TYPES["FIRE"]]: 0.5,
		[DAMAGE_TYPES["EXPLOSIVE"]]: 1.25
	},
	SPAWN_IDLE: "biomancer/enemies/super-sentry/super-sentry.png",
	SPAWN_IDLE_PIVOT: {x: 25, y: 25},
	SPAWN_DIMENSIONS: {width: 50, height: 50},
	BULLET_FUNCTION: function(collider, dmg, dmgType) {
		if(collider instanceof Friendly) {
			collider.removeHealth(dmg, dmgType);			
		}
	},
	BULLET_IMG: "biomancer/misc/bullet.png"
};

class SuperSentry extends Enemy {
	constructor() {
		//constructor(id, health, spawnIdle, spawnIdlePivot, attackRate, attackRange, maxSpeed, resistances)
		super("super-sentry-" + SUPER_SENTRY_VARS.count, SUPER_SENTRY_VARS.HEALTH, 
			SUPER_SENTRY_VARS.SPAWN_IDLE, SUPER_SENTRY_VARS.SPAWN_IDLE_PIVOT, 
			SUPER_SENTRY_VARS.ATTACK_RATE, SUPER_SENTRY_VARS.ATTACK_RANGE,
			SUPER_SENTRY_VARS.MAX_SPEED, SUPER_SENTRY_VARS.RESISTANCES);

		SUPER_SENTRY_VARS.count++;
	}

	move() {
		super.move();
	}

	canAttack() {
		if (new Date().getTime() < this.nextAttackTime) {
			return false
		}
		let friendlies = this.getInSight(SUPER_SENTRY_VARS.SIGHT_RANGE);
		return friendlies.length > 0;
	}

	attack() {
		super.attack();
		//Choose attack type
		let myPivot = this.getNormalizedPivotPoint(),
			that = this,
		//ATTACK CLOSEST FRIENDLY TARGET
			friendlies = this.getInSight(SUPER_SENTRY_VARS.SIGHT_RANGE);
		friendlies.forEach(function(friendly) {
			let friendPivot = friendly.obj.getNormalizedPivotPoint(),
			direction = MathUtil['3PI2']-Math.atan2((myPivot.y - friendPivot.y), (friendPivot.x - myPivot.x));

			if(direction >= MathUtil['2PI']) { 
				direction -= MathUtil['2PI'];
			}
	 		new Bullet(that, SUPER_SENTRY_VARS.BULLET_IMG, SUPER_SENTRY_VARS.BULLET_SPEED, SUPER_SENTRY_VARS.ATTACK_DMG, 
	 			SUPER_SENTRY_VARS.DAMAGE_TYPE, direction, that.getLevel(), SUPER_SENTRY_VARS.BULLET_FUNCTION);
		});
		
	}
}
