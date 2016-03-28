"use strict";

// Paste levels here for parsing
var LEVEL_LIST = [
		LEVEL1
	],

	addToLevel = function (level, obj, options) { level.addEntityToLevel(obj, options); },

	CLASS_REFERENCES = {
		"Biomancer": {
			constructor: function () { return new Biomancer(); },
			addToLevel: addToLevel,
			options: BIOMANCER_VARS.ADD_DEFAULTS,
			pivot: BIOMANCER_VARS.PIVOT,
			dimensions: BIOMANCER_VARS.DIMENSIONS
		},

		/* Enemies */
		"BasicEnemy": {
			constructor: function () { return new BasicEnemy(); },
			addToLevel: addToLevel,
			options: ENEMY_VARS.ADD_DEFAULTS,
			pivot: BASIC_ENEMY_VARS.SPAWN_IDLE_PIVOT,
			dimensions: BASIC_ENEMY_VARS.SPAWN_DIMENSIONS
		},

		/* Floors */
	};