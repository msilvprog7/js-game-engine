"use strict";

var LEVEL_LIST = [
		LEVEL1,
		LEVEL2,
		LEVEL3,
		LEVEL4
	],

	addToLevel = function (level, obj, options) { level.addEntityToLevel(obj, options); },
	addWallToLevel = function (level, obj, options) { level.addWall(obj); },

	CLASS_REFERENCES = {
		"Biomancer": {
			constructor: function () { return new Biomancer(); },
			addToLevel: addToLevel,
			generate: undefined,
			generateParams: -1,
			generateParamsEditorOption: undefined,
			options: BIOMANCER_VARS.ADD_DEFAULTS,
			pivot: BIOMANCER_VARS.PIVOT,
			dimensions: BIOMANCER_VARS.DIMENSIONS,
			type: "Characters",
			resource: "resources/images/biomancer/main-char/biomancer.png"
		},

		/* Enemies */
		"BasicEnemy": {
			constructor: function () { return new BasicEnemy(); },
			addToLevel: addToLevel,
			generate: undefined,
			generateParams: -1,
			generateParamsEditorOption: undefined,
			options: ENEMY_VARS.ADD_DEFAULTS,
			pivot: BASIC_ENEMY_VARS.SPAWN_IDLE_PIVOT,
			dimensions: BASIC_ENEMY_VARS.SPAWN_DIMENSIONS,
			type: "Enemies",
			resource: "resources/images/biomancer/enemies/basic-enemy/basic-enemy.png"
		},
		"Hotbot": {
			constructor: function () { return new Hotbot(); },
			addToLevel: addToLevel,
			generate: undefined,
			generateParams: -1,
			generateParamsEditorOption: undefined,
			options: ENEMY_VARS.ADD_DEFAULTS,
			pivot: HOTBOT_VARS.SPAWN_IDLE_PIVOT,
			dimensions: HOTBOT_VARS.SPAWN_DIMENSIONS,
			type: "Enemies",
			resource: "resources/images/biomancer/enemies/hotbot/hotbot-normal.png"
		},
		"SuperSentry": {
			constructor: function () { return new SuperSentry(); },
			addToLevel: addToLevel,
			generate: undefined,
			generateParams: -1,
			generateParamsEditorOption: undefined,
			options: ENEMY_VARS.ADD_DEFAULTS,
			pivot: SUPER_SENTRY_VARS.SPAWN_IDLE_PIVOT,
			dimensions: SUPER_SENTRY_VARS.SPAWN_DIMENSIONS,
			type: "Enemies",
			resource: "resources/images/biomancer/enemies/super-sentry/super-sentry.png"
		},
		"ElementalSentry": {
			constructor: function () { return new ElementalSentry(); },
			addToLevel: addToLevel,
			generate: undefined,
			generateParams: -1,
			generateParamsEditorOption: undefined,
			options: ENEMY_VARS.ADD_DEFAULTS,
			pivot: ELEMENTAL_SENTRY_VARS.SPAWN_IDLE_PIVOT,
			dimensions: ELEMENTAL_SENTRY_VARS.SPAWN_DIMENSIONS,
			type: "Enemies",
			resource: "resources/images/biomancer/enemies/elemental-sentry/elemental-sentry-fire.png"
		},
		"Exit": {
			constructor: function () { return new Exit(); },
			addToLevel: addToLevel,
			generate: undefined,
			generateParams: -1,
			generateParamsEditorOption: undefined,
			options: EXIT_VARS.ADD_DEFAULTS,
			pivot: EXIT_VARS.IDLE_PIVOT,
			dimensions: EXIT_VARS.DIMENSIONS,
			type: "Obstacles",
			resource: "resources/images/biomancer/misc/exit.png"
		},
		"KeyScript": {
			constructor: function () { return new KeyScript(); },
			addToLevel: addToLevel,
			generate: undefined,
			generateParams: -1,
			generateParamsEditorOption: undefined,
			options: KEY_SCRIPT_VARS.ADD_DEFAULTS,
			pivot: KEY_SCRIPT_VARS.IDLE_PIVOT,
			dimensions: KEY_SCRIPT_VARS.DIMENSIONS,
			type: "Scripts",
			resource: "resources/images/biomancer/misc/key.png"
		},

		/* Obstacles */
		"Rock": {
			constructor: function () { return new Rock(); },
			addToLevel: addToLevel,
			generate: undefined,
			generateParams: -1,
			generateParamsEditorOption: undefined,
			options: ROCK_VARS.ADD_DEFAULTS,
			pivot: ROCK_VARS.IDLE_PIVOT,
			dimensions: ROCK_VARS.DIMENSIONS,
			type: "Obstacles",
			resource: "resources/images/biomancer/misc/rock.png"
		},

		/* Dialogue */
		"DialogueScript": {
			constructor: undefined,
			addToLevel: addToLevel,
			generate: function (text, cols, rows) { return DialogueScript.generateDialogue(text, cols, rows); },
			generateParams: 3,
			generateParamsEditorOption: ["Get-Text", "Exceed-Width", "Exceed-Height"],
			options: DIALOGUE_SCRIPT_VARS.ADD_DEFAULTS,
			pivot: undefined,
			dimensions: undefined,
			type: "Scripts",
			resource: "resources/images/biomancer/misc/dialogue.png",
			exceedWidth: 50,
			exceedHeight: 50
		},

		/* Floors */
		"Tiles0": {
			constructor: undefined,
			addToLevel: addToLevel,
			generate: function (cols, rows) { return Level.generateTileRect("tile-0", cols, rows); },
			generateParams: 2,
			generateParamsEditorOption: ["Exceed-Width", "Exceed-Height"],
			options: LEVEL_VARS.TILE_ADD_DEFAULTS,
			pivot: undefined,
			dimensions: undefined,
			type: "Floors",
			resource: "resources/images/biomancer/levels/tiles/tile_0_400x400.png",
			exceedWidth: 400,
			exceedHeight: 400
		},

		/* Walls */
		"Wall0": {
			constructor: undefined,
			addToLevel: addWallToLevel,
			generate: function () { return WallGroup.generateWall("wall-0", 1, 1); },
			generateParams: 0,
			generateParamsEditorOption: [],
			options: undefined,
			pivot: undefined,
			dimensions: undefined,
			type: "Walls",
			resource: "resources/images/biomancer/levels/tiles/wall_0_50x50.png"
		},
		"Wall0-Wide": {
			constructor: undefined,
			addToLevel: addWallToLevel,
			generate: function (cols) { return WallGroup.generateWall("wall-0-wide", cols, 1); },
			generateParams: 1,
			generateParamsEditorOption: ["Exceed-Width"],
			options: undefined,
			pivot: undefined,
			dimensions: undefined,
			type: "Walls",
			resource: "resources/images/biomancer/levels/tiles/wall_0_400x50.png",
			exceedWidth: 400
		},
		"Wall0-Tall": {
			constructor: undefined,
			addToLevel: addWallToLevel,
			generate: function (rows) { return WallGroup.generateWall("wall-0-tall", 1, rows); },
			generateParams: 1,
			generateParamsEditorOption: ["Exceed-Height"],
			options: undefined,
			pivot: undefined,
			dimensions: undefined,
			type: "Walls",
			resource: "resources/images/biomancer/levels/tiles/wall_0_50x400.png",
			exceedHeight: 400
		}
	};