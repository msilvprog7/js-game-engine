"use strict";

var EXIT_VARS = {
	NEXT_UPDATE: 500,
	IDLE_IMAGE: "biomancer/misc/exit.png",
	DIMENSIONS: {width: 64, height: 96},
	SPAWN_IDLE_PIVOT: {x: 32, y: 48},
	ADD_DEFAULTS: {
		parentIsLevel: true,
		indexReferenceEntity: undefined, //Leave undefined for before focus child, or if no child exists appending to end
		indexReferencePlacing: false, //True or undefined is before, false is after
		monitorHealth: false //True only if monitor health from start
	},
	DIALOGUE_OPTIONS: {
		wordTime: 50,
		pauseOnPeriod: true
	},
	DOOR_LOCKED_SOUND: {id: "door-locked", sound: "biomancer/misc/door-locked.mp3"},
	DOOR_OPEN_SOUND: {id: "door-open", sound: "biomancer/misc/door-open.mp3"}
}

class Exit extends Sprite {
	
	constructor() {
		super("level-exit", EXIT_VARS.IDLE_IMAGE);
		this.nextUpdate = new Date().getTime();
		this.currentKeys = -1;
		this.UI = new UserInterface();

		// Sound manager
		this.SM = new SoundManager();

		// Load door locked sound
		if (!this.SM.hasSound(EXIT_VARS.DOOR_LOCKED_SOUND.id)) {
			this.SM.loadSound(EXIT_VARS.DOOR_LOCKED_SOUND.id, EXIT_VARS.DOOR_LOCKED_SOUND.sound);
		}

		// Load door open sound
		if (!this.SM.hasSound(EXIT_VARS.DOOR_OPEN_SOUND.id)) {
			this.SM.loadSound(EXIT_VARS.DOOR_OPEN_SOUND.id, EXIT_VARS.DOOR_OPEN_SOUND.sound);
		}
	}

	update() {
		let currentTime = new Date().getTime();
		if(this.biomancer !== undefined && currentTime > this.nextUpdate) {
			if(this.collidesWith(this.biomancer)) {
				//You win the game			
				let remainingKeys = this.UI.keysToGet;
				if(remainingKeys > 0 && this.currentKeys !== remainingKeys) {
					this.currentKeys = remainingKeys;
					let message = "I still need " + remainingKeys + " more " + ((remainingKeys > 1) ? "keys" : "key") + " to open this door";
					this.UI.showDialog(message, EXIT_VARS.DIALOGUE_OPTIONS);
					this.SM.playSound(EXIT_VARS.DOOR_LOCKED_SOUND.id);
				} else if(remainingKeys === 0) {
					console.log("YOU WIN");
					this.getLevel().game.nextLevel();
					this.SM.playSound(EXIT_VARS.DOOR_OPEN_SOUND.id);
				}
			}
			this.nextUpdate = currentTime + EXIT_VARS.NEXT_UPDATE;
		} else if(this.biomancer === undefined) {
			this.biomancer = this.getLevel().getFocusChild();
		}
	}

	getLevel() {
		let l = this.parent, iters = 0;
		while(!(l instanceof Level)) {
			l = l.parent;
			iters++;
			if(iters > 10) { return undefined; }
		}
		return l;
	}

	setLevel(level) {
		this.parent = level;
	}
	
}