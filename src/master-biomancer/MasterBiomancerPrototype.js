"use strict";

/**
 * Main class. Instantiate or extend Game to create a new game of your own
 */

class MasterBiomancerGame extends Game{

	constructor(canvas){
		super("Master Biomancer Game", 1000, 800, canvas);
		// Sound Manager
		this.SM = new SoundManager();

		// Tween Juggler
		this.TJ = new TweenJuggler();
		
		

	}

	update(pressedKeys, timedelta){		
		super.update(pressedKeys, timedelta);

		// Update the tween juggler
		this.TJ.update(timedelta);

		
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
