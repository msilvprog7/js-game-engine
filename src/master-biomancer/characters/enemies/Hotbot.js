"use strict";

var HOTBOT_VARS = {
	count: 0,
	SIGHT_RANGE: 200,
	ATTACK_RANGE: 50,
	ATTACK_DMG: 20,
	DAMAGE_TYPE: "fire",
	BULLET_SPEED: 10,
	ATTACK_RATE: 5000, //ms between attacks
	HEALTH: 45,
	SPEED: 4,
	PERMISSIBLE_ANGLE: MathUtil['PI8'],
	TIME_BETWEEN_ROTATIONS: 1000,
	MOVE_BEHAVIOR: 'NONE',
	SPAWN_IDLE: "biomancer/enemies/hotbot/hotbot-normal.png",
	SPAWN_IDLE_PIVOT: {x: 25, y: 25},
	SPAWN_DIMENSIONS: {width: 50, height: 50},
	SPAWN_IDLE_ANIMATION_NAME: "idle",
	ATTACK_ANIMATION_NAME: "hot",
	ATTACK_IMG: "biomancer/enemies/hotbot/hotbot-hot.png",
	ATTACK_IMG_DURATION: 1000
};

class Hotbot extends Enemy {
	constructor() {
		super("hotbot-" + HOTBOT_VARS.count, HOTBOT_VARS.HEALTH, 
			HOTBOT_VARS.SPAWN_IDLE, HOTBOT_VARS.SPAWN_IDLE_PIVOT, 
			HOTBOT_VARS.ATTACK_RATE, HOTBOT_VARS.ATTACK_RANGE);

		// Load animations
		this.addAnimation(HOTBOT_VARS.ATTACK_ANIMATION_NAME, {images: [HOTBOT_VARS.ATTACK_IMG], loop: true});

		// Time before next rotation
		this.nextRotation = 0;

		HOTBOT_VARS.count++;
	}

	move() {
		let friendlies = this.getInFront(HOTBOT_VARS.SIGHT_RANGE, HOTBOT_VARS.PERMISSIBLE_ANGLE);
		if(friendlies.length === 0 && (this.friendlyFocus === undefined || !this.friendlyFocus.obj.isAlive())) {
			//No animals or biomancer in range, move randomly
			this.friendlyFocus = undefined;
			this.vX = 0;
			this.vY = 0;

			// Rotate
			if (new Date().getTime() >= this.nextRotation) {
				this.rotate();
			}
		} else {
			//MOVE TOWARDS HIGHEST PRIORITY FRIENDLY, CLOSEST IF FRIENDLIES SHARE PRIORITY
			if(friendlies.length > 0 && (this.friendlyFocus === undefined || friendlies[0].obj !== this.friendlyFocus || !this.friendlyFocus.obj.isAlive())) {
				this.friendlyFocus = friendlies[0];
			}
			let posToMove = this.friendlyFocus.obj.getPosition(),
				xMove = (this.position.x-CHARACTER_VARS.MOVE_EPSILON > posToMove.x) ? -1 : (this.position.x+CHARACTER_VARS.MOVE_EPSILON < posToMove.x) ? 1 : 0, 
				yMove = (this.position.y-CHARACTER_VARS.MOVE_EPSILON > posToMove.y) ? -1 : (this.position.y+CHARACTER_VARS.MOVE_EPSILON < posToMove.y) ? 1 : 0;

			if(this.friendlyFocus.distance <= this.attackRange) { 
				this.orient(xMove, yMove);
				return; 
			}

			this.vX = xMove*HOTBOT_VARS.SPEED;
			this.vY = yMove*HOTBOT_VARS.SPEED;
			this.orient(xMove, yMove);	
		}

		super.move();
	}

	rotate() {
		this.setDirection((this.direction + MathUtil['PI4']) % MathUtil['2PI']);

		// Set next time
		this.nextRotation = new Date().getTime() + HOTBOT_VARS.TIME_BETWEEN_ROTATIONS;
	}

	attack() {
		var that = this;
		super.attack();

		// ATTACK CLOSEST FRIENDLY TARGET
		this.friendlyFocus.obj.removeHealth(HOTBOT_VARS.ATTACK_DMG, HOTBOT_VARS.DAMAGE_TYPE);

		// Do damage animation
		this.setCurrentAnimation(HOTBOT_VARS.ATTACK_ANIMATION_NAME);
		window.setTimeout(function () {
			that.setCurrentAnimation(HOTBOT_VARS.SPAWN_IDLE_ANIMATION_NAME);
		}, HOTBOT_VARS.ATTACK_IMG_DURATION);
	}
}
