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

		this.UI = new UserInterface(canvas.getContext('2d'));
		this.addChild(this.UI);
	}

	update(pressedKeys, timedelta){		
		super.update(pressedKeys, timedelta);

		// Update the tween juggler
		this.TJ.update(timedelta);

		if(pressedKeys.contains(49) && this.UI.dialog === undefined) {
			let options = {wordTime: 100, pauseOnPeriods: true}
			this.UI.showDialog("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", options)
		}
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
