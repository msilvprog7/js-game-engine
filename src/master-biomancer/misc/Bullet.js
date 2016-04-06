"use strict";

var BULLET_VARS = {
	count: 0,
	DECAY_TIME: 10000, //10 seconds
	COLLISION_CHECK: 50, // this many ms between expensive collision checks
	ADD_DEFAULTS: {
		parentIsLevel: true,
		indexReferenceEntity: undefined, //Leave undefined for focusChild
		indexReferencePlacing: false, //True is before, false is after
		monitorHealth: false //True only if monitor health from start
	}
}

class Bullet extends Sprite {
	constructor(creator, image, speed, damage, damageType, direction, level, onHitCallback) {
		super('bullet-'+BULLET_VARS.count, image);

		// Bullet qualities
		this.launchSpeed = speed;
		this.damage = damage;
		this.creator = creator;
		this.direction = direction;
		this.damageType = damageType || DAMAGE_TYPES.PHYSICAL;
		this.creatorPos = this.creator.getNormalizedPivotPoint();
		this.onHitCallback = onHitCallback;
		this.decayTime = new Date().getTime() + BULLET_VARS.DECAY_TIME;

		// Set level
		this.level = level;

		// Spawn
		this.nextCollisionCheck = new Date().getTime();
		this.width = this.displayImage.width;
		this.height = this.displayImage.height;

		this.spawn();
		
		BULLET_VARS.count++;
	}

	spawn() {	
		this.hitbox.setHitboxFromImage({width: this.width, height: this.height});
		this.setPosition({
			x: this.creatorPos.x,
			y: this.creatorPos.y
		});
		this.setPivotPoint({x: this.width/2, y:  this.height/2});
		this.setRotation(this.direction);
		this.hitbox.applyBoundingBox();		
		this.level.addEntityToLevel(this, BULLET_VARS.ADD_DEFAULTS);
	}

	update() {
		this.setPosition({
			x: this.position.x - this.launchSpeed * Math.sin(this.direction), 
			y: this.position.y + this.launchSpeed * Math.cos(this.direction)
		});
		let cur_time = new Date().getTime();
		if(this.nextCollisionCheck < cur_time) {
			//Do a collision check
			let bullet = this, collders = this.level.getColliders();
			for(let i = 0; i < collders.length; i++) {
				let d = collders[i];
				if(d.id !== this.creator.id && d.id !== this.id && bullet.collidesWith(d)) {
					this.onHitCallback(d, this.damage, this.damageType);					
					bullet.level.removeEntity(this);
					return;
				}
			}
			this.nextCollisionCheck = cur_time + BULLET_VARS.COLLISION_CHECK
		}
		if(new Date().getTime > this.decayTime) {
			this.level.removeEntity(this);
		}
	}
}