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

		this.SM.loadMusic("background-normal", "biomancer/background/background-normal.wav", true);
		this.SM.loadMusic("background-nervous", "biomancer/background/background-nervous.wav", true);
		this.SM.playMusic("background-normal");
		// Tween Juggler
		this.TJ = new TweenJuggler();

		this.UI = new UserInterface();
		this.addChild(this.UI);
		this.nextMusicFade = new Date().getTime();

		// this.menus = {main: new Menu('main')};
		this.initializeMenus();
		this.showMenu('main');
	}

	update(pressedKeys, timedelta){		
		super.update(pressedKeys, timedelta);

		// Update the tween juggler
		this.TJ.update(timedelta);
		if (pressedKeys.contains(27)) {
			this.showMenu('main');
		}
	}

	draw(g){
		g.clearRect(0, 0, this.width, this.height);
		super.draw(g);
	}

	initializeLevels() {
		super.initializeLevels(CLASS_REFERENCES);

		// Add levels
		LEVEL_LIST.forEach(l => this.addLevel(l));

		// Load
		//this.nextLevel();
		this.reloadLevel();
	}

	initializeMenus() {
		// main menu
		var mainMenu = new Menu('main', this),
			opt1 = new MenuOption('opt1', 'Start Game', function (game) {
				game.setCurrentLevel(0);
			}),
			opt2 = new MenuOption('opt2', 'Select Level', function (game) {
				game.showMenu('selectLevel');
			});

		opt1.setPosition({y:300, x:200});
		opt2.setPosition({y:350, x: 200})
		mainMenu.addOption(opt1);
		mainMenu.addOption(opt2);
		mainMenu.setFontSize(30);
		mainMenu.setFont('Montserrat');


		var text = new TextDO('title', 'Master Biomancer', '50px Montserrat');
		text.setPosition({x:200, y: 150});
		mainMenu.addChild(text);

		//Level select menu
		var levelMenu = new Menu('selectLevel', this),
			levels = this.getLevelsList();

		for (let i=0; i < levels.length; i++) {
			var level = levels[i],
				title = level.split('-').join(' '),
				opt = new MenuOption('level' + i, title, function (game) {
					game.setCurrentLevel(i);
				});

			opt.setPosition({x:200, y: 150 + i*50});
			levelMenu.addOption(opt);
		}
		var lmBack = new MenuOption('lm-back', 'Back', function (game) {
			game.showMenu('main');
		});
		lmBack.setPosition({x:200, y:500});

		levelMenu.addOption(lmBack);


		this.menus = {
			'main': mainMenu,
			'selectLevel': levelMenu
		};
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
