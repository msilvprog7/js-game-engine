"use strict";

/**
 * Main class. Instantiate or extend Game to create a new game of your own
 */
class LabOneGame extends Game{
	
	constructor(canvas){
		super("Lab One Game", 500, 300, canvas);
		this.mario = new Sprite("Mario", "Mario.png");
		this.xPos = 0.0;
		this.yPos = 0.0;
	}

	update(pressedKeys){
		super.update(pressedKeys);
		this.mario.update(pressedKeys);

		// Update mario's position
		// Left
		if (pressedKeys.contains(37)) {
			this.xPos--;
		}

		// Up
		if (pressedKeys.contains(38)) {
			this.yPos--;
		}

		// Right
		if (pressedKeys.contains(39)) {
			this.xPos++;
		}

		// Down
		if (pressedKeys.contains(40)) {
			this.yPos++;
		}
	}

	draw(g){
		g.clearRect(0, 0, this.width, this.height);
		super.draw(g);

		// Translate for mario's movement
		g.translate(this.xPos, this.yPos);

		this.mario.draw(g);

		// Undo translation
		g.translate(-this.xPos, -this.yPos);
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
	var game = new LabOneGame(drawingCanvas);
	game.start();
}