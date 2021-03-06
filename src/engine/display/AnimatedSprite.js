"use strict";

/**
 * A less basic Sprite that is animated.
 * 
 * */

class Animation {
	constructor(id, animationInfo, loadedCallback, finishedCallback) {
		this.id = id;
		this.loaded = false;
		this.frames = [];
		this.loadImages(animationInfo.images);
		this.loop = animationInfo.loop || false;
		this.speed = animationInfo.speed;
		this.loadedCallback = loadedCallback;
		this.reverse = this.setReverse(false);
		this.finished = false;
		this.finishedCallback = finishedCallback;
	}

	loadImages(imageList) {
		var counter = 0,
			that = this;
		for(let i = 0; i < imageList.length; i++) {
			let image = new Image();
			image.onload = function() {
				counter++;
				if(counter === imageList.length) {
					that.loaded = true;
					if(that.loadedCallback) {
						that.loadedCallback();
					}
				}
			};
			image.src = 'resources/images/' + imageList[i];
			that.frames.push(image);
		}
	}

	reload() {
		this.finished = false;
		if(!this.loop) {
			this.currentFrame = 0;
		}
	}

	nextFrame() {
		var increment = (this.reverse) ? -1 : 1;
		this.currentFrame += increment;
		if(this.loop && this.currentFrame < 0) {
			this.currentFrame = this.frames.length - 1;
		} else if(this.loop && this.currentFrame >= this.frames.length) {
			this.currentFrame = 0;
		} else if (this.currentFrame < 0 || this.currentFrame >= this.frames.length) {
			this.currentFrame -= increment;
		}

		this.finished = (!this.loop && (this.currentFrame <= 0 || this.currentFrame >= (this.frames.length - 1)));
		if (this.finished && this.finishedCallback !== undefined && typeof(this.finishedCallback.fcn) === "function") {
			let context = this.finishedCallback.ctx;
			this.finishedCallback.fcn.apply(context);
		}
	}

	setFrame(frame) {
		if(frame < this.frames.length) {
			this.currentFrame = frame;
		}
		return this.currentFrame;
	}

	getFrameImage() {
		return this.frames[this.currentFrame];
	}

	setLoop(loop) {
		this.loop = loop;
	}

	getLoop() {
		return this.loop;
	}

	setReverse(reverse) {
		this.reverse = reverse;
		this.currentFrame = (this.reverse) ? this.frames.length-1 : 0;
	}

	getReverse() {
		return this.reverse;
	}

	isFinished() {
		return this.finished;
	}

	setFinishedCallback(fcn, context) {
		this.finishedCallback = {
			fcn: fcn,
			ctx: context
		};
	}

	isLoaded() {
		return this.loaded;
	}

	getAnimationList() {
		return this.frames;
	}

	getAnimationLength() {
		return this.frames.length;
	}
}
class AnimatedSprite extends Sprite{
	
	constructor(id, filename){
		super(id, undefined);
		var that = this;
		this.animations = {
			'idle': new Animation('idle', {images: [filename], loop: true}, function () {
				that.setLoaded(true);
				that.hitbox.setHitboxFromImage(that.animations["idle"].frames[0]);
			})
		};
		this.setCurrentAnimation('idle');
		this.speed = 1.0; // ticks per frame
		this.currentFrameTick = 0;
		this.paused = false;
	}

	/**
	 * Invoked every frame, manually for now, but later automatically if this DO is in DisplayTree
	 */
	update(pressedKeys){
		super.update(pressedKeys);
		if(this.paused) { return; }
		let currentAnimation = this.getCurrentAnimation(),
			speed = currentAnimation.speed || this.speed;
		if(this.currentFrameTick >= speed) {
			this.currentFrameTick = 0;
			this.nextAnimationFrame();
			this.displayImage = currentAnimation.getFrameImage();
		}
		this.currentFrameTick++;
	}


	/**
	 * Draws this image to the screen
	 */
	draw(g){
		super.draw(g);
	}

	addAnimation(property, animationInfo, imagePath) {
		if (animationInfo.images.length <= 0) {
			throw "You should add images to your animation... smh";
			return;
		}

		if(imagePath !== undefined && typeof imagePath === "string") {
			animationInfo.images = animationInfo.images.map(image => imagePath+image);
		}
		this.animations[property] = new Animation(property, animationInfo, x => this.loaded=true);
	}

	removeAnimation(property) {
		if(this.animations[property]) {
			delete this.animations[property];
		}
	}

	setCurrentAnimation(property) {
		if(this.currentAnimation === property) {return;}

		var animation = this.animations[property];
		if (animation) {
			this.loaded = animation.isLoaded();
			animation.reload();
			this.displayImage = animation.getFrameImage();
			this.currentAnimation = property;
		}
	}

	getCurrentAnimation() {
		return this.animations[this.currentAnimation];
	}

	nextAnimationFrame() {
		this.getCurrentAnimation().nextFrame();
	}

	setPaused(p) { this.paused = p; }

	setSpeed(speed) {
		this.speed = speed;
	}

	getSpeed() {
		return this.speed;
	}
}

