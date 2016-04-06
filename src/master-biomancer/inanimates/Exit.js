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
	}
}

class Exit extends Sprite {
	
	constructor() {
		super("level-exit", EXIT_VARS.IDLE_IMAGE);
		this.nextUpdate = new Date().getTime();
	}

	update() {
		let currentTime = new Date().getTime();
		if(this.biomancer !== undefined && currentTime > this.nextUpdate) {
			if(this.collidesWith(this.biomancer)) {
				//You win the game
				console.log("YOU WIN");
				this.getLevel().game.nextLevel();
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