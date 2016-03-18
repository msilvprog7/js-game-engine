"use strict";

/**
 * Main class. Instantiate or extend Game to create a new game of your own
 */

class LabSixGame extends Game{

	constructor(canvas){
		super("Lab Six Game", 1000, 800, canvas);
		this.background = new AnimatedSprite("background", "mario_clouds.jpg");
		this.background.setPosition({x: -100, y: -100});
		// this.background.addAnimation("windy", {images: [
		// 	], loop: true});
		this.addChild(this.background);
		var that = this;		

		// Mario
		this.mario = new AnimatedSprite("Mario", "Mario_Idle.png");
		this.mario.addAnimation("run", {images: ["Mario_Run_0.png", "Mario_Run_1.png", "Mario_Idle.png", "Mario_Run_1.png"], loop: true});
		this.mario.addAnimation("jump", {images: ["Mario_Jump_0.png", "Mario_Jump_1.png"], loop: false});
		this.mario.setPosition({x: 500, y: 750});
		this.mario.setPivotPoint({x: 64, y: 64});
		this.mario.setSpeed(4.0);
		this.mario.hitbox.setHitbox([new Point(20, 10), new Point(78, 10), new Point(78, 125), new Point(20, 125)]);
		this.marioBody = new Body(this.mario, BODY.DYNAMIC, {mass: 1});
		this.marioDead = false;


		// Generate platforms
		this.generatePlatformsForLevel();

		// Coin
		this.coin = new Sprite("Coin", "coin.png");
		this.coin.setPosition({x: 300, y: 300});
		this.coin.setPivotPoint({x: 187 / 2, y: 187 / 2});
		this.coin.setScaleX(0.25);
		this.coin.setScaleY(0.25);
		this.coinBody = new Body(this.coin, BODY.NONE);

		// Add children to game
		this.background.addChild(this.mario);
		this.platforms.forEach((item) => this.background.addChild(item.sprite));
		this.background.addChild(this.coin);

		// Sound Manager
		this.SM = new SoundManager();
		this.SM.loadMusic('background', 'mario_background.mp3', true);
		this.SM.playMusic('background');
		this.SM.loadSound('coin', 'victory_sound.mp3');
		this.SM.loadSound('death', 'mario_death.mp3');

		// Physics Manager
		this.PM = new PhysicsManager();
		this.PM.addBody(this.marioBody);
		this.platforms.forEach((item) => this.PM.addBody(item.body));
		this.PM.addBody(this.coinBody);

		// Tween Juggler
		this.TJ = new TweenJuggler();
		this.marioTween = new Tween(this.mario);
		this.marioTween.animate(TWEEN_PARAMS.ALPHA, 0, 1, 1500, TWEEN_TRANSITIONS.QUADRATIC);
		this.marioTween.animate(TWEEN_PARAMS.SCALE_X, 0, 1, 1000, TWEEN_TRANSITIONS.QUADRATIC);
		this.marioTween.animate(TWEEN_PARAMS.SCALE_Y, 0, 1, 1000, TWEEN_TRANSITIONS.QUADRATIC);
		this.TJ.add(this.marioTween);
		this.coin.addEventListener(EVENTS.COLLISION, this.mario, function(id) {
			var coinTween = new Tween(that.coin);
			coinTween.animate(TWEEN_PARAMS.POSITION_X, that.coin.position.x, 550, 2000, TWEEN_TRANSITIONS.QUADRATIC);
			coinTween.animate(TWEEN_PARAMS.POSITION_Y, that.coin.position.y, 450, 2000, TWEEN_TRANSITIONS.QUADRATIC);
			coinTween.animate(TWEEN_PARAMS.SCALE_X, that.coin.scaleX, that.coin.scaleX*3, 2000, TWEEN_TRANSITIONS.QUADRATIC);
			coinTween.animate(TWEEN_PARAMS.SCALE_Y, that.coin.scaleY, that.coin.scaleY*3, 2000, TWEEN_TRANSITIONS.QUADRATIC);
			that.TJ.add(coinTween, function() {
				var coinTween2 = new Tween(that.coin);
				coinTween2.animate(TWEEN_PARAMS.ALPHA, 1, 0, 1000, TWEEN_TRANSITIONS.QUADRATIC);
				coinTween2.animate(TWEEN_PARAMS.SCALE_X, that.coin.scaleX, 0, 1000, TWEEN_TRANSITIONS.QUADRATIC);
				coinTween2.animate(TWEEN_PARAMS.SCALE_Y, that.coin.scaleY, 0, 1000, TWEEN_TRANSITIONS.QUADRATIC);
				that.TJ.add(coinTween2);
			});
			that.SM.playSound('coin', { pauseMusic: true });

			that.coin.removeEventListener(EVENTS.COLLISION, that.mario); });

		var platform1Tween = new Tween(this.platforms[0].sprite);
		platform1Tween.animate(TWEEN_PARAMS.SCALE_X, 8, 0, 12000, TWEEN_TRANSITIONS.LINEAR);
		this.TJ.add(platform1Tween, function() {
			var plat2 = that.platforms[1].sprite,
				platform2Tween = new Tween(plat2);
			platform2Tween.animate(TWEEN_PARAMS.SCALE_X, 7.5, 0, 12000, TWEEN_TRANSITIONS.LINEAR);
			platform2Tween.animate(TWEEN_PARAMS.POSITION_X, plat2.position.x, plat2.position.x+1000, 12000, TWEEN_TRANSITIONS.LINEAR);
			that.TJ.add(platform2Tween, function() {
				var platform3Tween = new Tween(that.platforms[2].sprite);
				platform3Tween.animate(TWEEN_PARAMS.SCALE_X, 6.5, 0, 12000, TWEEN_TRANSITIONS.LINEAR);
				that.TJ.add(platform3Tween);
			});
		});
		

	}

