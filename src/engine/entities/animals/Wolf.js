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
	DECAY_AMOUNT: 1
};

/**
 * Our first animal, a friendly wolf
 */
class Wolf extends Animal {
	
	constructor() {
		super("wolf-" + WOLF_VARS.count, WOLF_VARS.HEALTH, WOLF_VARS.LAUNCH_IDLE, WOLF_VARS.LAUNCH_IDLE_PIVOT, 
			WOLF_VARS.SPAWN_IDLE, WOLF_VARS.SPAWN_IDLE_PIVOT,
			WOLF_VARS.LAUNCH_SPEED, WOLF_VARS.LAUNCH_DURATION, WOLF_VARS.DECAY_AMOUNT);

		WOLF_VARS.count++;
	}
	
}