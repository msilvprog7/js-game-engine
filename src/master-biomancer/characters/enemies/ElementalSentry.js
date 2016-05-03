"use strict";

var ELEMENTAL_SENTRY_VARS = {
	count: 0,
	SIGHT_RANGE: 700,
	ATTACK_RANGE: 700,
	ATTACK_DMG: 10,
	DAMAGE_TYPE: [DAMAGE_TYPES["FIRE"],DAMAGE_TYPES["ICE"],DAMAGE_TYPES["POISON"],DAMAGE_TYPES["ELECTRIC"]],
	TYPES_LEN: 4,
	BULLET_SPEED: 10,
	ATTACK_RATE: 1500, //ms between attacks
	HEALTH: 70,
	SPEED: 0,
	MAX_SPEED: 0,
	RESISTANCES: {
		[DAMAGE_TYPES["PHYSICAL"]]: 0.5,
		[DAMAGE_TYPES["EXPLOSIVE"]]: 1.25
	},
	SPAWN_IDLE: "biomancer/enemies/elemental-sentry/elemental-sentry-fire.png",
	IDLE_IMAGES: [
		"biomancer/enemies/elemental-sentry/elemental-sentry-fire.png",
		"biomancer/enemies/elemental-sentry/elemental-sentry-ice.png",
		"biomancer/enemies/elemental-sentry/elemental-sentry-poison.png",
		"biomancer/enemies/elemental-sentry/elemental-sentry-electric.png"
	],
	SPAWN_IDLE_PIVOT: {x: 25, y: 25},
	SPAWN_DIMENSIONS: {width: 50, height: 50},
	BULLET_FUNCTION: function(collider, dmg, dmgType) {
		if(collider instanceof Friendly) {
			collider.removeHealth(dmg, dmgType);
			switch(dmgType) {
				case DAMAGE_TYPES["FIRE"]:
				case DAMAGE_TYPES["POISON"]:
					collider.addStatus("dot", 3000, dmg/2, dmgType);
					break;
				case DAMAGE_TYPES["ICE"]:
				case DAMAGE_TYPES["ELECTRIC"]:
					collider.addStatus("move-slow", 3000, 0.5);
					break;
			}
		}
	},
	BULLET_IMG: function(dmgType) {
		return "biomancer/enemies/elemental-sentry/bullet-" + dmgType.toLowerCase() + ".png";
	}
};

class ElementalSentry extends Enemy {
	constructor() {
		//constructor(id, health, spawnIdle, spawnIdlePivot, attackRate, attackRange, maxSpeed, resistances)
		super("elemental-sentry-" + ELEMENTAL_SENTRY_VARS.count, ELEMENTAL_SENTRY_VARS.HEALTH, 
			ELEMENTAL_SENTRY_VARS.SPAWN_IDLE, ELEMENTAL_SENTRY_VARS.SPAWN_IDLE_PIVOT, 
			ELEMENTAL_SENTRY_VARS.ATTACK_RATE, ELEMENTAL_SENTRY_VARS.ATTACK_RANGE,
			ELEMENTAL_SENTRY_VARS.MAX_SPEED, ELEMENTAL_SENTRY_VARS.RESISTANCES);

		ELEMENTAL_SENTRY_VARS.count++;
		this.lastResistance = DAMAGE_TYPES["FIRE"];
		ELEMENTAL_SENTRY_VARS.DAMAGE_TYPE.forEach(e => {
			this.addAnimation(e, {images: ['biomancer/enemies/elemental-sentry/elemental-sentry-' + e + '.png'], loop: true})
		});
	}

	move() {
		let friendlies = this.getInSight(ELEMENTAL_SENTRY_VARS.SIGHT_RANGE);
		if(friendlies.length === 0 && (this.friendlyFocus === undefined || !this.friendlyFocus.obj.isAlive())) {
			//No animals or biomancer in range
			this.friendlyFocus = undefined;
		} else {
			//MOVE TOWARDS HIGHEST PRIORITY FRIENDLY, CLOSEST IF FRIENDLIES SHARE PRIORITY
			if(friendlies.length > 0 && (this.friendlyFocus === undefined || friendlies[0].obj !== this.friendlyFocus || !this.friendlyFocus.obj.isAlive())) {
				this.friendlyFocus = friendlies[0];
			}
		}
		super.move();
	}

	attack() {
		super.attack();
		//Choose attack type
		let dmgType = ELEMENTAL_SENTRY_VARS.DAMAGE_TYPE[MathUtil.randomInt(0, ELEMENTAL_SENTRY_VARS.TYPES_LEN-1)];
		if(dmgType !== this.lastDamageType) {
			this.resistances[this.lastDamageType] = undefined;
			this.resistances[dmgType] = 0.5;
			this.lastDamageType = dmgType;
			this.setCurrentAnimation(dmgType);
		}

		//ATTACK CLOSEST FRIENDLY TARGET
		let friendPivot = this.friendlyFocus.obj.getNormalizedPivotPoint(),
			myPivot = this.getNormalizedPivotPoint(),
			direction = MathUtil['3PI2']-Math.atan2((myPivot.y - friendPivot.y), (friendPivot.x - myPivot.x));

		if(direction >= MathUtil['2PI']) { 
			direction -= MathUtil['2PI'];
		}
 		new Bullet(this, ELEMENTAL_SENTRY_VARS.BULLET_IMG(dmgType), ELEMENTAL_SENTRY_VARS.BULLET_SPEED, ELEMENTAL_SENTRY_VARS.ATTACK_DMG, 
 			dmgType, direction, this.getLevel(), ELEMENTAL_SENTRY_VARS.BULLET_FUNCTION);
	}
}
