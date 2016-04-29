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
			speed: 1
		},
		"stopped": {
			images: ["biomancer/misc/sawblade-0.png"],
			loop: true,
			speed: 100
		}
	},
	DAMAGE: 300,
	FAST_SPEED: 20,
	SLOW_SPEED: 5,
	INIT_MOVEMENT_MODIFIER: 1,
	MOVEMENT_MULTIPLIER: -1,
	START_TIME: 3000,
	VERTICAL: "vertical",
	HORIZONTAL: "horizontal"
};

class Sawblade extends Obstacle {
	
	constructor(type, speed) {
		super("sawblade-" + SAWBLADE_VARS.count, SAWBLADE_VARS.IDLE, SAWBLADE_VARS.DESTROYABLE);

		SAWBLADE_VARS.count++;

		this.stopped = false;
		this.type = type;
		this.movementModifier = SAWBLADE_VARS.INIT_MOVEMENT_MODIFIER;
		this.speed = speed;

		// Listener for wall collisions
		this.addEventListener(EVENTS.COLLISION, this, this.switchDirections, this);

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
		for(var animation in SAWBLADE_VARS.ANIMATIONS) {
			let currentAnimation = SAWBLADE_VARS.ANIMATIONS[animation];
			let animationInfo = {
				images: currentAnimation.images.map(image => image),
				loop: currentAnimation.loop,
				speed: currentAnimation.speed
			}
			this.addAnimation(animation, animationInfo);
		}
		this.setCurrentAnimation("spinning");
	}

	move(amount) {
		var xMove = 0,
			yMove = 0;

		switch (this.type) {
			case SAWBLADE_VARS.VERTICAL:
				yMove = amount;
				break;
			case SAWBLADE_VARS.HORIZONTAL:
				xMove = amount;
				break;
		}
		
		// Update position
		this.setPosition({x: this.position.x + xMove, y: this.position.y + yMove});
	}

	update() {
		super.update();

		let currentTime = new Date().getTime();

		if(!this.stopped) {
			this.move(this.movementModifier * this.speed);
		}		
		else if(currentTime > this.startTime) {
			this.start();
		}

		if(currentTime > this.nextCollisionCheck) {
			var that = this;

			// Mover collisions
			this.getLevel().movers.forEach(function (mover) {	
				if(typeof mover.removeHealth === "function") {
					if (mover.health > 0 && that.collidesWith(mover)) {
						mover.removeHealth(SAWBLADE_VARS.DAMAGE, DAMAGE_TYPES["PHYSICAL"]);
					}
				}
			});

			this.nextCollisionCheck = currentTime + 100;
		}
	}

	switchDirections(displayObjects) {
		var that = this;
		displayObjects.forEach(function (collider) {
			if (collider instanceof WallGroup || collider instanceof Wall) {
				// Switch direction
				that.movementModifier *= SAWBLADE_VARS.MOVEMENT_MULTIPLIER;
				switch (that.type) {
					case SAWBLADE_VARS.VERTICAL:
						that.move(that.movementModifier * SAWBLADE_VARS.DIMENSIONS.height);
						break;
					case SAWBLADE_VARS.HORIZONTAL:
						that.move(that.movementModifier * SAWBLADE_VARS.DIMENSIONS.width);
						break;
				}
			}
		});
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
	static generateSawblade(type, speed) {
		return new Sawblade(type, speed);
	}

}