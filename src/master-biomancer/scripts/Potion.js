"use strict";

var POTION_VARS = {
	DRINKING_SOUND: {id: "drinking-sound", sound: "biomancer/misc/drinking.mp3"},
	ADD_DEFAULTS: {
		parentIsLevel: true,
		indexReferenceEntity: undefined, //Leave undefined for before focus child, or if no child exists appending to end
		indexReferencePlacing: true, //True or undefined is before, false is after
		monitorHealth: false //True only if monitor health from start
	}
};


class Potion extends ScriptObject {
	
	constructor(id, idle) {
		super(id);

		// Load image
		this.loadImage(idle);

		// Visible from the start
		this.visible = true;

		// Physics
		this.hasPhysics = true;
		this.friction = 0.0;
		this.initCollisions();

		// Sound manager
		this.SM = new SoundManager();

		// Drinking sound
		if (!this.SM.hasSound(POTION_VARS.DRINKING_SOUND.id)) {
			this.SM.loadSound(POTION_VARS.DRINKING_SOUND.id, POTION_VARS.DRINKING_SOUND.sound);
		}
	}

	/**
	 * Figure out which object is the Character to apply the potion to
	 */
	script(displayObjects) {
		super.script();
		
		var that = this;
		displayObjects = displayObjects.filter((displayObject) => displayObject !== that);
		
		if (displayObjects.length > 0) {
			this.drink(displayObjects[0]);
		}
	}

	drink(character) {
		// Override in sublass and call super to play sound
		// Play sound
		this.SM.playSound(POTION_VARS.DRINKING_SOUND.id);
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