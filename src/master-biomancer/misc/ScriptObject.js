"use strict";


class ScriptObject extends DisplayObjectContainer {
	
	constructor(id) {
		super(id, undefined);

		// Get UI
		this.UserInterface = new UserInterface();

		this.activated = false;

		// Hidden
		this.visible = false;

		// this.hasPhysics = true;
		// this.friction = 0.0;
		// this.initCollisions();
	}

	setScript(script) {
		//ABSOLUTELY ALWAYS CALL THIS IN THE CONSTRUCTOR
		this.script = script;
		this.addEventListener(EVENTS.COLLISION, this, this.script, this);
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