	generatePlatformsForLevel() {
		this.platforms = [];
		this.generatePlatform({x: 0, y: 800}, 8, 0.5);

		this.generatePlatform({x: 240, y: 600}, 7.5, 0.5);

		this.generatePlatform({x: 0, y: 400}, 6.5, 0.5);
	}

	generatePlatform(position, xRatio, yRatio) {
		var platform = new Sprite("Platform" + this.platforms.length, "brick.png");
		platform.setPosition({x: position.x, y: position.y});
		platform.setPivotPoint({x: 60, y: 60});
		platform.setScaleX(xRatio);
		platform.setScaleY(yRatio);
		platform.hitbox.setHitbox([new Point(0, 0), new Point(120, 0), new Point(120, 120), new Point(0, 120)]);
		var platformBody = new Body(platform, BODY.STATIC);
		this.platforms.push({sprite: platform, body: platformBody});
	}

	update(pressedKeys, timedelta){		
		super.update(pressedKeys, timedelta);

		// Update the physics bodies
		this.PM.update(timedelta);

		// Update the tween juggler
		this.TJ.update(timedelta);

		var idle = true;

		// Coin rotate
		this.coin.setRotation(this.coin.rotation + Math.PI * 30 / 720);

		// P for pause animation
		this.mario.setPaused(pressedKeys.contains(80));

		// V for invisible mario
		this.mario.setVisible(!pressedKeys.contains(86));

		// Right arrow key
		var hasRightForce = this.marioBody.hasForce("run-right");
		if (pressedKeys.contains(39) && !hasRightForce) {
			if(this.mario.getScaleX() < 0) { 
				this.mario.setScaleX(-1 * this.mario.getScaleX()); 
			}
			this.marioBody.addForceX("run-right", 60);
		} else if (hasRightForce) {
			this.marioBody.removeForce("run-right");
		}

		if (pressedKeys.contains(39)) {
			idle = false;
			this.mario.setCurrentAnimation("run");
		}

		// Left arrow key
		var hasLeftForce = this.marioBody.hasForce("run-left");
		if (pressedKeys.contains(37) && !hasLeftForce) {
			if(this.mario.getScaleX() >= 0) { 
				this.mario.setScaleX(-1 * this.mario.getScaleX()); 
			}
			this.marioBody.addForceX("run-left", -60);
		} else if (hasLeftForce) {
			this.marioBody.removeForce("run-left");
		}

		if (pressedKeys.contains(37)) {
			idle = false;
			this.mario.setCurrentAnimation("run");
		}

		// Up arrow key
		var canJump = Math.abs(this.marioBody.velocity.y) < 0.02;
		if (pressedKeys.contains(38) && canJump) {
			this.marioBody.addForceY("jump", -750);
			setTimeout(() => this.marioBody.removeForce("jump"), 2 * timedelta);
			this.mario.setCurrentAnimation("jump");
			idle = false;
		} else if(pressedKeys.contains(38)) {
			this.mario.setCurrentAnimation("jump");
			idle = false;
		}

		// Switch back to idle
		if (idle) {
			this.mario.setCurrentAnimation("idle");
		}

		if(this.mario.outOfFrame(1000, 800, 200) && !this.marioDead) {
			this.marioDead = true;
			this.SM.playSound('death', {pauseMusic: true, unpauseMusic: false});
			this.pause();
		}
	}

	draw(g){
		g.clearRect(0, 0, this.width, this.height);
		super.draw(g);
	}
}


/**
 * THIS IS THE BEGINNING OF THE PROGRAM
 * YOU NEED TO COPY THIS VERBATIM ANYTIME YOU CREATE A GAME
 */
function tick(){
	game.nextFrame();
}

/* Get the drawing canvas off of the  */
var drawingCanvas = document.getElementById('game');
if(drawingCanvas.getContext) {
	var game = new LabSixGame(drawingCanvas);
	game.start();
}
