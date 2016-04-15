"use strict";

var ROTATION = {
	S: 0,
	SW: MathUtil['PI4'],
	W: MathUtil['PI2'],
	NW: MathUtil['3PI4'],
	N: MathUtil['PI'],
	NE: MathUtil['5PI4'],
	E: MathUtil['3PI2'],
	SE: MathUtil['7PI4']
};

var DAMAGE_TYPES = {
	PHYSICAL: "physical",
	EXPLOSIVE: "explosive",
	LASER: "laser",
	PURE: "pure",		//pure damage is usually unresistable
	FIRE: "fire",
	ICE: "ice",
	POISON: "poison",
	ELECTRIC: "electric"
};

var CHARACTER_VARS = {	
	MOVE_EPSILON: 10,
	STATUS_CULL_RATE: 200,
	DOT_TICK_RATE: 1000, //Every dot ticks at the same rate
	GEN_STATUS_LIST: function() {
		/* Returns an object that is a status list for the character with the values:
		* v - whether obj has status
		* d - time which status is removed
		* amount - how much this status effects the obj property, 
		* i.e. slow is amount*maxSpeed to get new maxSpeed, poison is removeHealth(amount) every dot tick;
		*/
		return { 
			"move-slow": {v: false, d: 0, amount: 0.0},
			"dot": {v: false, d: 0, amount: 0.0, damageType: DAMAGE_TYPES["PURE"]},
			"attack-slow": {v: false, d: 0, amount: 0.0}
		}
	},
	DEFAULT_RESISTANCES: {

	}
};



class Character extends AnimatedSprite {
	constructor(id, health, idle, maxSpeed, resistances) {
		super(id, idle);

		// Initialize direction
		this.direction = 0;

		// Set health
		this.maxHealth = health;
		this.health = health;

		// Statuses
		this.statuses = CHARACTER_VARS.GEN_STATUS_LIST();
		this.nextStatusCull = new Date().getTime();
		this.nextDotTick = new Date().getTime();
		this.resistances = (resistances === undefined) ? CHARACTER_VARS.DEFAULT_RESISTANCES : resistances;

		// Set physics
		this.hasPhysics = true;
		this.friction = 0.3;
		this.initCollisions();

		// Set max speed
		this.maxSpeed = maxSpeed;
	}

	update(pressedKeys) {
		// Update animated sprite		
		super.update(pressedKeys);

		let cur_time = new Date().getTime();

		//CULL THE DEAD STATUSES
		if(cur_time > this.nextStatusCull) {
			for(let k in this.statuses) {
				let status = this.statuses[k];
				if(status.v && cur_time > status.d) {
					this.removeStatus(status);
				}
			}
			this.nextStatusCull = cur_time + CHARACTER_VARS.STATUS_CULL_RATE;
		}

		//APPLY DOTS		
		if(this.statuses['dot'].v && cur_time > this.nextDotTick) {
			let dot = this.statuses['dot'];
			this.removeHealth(dot.amount, dot.damageType);
			this.nextDotTick = cur_time + CHARACTER_VARS.DOT_TICK_RATE;
		}			
	}

	movementForward(amount) {
		return {
			x: -Math.sin(this.rotation) * amount,
			y: Math.cos(this.rotation) * amount
		};
	}

	setDirection(direction) {
		// Assumes clockwise from south in Radians
		this.direction = direction;
		this.setRotation(direction);

		// Reform hitbox
		this.hitbox.applyBoundingBox();
	}

	orient(x, y) {
		if (x === 0 && y === 0) {
			return;
		}

		if (x < 0 && y < 0) {
			// North-west
			this.setDirection(ROTATION.NW);
		} else if (x > 0 && y < 0) {
			// North-east
			this.setDirection(ROTATION.NE);
		} else if (x > 0 && y > 0) {
			// South-east
			this.setDirection(ROTATION.SE);
		} else if (x < 0 && y > 0) {
			// South-west
			this.setDirection(ROTATION.SW);
		} else if (x < 0 && y === 0) {
			// West
			this.setDirection(ROTATION.W);
		} else if (x === 0 && y < 0) {
			// North
			this.setDirection(ROTATION.N);
		} else if (x > 0 && y === 0) {
			// East
			this.setDirection(ROTATION.E);
		} else if (x === 0 && y > 0) {
			// South
			this.setDirection(ROTATION.S);
		}
	}	

	move() {
		let m = (this.statuses['move-slow'].v) ? this.maxSpeed * this.statuses['move-slow'].amount : this.maxSpeed;
		this.aX = (Math.abs(this.vX) >= Math.abs(-Math.sin(this.rotation) * m)) ? 0 : this.aX;
		this.aY = (Math.abs(this.vY) >= Math.abs(Math.cos(this.rotation) * m)) ? 0 : this.aY;
	}

	draw(g) {
		// Draw animated sprite
		super.draw(g);
	}

	getLevel() {
		let l = this.parent, iters = 0;
		while(!(l instanceof Level)) {
			l = l.parent;
			iters++;
			if(iters > 10) { return undefined; }
		}
		return l;
	}

	setLevel(level) {
		this.parent = level;
	}

	getHealthRatio() {
		return (this.maxHealth <= 0) ? 0 : this.health / this.maxHealth;
	}

	removeHealth(hit, damageType) {
		// Take damage
		if(damageType === undefined || this.resistances[damageType] === undefined) {
			this.health -= hit;
		} else {
			this.health -= hit * this.resistances[damageType];
		}

		// Dispatch event
		if (this.health > 0) {
			this.dispatchEvent(EVENTS.HEALTH_UPDATED, {health: this.health});
		} else {
			this.dispatchEvent(EVENTS.DIED);
			this.die();
		}
	}

	addStatus(status, duration, amount, damageType) {
		let s = this.statuses[status],
			updateOthers = false;
		if(!s.v) {
			console.log(this.id + " IS NOW AFFLICTED BY: " + status);
			updateOthers = true;
		}

		s.v = true;
		s.d = new Date().getTime()+duration;
		if(status === "dot") {
			//Please include damage types with dots
			//COMMON EXAMPLES - physical for bleed, poison for ...poison, fire for burns
			s.damageType = damageType || DAMAGE_TYPES["PURE"];
		}
		s.amount = amount;

		if (updateOthers) {
			this.dispatchEvent(EVENTS.STATUS_UPDATED);
		}
	}

	removeStatus(status) {
		status.v = false;
		this.dispatchEvent(EVENTS.STATUS_UPDATED);
	}

	hasStatus(status) {
		return this.statuses[status].v;
	}

	isAlive() {
		return this.health > 0;
	}

	die() {
		// Override in subclasses
	}

	killSelf() {
		this.health = 0;
		this.dispatchEvent(EVENTS.DIED);
		this.die();
	}

	
}