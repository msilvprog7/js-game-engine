"use strict";

var ROCK_VARS = {
	count: 0,
	IDLE: "biomancer/misc/rock.png",
	IDLE_PIVOT: {x: 25, y: 25},
	DIMENSIONS: {width: 50, height: 50},
	DESTROYABLE: true,
	ADD_DEFAULTS: {
		parentIsLevel: true,
		indexReferenceEntity: undefined, //Leave undefined for before focus child, or if no child exists appending to end
		indexReferencePlacing: true, //True or undefined is before, false is after
		monitorHealth: false //True only if monitor health from start
	},
	DESTROY_SOUND: {id: "rock-destroy-sound", sound: "biomancer/misc/rock-crumbling.mp3"}
};

class Rock extends Obstacle {
	
	constructor() {
		super("rock-" + ROCK_VARS.count, ROCK_VARS.IDLE, ROCK_VARS.DESTROYABLE);

		ROCK_VARS.count++;

		// Sound manager
		this.SM = new SoundManager();

		// Load sound
		if (!this.SM.hasSound(ROCK_VARS.DESTROY_SOUND.id)) {
			this.SM.loadSound(ROCK_VARS.DESTROY_SOUND.id, ROCK_VARS.DESTROY_SOUND.sound);
		}
	}

	destroy() {
		// Play sound
		this.SM.playSound(ROCK_VARS.DESTROY_SOUND.id);

		// Destroy
		super.destroy();
	}

}