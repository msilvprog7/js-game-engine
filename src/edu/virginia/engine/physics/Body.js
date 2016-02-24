"use strict";

var BODY = {
	NONE: 0,
	STATIC: 1,
	DYNAMIC: 2
};


/**
 * A physics body that wraps around DisplayObjects
 * 
 * */
class Body{

	constructor(displayObject, behavior, options) {
		this.displayObject = displayObject;
		this.behavior = behavior;

		// Physics state
		options = options || {};
		this.mass = options.mass || 1.0;
		this.elasticity = options.elasticity || 0.0;
		this.forces = {x: {wind: 5}, y: {gravity: PHYSICS.GRAVITY}}
		this.acceleration = {x: options.accelerationX || 0.0, y: options.accelerationY || 0.0};
		this.velocity = {x: options.velocityX || 0.0, y: options.velocityY || 0.0};
		this.maxSpeed = {x: options.maxSpeedX || -1.0, y: options.maxSpeedY || -1.0};
	}

	sumForcesY() {
		var sum = 0;
		for(let force in this.forces.y) {
			sum+=this.forces.y[force];
		}
		return sum;
	}

	sumForcesX() {
		var sum = 0;
		for(let force in this.forces.x) {
			sum+=this.forces.x[force];
		}
		return sum;
	}

	/**
	  * Update physics, only called on dynamic bodies
	 */
	update(timedelta) {
		this.acceleration.x = this.sumForcesX();
		this.acceleration.y = this.sumForcesY();

		this.velocity.x += this.acceleration.x * timedelta;
		if (this.maxSpeed.x >= 0 && Math.abs(this.velocity.x) > this.maxSpeed.x) {
			this.velocity.x = Math.sign(this.velocity.x) * this.maxSpeed.x;
		}

		this.velocity.y += this.acceleration.y * timedelta;
		if (this.maxSpeed.y >= 0 && Math.abs(this.velocity.y) > this.maxSpeed.y) {
			this.velocity.y = Math.sign(this.velocity.y) * this.maxSpeed.y;
		}

		this.displayObject.setPosition({
			x: this.displayObject.position.x + this.velocity.x * timedelta,
			y: this.displayObject.position.y + this.velocity.y * timedelta
		});
	}

	checkConstraints(collidingBody) {
		if(this.behavior === BODY.NONE || collidingBody.behavior === BODY.NONE) {return;}		
		var collisions = this.displayObject.hitbox.isCollidingWith(collidingBody.displayObject.id);			
		if(this.behavior === BODY.STATIC && collidingBody.behavior === BODY.DYNAMIC) {
			
			if (collisions.some(x => x.s1 === HITBOX.SIDES[0])) {
				collidingBody.velocity.y = 0;
				this.reposition(collidingBody, this, HITBOX.SIDES[0]);
			} else if (collisions.some(x => x.s1 === HITBOX.SIDES[2])) {
				collidingBody.velocity.y = 0;
				this.reposition(collidingBody, this, HITBOX.SIDES[2]);
			} else if (collisions.some(x => x.s1 === HITBOX.SIDES[1])) {
				collidingBody.velocity.x = 0;
				this.reposition(collidingBody, this, HITBOX.SIDES[1]);
			} else if (collisions.some(x => x.s1 === HITBOX.SIDES[3])) {
				collidingBody.velocity.x = 0;
				this.reposition(collidingBody, this, HITBOX.SIDES[3]);
			}

		} else if(this.behavior === BODY.DYNAMIC && collidingBody.behavior === BODY.STATIC) {

			if (collisions.some(x => x.s2 === HITBOX.SIDES[0])) {
				this.velocity.y = 0;
				this.reposition(this, collidingBody, HITBOX.SIDES[0]);
			} else if (collisions.some(x => x.s2 === HITBOX.SIDES[2])) {
				this.velocity.y = 0;
				this.reposition(this, collidingBody, HITBOX.SIDES[2]);
			} else if (collisions.some(x => x.s2 === HITBOX.SIDES[1])) {
				this.velocity.x = 0;
				this.reposition(this, collidingBody, HITBOX.SIDES[1]);
			} else if (collisions.some(x => x.s2 === HITBOX.SIDES[3])) {
				this.velocity.x = 0;
				this.reposition(this, collidingBody, HITBOX.SIDES[3]);
			}

		} else if(this.behavior === BODY.DYNAMIC) {
			//Both dynamic, do collision behavior
		}		
	}

