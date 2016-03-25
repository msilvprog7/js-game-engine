"use strict";

var BULLET_VARS = {
	count: 0,
	IMG: "biomancer/misc/bullet.png",
	WIDTH: 10,	
	HEIGHT: 21,
	PIVOT: {x: 5, y: 10.5},
	COLLISION_CHECK: 50, // this many ms between expensive collision checks
	ADD_DEFAULTS: {
		parentIsLevel: true,
		indexReferenceEntity: undefined, //Leave undefined for focusChild
		indexReferencePlacing: true, //True is before, false is after
		monitorHealth: false //True only if monitor health from start
	}
}

class Bullet extends Sprite {
	constructor(speed, damage, direction, parentPos, level) {
		super('bullet-'+BULLET_VARS.count, BULLET_VARS.IMG);
		this.launchSpeed = speed;
		this.damage = damage;
		this.direction = direction;
		this.parentPos = parentPos;
		this.level = level;
		this.spawn();
		this.nextCollisionCheck = new Date().getTime();
		BULLET_VARS.count++;
	}

	spawn() {	
		this.hitbox.setHitboxFromImage({width: BULLET_VARS.WIDTH, height: BULLET_VARS.HEIGHT});
		this.setPosition({
			x: this.parentPos.x,
			y: this.parentPos.y
		});
		this.setPivotPoint({x: BULLET_VARS.PIVOT.x, y:  BULLET_VARS.PIVOT.y});
		this.setRotation(this.direction);
		this.hitbox.applyBoundingBox();		
		this.level.addEntityToLevel(this, BULLET_VARS.ADD_DEFAULTS);
	}

	update() {
		this.setPosition({
			x: this.position.x - this.launchSpeed * Math.sin(this.direction), 
			y: this.position.y + this.launchSpeed * Math.cos(this.direction)
		});
		if(this.nextCollisionCheck < new Date().getTime()) {
			//Do a collision check
			let bullet = this, collders = this.level.getColliders(Enemy)
			for(let i = 0; i < collders.length; i++) {
				let f = collders[i];
				if(bullet.collidesWith(f)) {
					if(f.removeHealth) {
						f.removeHealth(bullet.damage);
					}
					bullet.level.removeEntity(this);
					return;
				}
			}
		}
		if(this.position.x < -1000 || this.position.x > 2000 || this.position.y < -1000 || this.position.y > 2000) {
			this.level.removeEntity(this);
		}
	}
}