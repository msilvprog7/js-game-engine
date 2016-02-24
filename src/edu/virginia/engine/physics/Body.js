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
		this.forces = {x: {friction: {force: PHYSICS.FRICTION}}, y: {gravity: {force: PHYSICS.GRAVITY}}}
		this.acceleration = {x: options.accelerationX || 0.0, y: options.accelerationY || 0.0};
		this.velocity = {x: options.velocityX || 0.0, y: options.velocityY || 0.0};
		this.maxSpeed = {x: options.maxSpeedX || -1.0, y: options.maxSpeedY || -1.0};
	}

	sumForcesY() {
		var sum = 0;
		for(let force in this.forces.y) {
			let f = this.forces.y[force].force;
			if(typeof f === 'function') {
				sum += f(this);
			} else if(typeof f === 'number') {
				sum += f;
			}
		}
		return sum;
	}

	sumForcesX() {
		var sum = 0;
		for(let force in this.forces.x) {
			let f = this.forces.x[force].force;
			if(typeof f === 'function') {
				sum += f(this);
			} else if(typeof f === 'number') {
				sum += f;
			}
		}
		return sum;
	}

	/**
	  * Update physics, only called on dynamic bodies
	 */
	update(timedelta) {
		this.acceleration.x = this.sumForcesX();
		this.acceleration.y = this.sumForcesY();
		// console.log(this.acceleration);

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

		// Update num updates
		for (let dir in this.forces) {
			for (let force in this.forces[dir]) {
				if (this.forces[dir][force].numUpdates !== undefined) {
					this.forces[dir][force].numUpdates--;

					if (this.forces[dir][force].numUpdates === 0) {
						delete this.forces[dir][force];
					}
				}
			}
		}
	}

	checkConstraints(collidingBody) {
		if(this.behavior === BODY.NONE || collidingBody.behavior === BODY.NONE) {
			return;
		}

		var collisions = this.displayObject.hitbox.isCollidingWith(collidingBody.displayObject.id);

		if(this.behavior === BODY.STATIC && collidingBody.behavior === BODY.DYNAMIC) {
			
			this.performStaticDynamicCollision(this, collidingBody, collisions, "s1");

		} else if(this.behavior === BODY.DYNAMIC && collidingBody.behavior === BODY.STATIC) {

			this.performStaticDynamicCollision(collidingBody, this, collisions, "s2");

		} else if(this.behavior === BODY.DYNAMIC) {
			//Both dynamic, do collision behavior
		}		
	}

	performStaticDynamicCollision(staticBody, dynamicBody, collisions, side) {
		var epsilon = 0.00001,
			notTopOrBottom = false,
			notLeftOrRight = false;

		// Filter collisions y (remove confusing case of top and bottom if possible)
		if (collisions.some(x => x[side] === HITBOX.SIDES[0]) && collisions.some(x => x[side] === HITBOX.SIDES[2])) {
			if (dynamicBody.velocity.y > epsilon) {
				collisions = collisions.filter(x => x[side] !== HITBOX.SIDES[2]);
			} else if (dynamicBody.velocity.y < -epsilon) {
				collisions = collisions.filter(x => x[side] !== HITBOX.SIDES[0]);
			} else {
				collisions = collisions.filter(x => x[side] !== HITBOX.SIDES[0] && x[side] !== HITBOX.SIDES[2]);
				notTopOrBottom = true;
			}
		}

		// Filter collisions x (remove confusing case of left and right if possible)
		if (collisions.some(x => x[side] === HITBOX.SIDES[1]) && collisions.some(x => x[side] === HITBOX.SIDES[3])) {
			if (dynamicBody.velocity.x > epsilon) {
				collisions = collisions.filter(x => x[side] !== HITBOX.SIDES[1]);
			} else if (dynamicBody.velocity.x < -epsilon) {
				collisions = collisions.filter(x => x[side] !== HITBOX.SIDES[3]);
			} else {
				collisions = collisions.filter(x => x[side] !== HITBOX.SIDES[1] && x[side] !== HITBOX.SIDES[3]);
				notLeftOrRight = true;
			}
		}

		// Based on the number of unique sides colliding
		var numSides = 0;
		for (let i = 0; i < 4; i++) {
			numSides += (collisions.some(x => x[side] === HITBOX.SIDES[i])) ? 1 : 0;
		}

		switch (numSides) {
			// Corner case
			case 2:
				// Create rectangle from points to determine side colliding
				var rectangle = new BoundingRectangle();
				collisions.forEach(x => rectangle.addPoint(x.intersection));

				if (rectangle.width >= rectangle.height && Math.abs(dynamicBody.velocity.y) > epsilon) {
					//console.log("TOP BOTTOM HIT");
					this.reposition(dynamicBody, staticBody, (collisions.some(x => x[side] === HITBOX.SIDES[0])) ? HITBOX.SIDES[0] : HITBOX.SIDES[2]);
					dynamicBody.velocity.y = 0;
				} else if (rectangle.height > rectangle.width && Math.abs(dynamicBody.velocity.x) > epsilon) {
					//console.log("LEFT RIGHT HIT");
					this.reposition(dynamicBody, staticBody, (collisions.some(x => x[side] === HITBOX.SIDES[3])) ? HITBOX.SIDES[3] : HITBOX.SIDES[1]);
					dynamicBody.velocity.x = 0;
				}

				break;

			// Resolve colliding side
			case 1:
				// Reverse side that collided
				if (collisions.some(x => x[side] === HITBOX.SIDES[0])) {
					//console.log("TOP");
					this.reposition(dynamicBody, staticBody, HITBOX.SIDES[0]);
					dynamicBody.velocity.y = 0;
				} else if (collisions.some(x => x[side] === HITBOX.SIDES[2])) {
					//console.log("BOTTOM");
					this.reposition(dynamicBody, staticBody, HITBOX.SIDES[2]);
					dynamicBody.velocity.y = 0;
				} else if (collisions.some(x => x[side] === HITBOX.SIDES[1])) {
					//console.log("RIGHT");
					this.reposition(dynamicBody, staticBody, HITBOX.SIDES[1]);
					dynamicBody.velocity.x = 0;
				} else if (collisions.some(x => x[side] === HITBOX.SIDES[3])) {
					//console.log("LEFT");
					this.reposition(dynamicBody, staticBody, HITBOX.SIDES[3]);
					dynamicBody.velocity.x = 0;
				}
				break;

			// Difficult to decide, so just reverse velocities
			case 0:
				// Reverse greater of two forces based on direction of pivot point
				var rectangle = new BoundingRectangle(),
					absDynamicPivot = new Point(dynamicBody.displayObject.pivotPoint.x + dynamicBody.displayObject.position.x, 
												dynamicBody.displayObject.pivotPoint.y + dynamicBody.displayObject.position.y),
					absStaticPivot = new Point(staticBody.displayObject.pivotPoint.x + staticBody.displayObject.position.x, 
												staticBody.displayObject.pivotPoint.y + staticBody.displayObject.position.y),
					deltaX = absDynamicPivot.x - absStaticPivot.x,
					deltaY = absDynamicPivot.y - absStaticPivot.y;
				rectangle.addPoint(absDynamicPivot);
				rectangle.addPoint(absStaticPivot);

				if (!notTopOrBottom && rectangle.height >= rectangle.width) {
					//console.log("UNDECIDED, REVERSE Y");
					this.reposition(dynamicBody, staticBody, (deltaY >= 0) ? HITBOX.SIDES[2] : HITBOX.SIDES[0]);
					dynamicBody.velocity.y = 0;
				} else if (!notLeftOrRight) {
					//console.log("UNDECIDED, REVERSE X");
					this.reposition(dynamicBody, staticBody, (deltaX >= 0) ? HITBOX.SIDES[1] : HITBOX.SIDES[3]);
					dynamicBody.velocity.x = 0;
				}

				/*
				if (Math.abs(dynamicBody.velocity.y) >= Math.abs(dynamicBody.velocity.x)) {
					// console.log("UNDECIDED, REVERSE Y");
					this.reposition(dynamicBody, staticBody, (dynamicBody.velocity.y >= 0) ? HITBOX.SIDES[0] : HITBOX.SIDES[2]);
					dynamicBody.velocity.y = 0;
				} else {
					// console.log("UNDECIDED, REVERSE X");
					this.reposition(dynamicBody, staticBody, (dynamicBody.velocity.x >= 0) ? HITBOX.SIDES[3] : HITBOX.SIDES[1]);
					dynamicBody.velocity.x = 0;
				}
				*/
				break;

			// No clue what's happening, only expecting in {0, 1, 2}
			default:
				console.error(numSides);
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

	addForceX(id, force, numUpdates) {
		this.forces.x[id] = {
			force: force,
			numUpdates: numUpdates
		};
	}

	addForceY(id, force, numUpdates) {
		this.forces.y[id] = {
			force: force,
			numUpdates: numUpdates
		};
	}
	addForce(id, vector, numUpdates) {
		this.addForceX(id, vector.x, numUpdates);
		this.addForceY(id, vector.y, numUpdates);
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