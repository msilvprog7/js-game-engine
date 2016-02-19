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
		this.addChild(this.mario);
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
		}

		this.mario.update(pressedKeys);
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