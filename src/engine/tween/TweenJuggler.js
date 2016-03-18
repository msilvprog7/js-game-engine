"use strict";

let _tweenJugglerInstance = null;

// Tweenable parameters
var TWEEN_PARAMS = {
	SCALE_X: "scaleX",
	SCALE_Y: "scaleY",
	ROTATION: "rotation",
	ALPHA: "alpha",
	POSITION_X: "positionX",
	POSITION_Y: "positionY"
};

// Tween transitions, functions for a value from 0.0 to 1.0
var TWEEN_TRANSITIONS = {
	LINEAR: (x) => x,
	QUADRATIC: (x) => x * x
};

/**
 * A singleton class to manage tweens within our engine for all
 * Tween components (consist of DisplayObjects)
 * 
 * */
class TweenJuggler{

	constructor() {
		if (!_tweenJugglerInstance) {
			_tweenJugglerInstance = this;

			this.tweens = [];
		}

		return _tweenJugglerInstance;
	}

	add(tween, completedCallback) {
		this.tweens.push(tween);

		// Tween Juggler becomes the listener on behalf
		tween.displayObject.addEventListener(EVENTS.TWEEN_COMPLETE, this, completedCallback);
	}

	update(timedelta) {
		this.tweens.forEach(function (x) {
			x.update(timedelta);
			if (x.isCompleted()) {
				x.displayObject.dispatchEvent(EVENTS.TWEEN_COMPLETE, this);
			}
		});
		this.tweens = this.tweens.filter(x => !x.isCompleted());
	}

}