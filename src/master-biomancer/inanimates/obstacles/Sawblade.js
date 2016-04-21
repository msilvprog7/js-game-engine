"use strict";

var SAWBLADE_VARS = {
	count: 0,
	IDLE: "biomancer/misc/sawblade-0.png",
	IDLE_PIVOT: {x: 25, y: 25},
	DIMENSIONS: {width: 50, height: 50},
	DESTROYABLE: false,
	ADD_DEFAULTS: {
		parentIsLevel: true,
		indexReferenceEntity: undefined, //Leave undefined for before focus child, or if no child exists appending to end
		indexReferencePlacing: true, //True or undefined is before, false is after
		monitorHealth: false //True only if monitor health from start
	},
	NORMAL_SOUND: {id: "rock-destroy-sound", sound: "biomancer/misc/rock-crumbling.mp3"},
	STOPPED_SOUND: {id: "rock-destroy-sound", sound: "biomancer/misc/rock-crumbling.mp3"},
	ANIMATIONS: {
		"spinning": {
			images: ["biomancer/misc/sawblade-0.png", "biomancer/misc/sawblade-1.png", "biomancer/misc/sawblade-2.png", "biomancer/misc/sawblade-3.png"],
			loop: true,
			speed: 30
		},
		"stopped": {
			images: ["biomancer/misc/sawblade-0.png"],
			loop: true,
			speed: 100
		}
	},
	DAMAGE: 300,
	SPEED: 1
};

class Sawblade extends Obstacle {
	
	constructor(endPoint) {
		super("sawblade-" + SAWBLADE_VARS.count, SAWBLADE_VARS.IDLE, SAWBLADE_VARS.DESTROYABLE);

		SAWBLADE_VARS.count++;

		this.stopped = false;
		this.startPoint = SAWBLADE_VARS.IDLE_PIVOT;
		this.endPoint = {x: endPoint.x + SAWBLADE_VARS.IDLE_PIVOT.x, y: endPoint.y + SAWBLADE_VARS.IDLE_PIVOT.y};
		this.nextPoint = endPoint;

		let currentTime = new Date().getTime();
		this.startTime = currentTime;
		this.nextCollisionCheck = currentTime;
		// Load sound
		// if (!this.SM.hasSound(SAWBLADE_VARS.NORMAL_SOUND.id)) {
		// 	this.SM.loadSound(SAWBLADE_VARS.NORMAL_SOUND.id, SAWBLADE_VARS.NORMAL_SOUND.sound);
		// }
		// if (!this.SM.hasSound(SAWBLADE_VARS.STOPPED_SOUND.id)) {
		// 	this.SM.loadSound(SAWBLADE_VARS.STOPPED_SOUND.id, SAWBLADE_VARS.STOPPED_SOUND.sound);
		// }

		// Load Animations
		for(var animation in WOLF_VARS.ANIMATIONS) {
			let currentAnimation = WOLF_VARS.ANIMATIONS[animation];
			let animationInfo = {
				images: currentAnimation.images.map(image => image),
				loop: currentAnimation.loop,
				speed: currentAnimation.speed
			}
			this.addAnimation(animation, animationInfo);
		}
	}

	setPosition(point) {
		// Update start and end position
		this.startPoint = {
			x: this.startPoint.x - this.position.x + point.x,
			y: this.startPoint.y - this.position.y + point.y
		};
		this.endPoint = {
			x: this.endPoint.x - this.position.x + point.x,
			y: this.endPoint.y - this.position.y + point.y
		};

		super.setPosition(point);
	}

	update() {
		let currentTime = new Date().getTime();
		if(!this.stopped) {
			let speed = SAWBLADE_VARS.SPEED;
			if(MathUtil.pointCompare(this.nextPoint, this.position, speed)) {
				this.nextPoint = (MathUtil.pointCompare(this.nextPoint, this.startPoint)) ? this.endPoint : this.startPoint;
			}
			let myPivot = this.getNormalizedPivotPoint(),
				xMove = (myPivot.x > this.nextPoint.x) ? -(speed) : (myPivot.x < this.nextPoint.x) ? speed : 0, 
				yMove = (myPivot.y > this.nextPoint.y) ? -(speed) : (myPivot.y < this.nextPoint.y) ? speed : 0;

			this.setPosition({x: this.position.x + xMove, y: this.position.y + yMove});
		}		
		else if(currentTime > this.startTime) {
			this.start();
		}
		if(currentTime > this.nextCollisionCheck) {
			this.getLevel().movers.forEach(function(mover) {				
				if(typeof mover.removeHealth ==="function") {
					if (mover.health > 0 && this.collidesWith(mover)) {
						mover.removeHealth(SAWBLADE_VARS.DAMAGE, DAMAGE_TYPES["PHYSICAL"]);
					}
				}
			});
			this.nextCollisionCheck = currentTime + 100;
		}
	}

	start() {
		if(!this.stopped) { return; }
		else {
			this.stopped = false;
			this.setCurrentAnimation("spinning");
		}
	}

	stop() {
		if(this.stopped) { return; }
		else {
			this.stopped = true;
			this.startTime = new Date().getTime() + SAWBLADE_VARS.START_TIME;
			this.setCurrentAnimation("stopped");
		}
	}

	/**
	  * Generate Sawblade
	 */
	static generateSawblade(cols, rows) {
		return new Sawblade({x: (cols - 1) * SAWBLADE_VARS.DIMENSIONS.width, y: (rows - 1) * SAWBLADE_VARS.DIMENSIONS.height});
	}

}