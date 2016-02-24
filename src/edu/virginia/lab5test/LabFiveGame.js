"use strict";

/**
 * Main class. Instantiate or extend Game to create a new game of your own
 */

class LabFiveGame extends Game{

	constructor(canvas){
		super("Lab Five Game", 1000, 800, canvas);

		// Mario
		this.mario = new AnimatedSprite("Mario", "Mario_Idle.png");
		this.mario.addAnimation("run", {images: ["Mario_Run_0.png", "Mario_Run_1.png", "Mario_Idle.png", "Mario_Run_1.png"], loop: true});
		this.mario.addAnimation("jump", {images: ["Mario_Jump_0.png", "Mario_Jump_1.png"], loop: false});
		this.mario.setPosition({x: 500, y: 100});
		this.mario.setPivotPoint({x: 64, y: 64});
		this.mario.setSpeed(4.0);
		this.mario.hitbox.setHitbox([new Point(20, 10), new Point(78, 10), new Point(78, 125), new Point(20, 125)]);
		this.marioBody = new Body(this.mario, BODY.DYNAMIC, {mass: 10});

		// Generate platforms
		this.generatePlatformsForLevel();

		// Add children to game
		this.addChild(this.mario);
		this.platforms.forEach((item) => this.addChild(item.sprite));

		// Sound Manager
		this.SM = new SoundManager();
		this.SM.loadMusic('background', 'schwifty.mp3', true);
		this.SM.playMusic('background');

		// Physics Manager
		this.PM = new PhysicsManager();
		this.PM.addBody(this.marioBody);
		this.platforms.forEach((item) => this.PM.addBody(item.body));

		this.mario.addEventListener(EVENTS.COLLISION, this, function(id) {			
			console.log("COLLISION WITH " + id.toUpperCase());
		});
		this.mario.addEventListener(EVENTS.END_COLLISION, this, function(id) {			
			console.log("END COLLISION WITH " + id.toUpperCase());
		});
	}

	generatePlatformsForLevel() {
		this.platforms = [];
		this.generatePlatform({x: 0, y: 700});
		this.generatePlatform({x: 120, y: 700});
		this.generatePlatform({x: 240, y: 700});
		this.generatePlatform({x: 360, y: 700});
		this.generatePlatform({x: 480, y: 700});
		this.generatePlatform({x: 600, y: 700});
	}

	generatePlatform(position) {
		var platform = new Sprite("Platform" + this.platforms.length, "brick.png");
		platform.setPosition({x: position.x, y: position.y});
		platform.hitbox.setHitbox([new Point(0, 0), new Point(120, 0), new Point(120, 120), new Point(0, 120)]);
		var platformBody = new Body(platform, BODY.STATIC);
		this.platforms.push({sprite: platform, body: platformBody});
	}

	update(pressedKeys, timedelta){		
		super.update(pressedKeys, timedelta);

		// Update the physics bodies
		this.PM.update(timedelta);

		var idle = true;

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
			this.marioBody.addForceX("run-right", 30);
			this.mario.setCurrentAnimation("run");
			idle = false;
		} else if (hasRightForce) {
			this.marioBody.removeForce("run-right");
		} else if (pressedKeys.contains(39)) {
			idle = true;
		}

		// Left arrow key
		var hasLeftForce = this.marioBody.hasForce("run-left");
		if (pressedKeys.contains(37) && !hasLeftForce) {
			if(this.mario.getScaleX() >= 0) { 
				this.mario.setScaleX(-1 * this.mario.getScaleX()); 
			}
			this.marioBody.addForceX("run-left", -30);
			this.mario.setCurrentAnimation("run");
			idle = false;
		} else if (hasLeftForce) {
			this.marioBody.removeForce("run-left");
		} else if (pressedKeys.contains(37)) {
			idle = true;
		}

		// Up arrow key
		var canJump = Math.abs(this.marioBody.velocity.y) < 0.02;
		if (pressedKeys.contains(38) && canJump) {
			this.marioBody.addForceY("jump", -400);
			setTimeout(() => this.marioBody.removeForce("jump"), timedelta);
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
	var game = new LabFiveGame(drawingCanvas);
	game.start();
}