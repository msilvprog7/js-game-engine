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
		super.initializeLevels();

		// Create levels
		var currentLevel, currentBiomancer, currentEnemy;

		// Level 1
		currentLevel = new Level("level" + this.currentLevelId);
		currentLevel.addChild(currentLevel.generateTileRect(8, 4, {x: 100, y: 100})); // Tiles first!

		// ... Biomancer
		currentBiomancer = this.generateBiomancer(440, 211, currentLevel);
		currentLevel.setFocusChildAndMonitorHealth(currentBiomancer);
		currentLevel.addFriendly(currentBiomancer);

		// ... Enemies
		currentEnemy = this.generateBasicEnemy(740, 110, currentLevel);
		currentLevel.addEnemy(currentEnemy);

		// ... Add level
		this.addLevel(currentLevel);

		// ... More levels later
	}

	generateBiomancer(x, y, level) {
		var biomancer = new Biomancer();
		biomancer.setParent(level);
		biomancer.setPosition({x: x, y: y});
		biomancer.setPivotPoint(BIOMANCER_VARS.PIVOT);
		biomancer.hitbox.setHitboxFromImage(BIOMANCER_VARS.DIMENSIONS);
		return biomancer;
	}

	generateBasicEnemy(x, y, level) {
		var enemy = new BasicEnemy();
		enemy.setParent(level);
		enemy.setPosition({x: x, y: y});
		enemy.setPivotPoint(BASIC_ENEMY_VARS.SPAWN_IDLE_PIVOT);
		enemy.hitbox.setHitboxFromImage(BASIC_ENEMY_VARS.SPAWN_DIMENSIONS);
		return enemy;
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
