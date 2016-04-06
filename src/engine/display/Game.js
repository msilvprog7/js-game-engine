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
		this.UI.setPosition({x: point.x - (this.width / 2), y: point.y - (this.height / 2)});
	}

	initializeLevels(classReferences) {
		// Nothing in Game itself, but in extension
		this.levelsList = [];
		this.currentLevel = undefined;
		this.currentLevelIndex = -1;
		this.removeChildren();
		this.levelParser = new LevelParser(classReferences);
	}

	addLevel(levelId, levelStr) {
		this.levelParser.store(levelId, levelStr);
		this.levelsList.push(levelId);

		// Set current level to first
		if (this.levelsList.length === 1) {
			this.currentLevelIndex = 0;
		}
	}

	reloadLevel() {
		this.removeChildren();
		this.addChild(this.createCurrentLevel());
		this.addChild(new UserInterface());
	}

	nextLevel() {
		// Returns whether or not the levels list have been iterated through once
		this.currentLevelIndex++;
		if (this.currentLevelIndex >= this.levelsList.length) {
			this.currentLevelIndex = 0;
			this.removeChildren();
			return true;
		}

		this.reloadLevel();
		return false;
	}

	getCurrentLevel() {
		return this.currentLevel;
	}

	getCurrentLevelIndex() {
		return this.currentLevelIndex;
	}

	createCurrentLevel() {
		this.currentLevel = this.levelParser.get(this.levelsList[this.currentLevelIndex], this);
		return this.currentLevel;
	}

	getLevelsList() {
		return this.levelsList;
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