"use strict";

var LEVEL_LIST = [
		LEVEL1
	],

	addToLevel = function (level, obj, options) { level.addEntityToLevel(obj, options); },
	addWallToLevel = function (level, obj, options) { level.addWall(obj); },

	CLASS_REFERENCES = {
		"Biomancer": {
			constructor: function () { return new Biomancer(); },
			addToLevel: addToLevel,
			generate: undefined,
			generateParams: -1,
			options: BIOMANCER_VARS.ADD_DEFAULTS,
			pivot: BIOMANCER_VARS.PIVOT,
			dimensions: BIOMANCER_VARS.DIMENSIONS
		},

		/* Enemies */
		"BasicEnemy": {
			constructor: function () { return new BasicEnemy(); },
			addToLevel: addToLevel,
			generate: undefined,
			generateParams: -1,
			options: ENEMY_VARS.ADD_DEFAULTS,
			pivot: BASIC_ENEMY_VARS.SPAWN_IDLE_PIVOT,
			dimensions: BASIC_ENEMY_VARS.SPAWN_DIMENSIONS
		},

		/* Floors */
		"Tiles0": {
			constructor: undefined,
			addToLevel: addToLevel,
			generate: function (cols, rows) { return Level.generateTileRect("tile-0", cols, rows); },
			generateParams: 2,
			options: LEVEL_VARS.TILE_ADD_DEFAULTS,
			pivot: undefined,
			dimensions: undefined
		},

		/* Walls */
		"Wall0": {
			constructor: undefined,
			addToLevel: addWallToLevel,
			generate: function () { return WallGroup.generateWall("wall-0", 1, 1); },
			generateParams: 0,
			options: undefined,
			pivot: undefined,
			dimensions: undefined
		},
		"Wall0-Wide": {
			constructor: undefined,
			addToLevel: addWallToLevel,
			generate: function (cols) { return WallGroup.generateWall("wall-0-wide", cols, 1); },
			generateParams: 1,
			options: undefined,
			pivot: undefined,
			dimensions: undefined
		},
		"Wall0-Tall": {
			constructor: undefined,
			addToLevel: addWallToLevel,
			generate: function (rows) { return WallGroup.generateWall("wall-0-tall", 1, rows); },
			generateParams: 1,
			options: undefined,
			pivot: undefined,
			dimensions: undefined
		}
	};