"use strict";

/**
 * Main class. Instantiate or extend Game to create a new game of your own
 */

class LabFiveGame extends Game{

	constructor(canvas){
		super("Lab Five Game", 1000, 1000, canvas);

		// Mario
		this.mario = new AnimatedSprite("Mario", "Mario_Idle.png");
		this.mario.addAnimation("run", {images: ["Mario_Run_0.png", "Mario_Run_1.png", "Mario_Idle.png", "Mario_Run_1.png"], loop: true});
		this.mario.addAnimation("jump", {images: ["Mario_Jump_0.png", "Mario_Jump_1.png"], loop: false});
		this.mario.setPosition({x: 100, y: 100});
		this.mario.setPivotPoint({x: 64, y: 64});
		this.mario.setSpeed(4.0);


		this.mario2 = new AnimatedSprite("Mario2", "Mario_Idle.png");
		this.mario2.addAnimation("run", {images: ["Mario_Run_0.png", "Mario_Run_1.png", "Mario_Idle.png", "Mario_Run_1.png"], loop: true});
		this.mario2.addAnimation("jump", {images: ["Mario_Jump_0.png", "Mario_Jump_1.png"], loop: false});
		this.mario2.setPosition({x: 400, y: 100});
		this.mario2.setPivotPoint({x: 64, y: 64});
		this.mario2.setSpeed(4.0);
		this.mario2.setScaleX(-1);

		// Add children to game
		this.addChild(this.mario);
		this.addChild(this.mario2);

		// Sound Manager
		this.SM = new SoundManager();
		this.SM.loadMusic('background', 'schwifty.mp3', true);
		this.SM.playMusic('background');

		// Physics Manager
		this.PM = new PhysicsManager();
		this.PM.addBody(new Body(this.mario, BODY.DYNAMIC, {mass: 10}));
		this.PM.addBody(new Body(this.mario2, BODY.DYNAMIC, {mass: 10}));

		this.mario.addEventListener(EVENTS.COLLISION, this, function(id) {			
			console.log("COLLISION WITH " + id.toUpperCase());
		});
		this.mario.addEventListener(EVENTS.END_COLLISION, this, function(id) {			
			console.log("END COLLISION WITH " + id.toUpperCase());
		});
	}

	update(pressedKeys){
		super.update(pressedKeys);

		var idle = true;

		// P for pause animation
		this.mario.setPaused(pressedKeys.contains(80));

		// V for invisible mario
		this.mario.setVisible(!pressedKeys.contains(86));

		// Right arrow key
		if (pressedKeys.contains(39)) {
			if(this.mario.getScaleX() < 0) { 
				this.mario.setScaleX(-1 * this.mario.getScaleX()); 
			}
			this.mario.setPosition({x: this.mario.getPosition().x + 8 / (this.mario.getSpeed()), y: this.mario.getPosition().y});
			this.mario.setCurrentAnimation("run");

			if(this.mario2.getScaleX() >= 0) { 
				this.mario2.setScaleX(-1 * this.mario2.getScaleX()); 
			}
			this.mario2.setPosition({x: this.mario2.getPosition().x - 8 / (this.mario2.getSpeed()), y: this.mario2.getPosition().y});
			this.mario2.setCurrentAnimation("run");
			idle = false;
		}

		// Left arrow key
		var pressedLeft = false;
		if (pressedKeys.contains(37)) {
			if(this.mario.getScaleX() >= 0) { 
				this.mario.setScaleX(-1 * this.mario.getScaleX()); 
			}			
			this.mario.setPosition({x: this.mario.getPosition().x - 8 / (this.mario.getSpeed()), y: this.mario.getPosition().y});
			this.mario.setCurrentAnimation("run");
			idle = false;

			if(this.mario2.getScaleX() < 0) { 
				this.mario2.setScaleX(-1 * this.mario2.getScaleX()); 
			}
			this.mario2.setPosition({x: this.mario2.getPosition().x + 8 / (this.mario2.getSpeed()), y: this.mario2.getPosition().y});
			this.mario2.setCurrentAnimation("run");
		}

		// Up arrow key
		if (pressedKeys.contains(38)) {
			this.mario.setPosition({x: this.mario.getPosition().x, y: this.mario.getPosition().y - 4 / (this.mario.getSpeed())});
			this.mario.setCurrentAnimation("jump");
			idle = false;
		}

		// 1 key
		var xModifier = 1.0;
		var yModifier = 1.0;
		if (pressedKeys.contains(49)) {
			xModifier = (this.mario.getScaleX() < 0) ? -1 : 1;
			yModifier = (this.mario.getScaleY() < 0) ? -1 : 1;
			this.mario.setScaleX(this.mario.getScaleX() + xModifier * 0.01);
			this.mario.setScaleY(this.mario.getScaleY() + yModifier * 0.01 * this.mario.getAspectRatio());
		}

		// 2 key
		if (pressedKeys.contains(50)) {
			xModifier = (this.mario.getScaleX() < 0) ? -1 : 1;
			yModifier = (this.mario.getScaleY() < 0) ? -1 : 1;
			this.mario.setScaleX(this.mario.getScaleX() - xModifier * 0.01);
			this.mario.setScaleY(this.mario.getScaleY() - yModifier * 0.01 * this.mario.getAspectRatio());
		}

		// 3 key - rotate
		if(pressedKeys.contains(51)) {
			this.mario.setRotation(this.mario.getRotation() + Math.PI/64);
		}

		// Switch back to idle
		if (idle) {
			this.mario.setCurrentAnimation("idle");
			this.mario2.setCurrentAnimation("idle");
		}

		this.mario.collidesWith(this.mario2);
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