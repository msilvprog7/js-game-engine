"use strict";

/**
 * Main class. Instantiate or extend Game to create a new game of your own
 */
class LabTwoGame extends Game{
	
	constructor(canvas){
		super("Lab Two Game", 500, 300, canvas);
		this.mario = new Sprite("Mario", "Mario.png");
		this.mario.setPosition({x: 0.0, y: 0.0});
		this.mario.setPivotPoint({x: 64, y: 64});
		this.mario.setScaleX(0.5);
		this.mario.setScaleY(0.5);
		this.mario.setVisible(false);

		this.mario2 = new Sprite("Mario2", "Mario.png");
		this.mario2.setPosition({x: 250.0, y: 0.0});
		this.mario2.setPivotPoint({x: 64, y: 64});
		this.mario2.setRotation(Math.PI / 6);
		this.mario2.setScaleX(1.5);
		this.mario2.setScaleY(1.5);
		this.mario2.setAlpha(0.5);

		this.mario3 = new AnimatedSprite("Mario3", "Mario_Idle.png");
		this.mario3.addAnimation("run", {images: ["Mario_Run_0.png", "Mario_Run_1.png", "Mario_Idle.png", "Mario_Run_1.png"], loop: true});
		this.mario3.addAnimation("jump", {images: ["Mario_Jump_0.png", "Mario_Jump_1.png"], loop: false});
		this.mario3.setPosition({x: 0, y: 0});
		this.mario3.setSpeed(4.0);
	}

	update(pressedKeys){
		super.update(pressedKeys);
		this.mario.update(pressedKeys);
		this.mario2.update(pressedKeys);

		this.mario.setRotation(this.mario.getRotation() + Math.PI / 32);
		this.mario2.setRotation(this.mario2.getRotation() + Math.PI / 64);

		// V for invisible
		this.mario.setVisible(!pressedKeys.contains(86));
		var idle = true;

		// P for pause animation
		this.mario3.setPaused(pressedKeys.contains(80));

		if (pressedKeys.contains(39)) {
			this.mario3.setScaleX(1);
			this.mario3.setPosition({x: this.mario3.getPosition().x + 8 / (this.mario3.getSpeed()), y: this.mario3.getPosition().y});
			this.mario3.setCurrentAnimation("run");
			idle = false;
		}

		if (pressedKeys.contains(37)) {
			this.mario3.setScaleX(-1);
			this.mario3.setPosition({x: this.mario3.getPosition().x - 8 / (this.mario3.getSpeed()), y: this.mario3.getPosition().y});
			this.mario3.setCurrentAnimation("run");
			idle = false;
		}

		if (pressedKeys.contains(38)) {
			this.mario3.setPosition({x: this.mario3.getPosition().x, y: this.mario3.getPosition().y - 4 / (this.mario3.getSpeed())});
			this.mario3.setCurrentAnimation("jump");
			idle = false;
		}

		if (idle) {
			this.mario3.setCurrentAnimation("idle");
		}

		this.mario3.update(pressedKeys);
	}

	draw(g){
		g.clearRect(0, 0, this.width, this.height);
		super.draw(g);

		this.mario.draw(g);

		this.mario2.draw(g);

		this.mario3.draw(g);
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
	var game = new LabTwoGame(drawingCanvas);
	game.start();
}