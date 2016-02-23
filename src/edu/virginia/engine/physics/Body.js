"use strict";

var BODY = {
	NONE: 0,
	STATIC: 1,
	DYNAMIC: 2
}

/**
 * A physics body that wraps around DisplayObjects
 * 
 * */
class Body{

	constructor(displayObject, behavior, options) {
		this.displayObject = displayObject;
		this.behavior = behavior;

		// Physics state
		this.mass = options.mass || 1.0;
		this.elasticity = options.elasticity || 0.0;
		this.forces = {x: [], y: [PHYSICS.GRAVITY]};
		this.acceleration = {x: options.accelerationX || 0.0, y: options.accelerationY || 0.0};
		this.velocity = {x: options.velocityX || 0.0, y: options.velocityY || 0.0};
		this.maxSpeed = {x: options.maxSpeedX || -1.0, y: options.maxSpeedY || -1.0};
	}

	/**
	  * Update physics, only called on dynamic bodies
	 */
	update(timedelta) {
		timedeltaSeconds = timedelta * 1000;

		this.acceleration.x = this.forces.x.reduce((pv, cv) => pv + cv);
		this.acceleration.y = this.forces.y.reduce((pv, cv) => pv + cv);

		this.velocity.x += this.acceleration.x * timedeltaSeconds;
		if (Math.abs(this.velocity.x) > this.maxSpeed) {
			this.velocity.x = Math.sign(this.velocity.x) * this.maxSpeed;
		}

		this.velocity.y += this.acceleration.y * timedeltaSeconds;
		if (Math.abs(this.velocity.y) > this.maxSpeed) {
			this.velocity.y = Math.sign(this.velocity.y) * this.maxSpeed;
		}

		this.displayObject.position.x += this.velocity.x * timedeltaSeconds;
		this.displayObject.position.y += this.velocity.y * timedeltaSeconds;
	}

	checkConstraints(collidingBody) {
		var normals = this.displayObject.hitbox.getNormals(collidingBody.displayObject.id);
		
		// Static or dynamic
		if (collidingBody.behavior > BODY.NONE) {
			if(collidingBody.behavior === BODY.STATIC) {
				// Static
				
			} else {
				// Dynamic
				
			}
		}
	}

	checkCollision(otherBody) {
		if (this.displayObject.collidesWith(otherBody.displayObject)) {
			// Apply forces

			// Resolve positions
			checkConstraints(otherBody);
		}
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