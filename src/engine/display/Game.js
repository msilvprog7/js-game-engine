"use strict";

/**
 * Main class. Instantiate or extend Game to create a new game of your own
 */
class Game extends DisplayObjectContainer{
	
	constructor(gameId, width, height, canvas){
		super(gameId, undefined);
		Game.instance = this;

		this.gameId = gameId;
		this.width = width;
		this.height = height;
		this.canvas = canvas;
		this.g = canvas.getContext('2d'); //the graphics object
		this.playing = false;
		this.gameClock = new GameClock();

		this.pressedKeys = new ArrayList();

		// Create Levels
		this.initializeLevels();

		/* Setup a key listener */
		window.addEventListener("keydown", onKeyDown, true);
		window.addEventListener("keyup", onKeyUp, true);
	}

	static getInstance(){ 
		return Game.instance; 
	}

	update(pressedKeys, timedelta){ 
		super.update(pressedKeys);

		// Center on level's focus child
		var focusChild = this.getCurrentLevel().getFocusChild();
		if (focusChild !== undefined) {
			this.centerOn({x: focusChild.position.x + focusChild.pivotPoint.x, y: focusChild.position.y + focusChild.pivotPoint.y});
		}
	}

	draw(g){ 
		super.draw(g); 
	}

	centerOn(point) {
		this.setPosition({x: (this.width / 2) - point.x, y: (this.height / 2) - point.y});
	}

	initializeLevels() {
		// Nothing in Game itself, but in extension
		this.levels = {};
		this.levelsList = [];
		this.currentLevel = -1;
		this.currentLevelId = 0;
		this.removeChildren();
	}

	addLevel(level) {
		this.levels[level.id] = level;
		this.levelsList.push(level.id);
		this.currentLevelId++;

		// Set current level to first
		if (this.currentLevel === -1) {
			this.setCurrentLevelIndex(0);
		}
	}

	setCurrentLevelIndex(index) {
		this.currentLevel = index;
		this.removeChildren();
		this.addChild(this.getCurrentLevel());
	}

	getCurrentLevelIndex() {
		return this.currentLevel;
	}

	getCurrentLevel() {
		return this.levels[this.levelsList[this.currentLevel]];
	}

	getLevelsList() {
		return this.levelsList;
	}

	getLevels() {
		return this.levels;
	}

	nextFrame(){
		game.update(this.pressedKeys, this.gameClock.getTimedelta());
		game.draw(this.g);
		if(this.playing) window.requestAnimationFrame(tick);
	}

	start(){
		this.playing = true;
		window.requestAnimationFrame(tick); //Notice that tick() MUST be defined somewhere! See LabOneGame.js for an example
	}

	pause(){
		this.playing = false;
	}


	/**
	 * For dealing with keyCodes
	 */
	addKey(keyCode){
		// console.log("Key Code: " + keyCode); //for your convenience, you can see what the keyCode you care about is
		if(this.pressedKeys.indexOf(keyCode) == -1) this.pressedKeys.push(keyCode);
	}

	removeKey(keyCode){ 
		this.pressedKeys.remove(keyCode); 
	}
}

function onKeyDown(e){ Game.getInstance().addKey(e.keyCode); }
function onKeyUp(e){ Game.getInstance().removeKey(e.keyCode); }