"use strict";

/**
 * Tween parameter throughout its update process
 * 
 * */
class TweenParam{

	constructor(paramToTween, startVal, endVal, duration, transition) {
		this.paramToTween = paramToTween;
		this.transition = (transition !== undefined) ? transition : TWEEN_TRANSITIONS.LINEAR;
		this.startVal = startVal;
		this.endVal = endVal;
		this.duration = duration;
		this.elapsed = 0.0;
	}

	percentDone() {
		return (Math.min(this.elapsed, this.duration) / this.duration); 
	}

	isCompleted() {
		return this.percentDone() >= 1.0;
	}

	getCurrentValue() {
		return this.startVal + this.transition(this.percentDone()) * (this.endVal - this.startVal);
	}

}