"use strict";

var MASTERBIOMANCERGAME_VARS = {
	BACKGROUND_COLOR: "#000000"
};

/**
 * Main class. Instantiate or extend Game to create a new game of your own
 */
class MasterBiomancerGame extends Game{

	constructor(canvas){
		super("Master Biomancer Game", 1000, 563, canvas);
		// Background color
		canvas.style.setProperty("background-color", MASTERBIOMANCERGAME_VARS.BACKGROUND_COLOR);

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

	initializeLevels() {
		super.initializeLevels(CLASS_REFERENCES);

		// Add levels
		LEVEL_LIST.forEach(l => this.addLevel(l.id, l.level));

		// Load
		this.reloadLevel();
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
	var game = new MasterBiomancerGame(drawingCanvas);
	game.start();
}
