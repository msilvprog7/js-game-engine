"use strict";

/**
 * Tween object for sprite being tweened
 * 
 * */
class Tween{

	constructor(displayObject) {
		this.displayObject = displayObject;
		this.tweenParams = [];
	}

	animate(tweenParamToAnimate, startVal, endVal, duration, transition) {
		this.tweenParams.push(new TweenParam(tweenParamToAnimate, startVal, endVal, duration, transition));
	}

	update(timedelta) {
		var that = this;
		this.tweenParams.forEach(function (x) {
			x.elapsed += timedelta;
			that.setValue(x.paramToTween, x.getCurrentValue());
		});
	}

	isCompleted() {
		return (this.tweenParams.every(x => x.isCompleted()));
	}

	setValue(tweenParamToAnimate, value) {
		switch (tweenParamToAnimate) {
			case TWEEN_PARAMS.SCALE_X:
				this.displayObject.setScaleX(Math.sign(this.displayObject.scaleX)*value);
				break;
			case TWEEN_PARAMS.SCALE_Y:
				this.displayObject.setScaleY(value);
				break;
			case TWEEN_PARAMS.ROTATION:
				this.displayObject.setRotation(value);
				break;
			case TWEEN_PARAMS.ALPHA:
				this.displayObject.setAlpha(value);
				break;
			case TWEEN_PARAMS.POSITION_X:
				this.displayObject.setPosition({x: value, y: this.displayObject.position.y});
				break;
			case TWEEN_PARAMS.POSITION_Y:
				this.displayObject.setPosition({x: this.displayObject.position.x, y: value});
				break;
		}
	}

}
