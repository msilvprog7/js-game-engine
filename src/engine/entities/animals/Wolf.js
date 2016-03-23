"use strict";

// Duration will equal (HEALTH / DECAY_AMOUNT) * ANIMAL_VARS.NEXT_DECAY
var WOLF_VARS = {
	count: 0,
	HEALTH: 40,
	LAUNCH_IDLE: "biomancer/animals/wolf/wolf-launch.png",
	LAUNCH_IDLE_PIVOT: {x: 6, y: 6},
	LAUNCH_SPEED: 4,
	LAUNCH_DURATION: 1000,
	SPAWN_IDLE: "biomancer/animals/wolf/wolf-spawn.png",
	SPAWN_IDLE_PIVOT: {x: 25, y: 25},
	DECAY_AMOUNT: 1,
	RADIUS: 50,
	TURN_PROBABILITY: 0.01,
	WALK_PROBABILITY: 0.75,
	WALK_AMOUNT: 1
};

/**
 * Our first animal, a friendly wolf
 */
class Wolf extends Animal {
	
	constructor() {
		super("wolf-" + WOLF_VARS.count, WOLF_VARS.HEALTH, WOLF_VARS.LAUNCH_IDLE, WOLF_VARS.LAUNCH_IDLE_PIVOT, 
			WOLF_VARS.SPAWN_IDLE, WOLF_VARS.SPAWN_IDLE_PIVOT,
			WOLF_VARS.LAUNCH_SPEED, WOLF_VARS.LAUNCH_DURATION, WOLF_VARS.DECAY_AMOUNT, WOLF_VARS.RADIUS);

		WOLF_VARS.count++;
	}

	move() {
		// Random movement in radius
		var forceTurn = false;

		// Try to move forward
		if (Math.random() < WOLF_VARS.WALK_PROBABILITY) {
			var movement = this.movementForward(WOLF_VARS.WALK_AMOUNT);

			if (this.positionInRadius(movement)) {
				this.addToMovement(movement.x, movement.y);
				super.move();
			} else {
				forceTurn = true;
			}
		}

		// Change direction
		if (Math.random() < WOLF_VARS.TURN_PROBABILITY) {
			var r = MathUtil.modRadians(this.rotation + MathUtil.randomInt(-1, 1) * (Math.PI / 4));
			this.setDirection(r);
		} else if (forceTurn) {
			var r = MathUtil.modRadians(this.rotation + MathUtil.either(-1, 1) * (Math.PI / 4));
			this.setDirection(r);
		}
	}
	
}