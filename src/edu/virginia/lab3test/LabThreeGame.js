"use strict";

/**
 * Main class. Instantiate or extend Game to create a new game of your own
 */
class LabThreeGame extends Game{
	
	constructor(canvas){
		super("Lab Three Game", 500, 300, canvas);

		this.mario = new AnimatedSprite("Mario", "Mario_Idle.png");
		this.mario.addAnimation("run", {images: ["Mario_Run_0.png", "Mario_Run_1.png", "Mario_Idle.png", "Mario_Run_1.png"], loop: true});
		this.mario.addAnimation("jump", {images: ["Mario_Jump_0.png", "Mario_Jump_1.png"], loop: false});
		this.mario.setPosition({x: 100, y: 100});
		this.mario.setSpeed(4.0);

		// Child mario
		this.babyMario = new Sprite("BabyMario", "Mario_Idle.png");
		this.babyMario.setPosition({x: 40, y: -20});
		this.babyMario.setPivotPoint({x: 64, y: 64});
		this.babyMario.setScaleX(0.25);
		this.babyMario.setScaleY(0.25);
		this.mario.addChild(this.babyMario);

		this.addChild(this.mario);
	}

	update(pressedKeys){
		super.update(pressedKeys);

		var idle = true;

		// P for pause animation
		this.mario.setPaused(pressedKeys.contains(80));

		// V for invisible mario (not baby mario)
		this.mario.setVisible(!pressedKeys.contains(86));

		// Right arrow key
		if (pressedKeys.contains(39)) {
			if(this.mario.getScaleX() < 0) { this.mario.setScaleX(-1 * this.mario.getScaleX()); }		
			this.mario.setPosition({x: this.mario.getPosition().x + 8 / (this.mario.getSpeed()), y: this.mario.getPosition().y});
			this.mario.setCurrentAnimation("run");
			this.babyMario.setRotation(this.babyMario.getRotation() + Math.PI / 64);
			idle = false;
		}

		// Left arrow key
		var pressedLeft = false;
		if (pressedKeys.contains(37)) {
			if(this.mario.getScaleX() >= 0) { this.mario.setScaleX(-1 * this.mario.getScaleX()); }			
			this.mario.setPosition({x: this.mario.getPosition().x - 8 / (this.mario.getSpeed()), y: this.mario.getPosition().y});
			this.mario.setCurrentAnimation("run");
			this.babyMario.setRotation(this.babyMario.getRotation() - Math.PI / 64);
			idle = false;
		}

		// Up arrow key
		if (pressedKeys.contains(38)) {
			this.mario.setPosition({x: this.mario.getPosition().x, y: this.mario.getPosition().y - 4 / (this.mario.getSpeed())});
			this.mario.setCurrentAnimation("jump");
			idle = false;
		}

		// 1 key
		if (pressedKeys.contains(49)) {
			this.mario.setScaleX(this.mario.getScaleX() + 0.01);
			this.mario.setScaleY(this.mario.getScaleY() + 0.01 * this.mario.getAspectRatio());
		}

		// 2 key
		if (pressedKeys.contains(50)) {
			this.mario.setScaleX(this.mario.getScaleX() - 0.01);
			this.mario.setScaleY(this.mario.getScaleY() - 0.01 * this.mario.getAspectRatio());
		}

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
	var game = new LabThreeGame(drawingCanvas);
	game.start();
}