	reposition(body1, body2, collidingSide) {
		// Move body1 along normal until it no longer collides with body2
		var scale = 0.25,
			increment = 0.1,
			count = 0,
			xModifier = 0,
			yModifier = 0,
			origX = body1.displayObject.position.x,
			origY = body1.displayObject.position.y;

		switch (collidingSide) {
			case HITBOX.SIDES[0]:
				yModifier = -1;
				break;
			case HITBOX.SIDES[2]:
				yModifier = 1;
				break;
			case HITBOX.SIDES[1]:
				xModifier = 1;
				break;
			case HITBOX.SIDES[3]:
				xModifier = -1;
				break;
		}

		while (body1.displayObject.collidesWith(body2.displayObject)) {
			body1.displayObject.setPosition({
				x: origX + scale * xModifier,
				y: origY + scale * yModifier,
			});
			scale += increment;
			count++;
		}
		// console.log(count + " times to reposition");
	}

	checkCollision(otherBody) {
		if (this.displayObject.collidesWith(otherBody.displayObject)) {
			// Apply forces and resolve positions
			this.checkConstraints(otherBody);
		}
	}

	hasForceX(id) {
		return this.forces.x[id] !== undefined;
	}

	hasForceY(id) {
		return this.forces.y[id] !== undefined;
	}

	hasForce(id) {
		return this.hasForceX(id) || this.hasForceY(id);
	}

	addForceX(id, force) {
		this.forces.x[id] = force;
	}

	addForceY(id, force) {
		this.forces.y[id] = force;
	}
	addForce(id, vector) {
		this.forces.y[id] = vector.y;
		this.forces.x[id] = vector.x;
	}
	removeForceX(id) {
		delete this.forces.x[id];
	}
	removeForceY(id) {
		delete this.forces.y[id];
	}
	removeForce(id) {
		this.removeForceY(id);
		this.removeForceX(id);
	}
	getBehavior() {
		return this.behavior;
	}

	setBehavior(behavior) { 
		this.behavior = behavior;
	}

	getMass() {
		return this.mass;
	}

	setMass(mass) {
		this.mass = mass;
	}

	getElasticity() {
		return this.elasticity;
	}

	setElasticity(elasticity) {
		this.elasticity = elasticity;
	}

	getAcceleration() {
		return {x: this.acceleration.x, y: this.acceleration.y};
	}

	setAcceleration(acceleration) {
		this.acceleration = {x: acceleration.x || this.acceleration.x, y: acceleration.y || this.acceleration.y};
	}

	getAccelerationX() {
		return this.acceleration.y;
	}

	setAccelerationX(accelerationX) {
		this.acceleration.x = accelerationX;
	}

	addAccelerationX(accelerationX) {
		this.acceleration.x += accelerationX;
	}

	getAccelerationY() {
		return this.acceleration.y;
	}

	setAccelerationY(accelerationY) {
		this.acceleration.y = accelerationY;
	}

	addAccelerationY(accelerationY) {
		this.acceleration.y += accelerationY;
	}

	getVelocity() {
		return {x: this.velocity.x, y: this.velocity.y};
	}

	setVelocity(velocity) {
		this.velocity = {x: velocity.x || this.velocity.x, y: velocity.y || this.velocity.y};
	}

	getVelocityX() {
		return this.velocity.x;
	}

	setVelocityX(velocityX) {
		this.velocity.x = velocityX;
	}

	getVelocityY() {
		return this.velocity.y;
	}

	setVelocityY(velocityY) {
		this.velocity.y = velocityY;
	}

	getMaxSpeed() {
		return {x: this.maxSpeed.x, y: this.maxSpeed.y};
	}

	setMaxSpeed(maxSpeed) {
		this.maxSpeed = {x: maxSpeed.x || this.maxSpeed.x, y: maxSpeed.y || this.maxSpeed.y};
	}

	getMaxSpeedX() {
		return this.maxSpeed.x;
	}

	setMaxSpeedX(maxSpeedX) {
		this.maxSpeed.x = maxSpeedX;
	}

	getMaxSpeedY() {
		return this.maxSpeed.y;
	}

	setMaxSpeedY(maxSpeedY) {
		this.maxSpeed.y = maxSpeedY;
	}

}