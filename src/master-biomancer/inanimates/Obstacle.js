"use strict";


class Obstacle extends AnimatedSprite {
	
	constructor(id, idle, destroyable) {
		super(id, idle);

		this.destroyable = true;
		this.destroyed = false;

		this.hasPhysics = true;
		this.friction = 0.0;
		this.initCollisions();
	}

	destroy() {
		// Call to destroy object
		if (!this.destroyable) {
			return;
		}

		this.destroyed = true;
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