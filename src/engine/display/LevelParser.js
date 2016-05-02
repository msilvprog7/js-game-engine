"use strict";


class LevelParser {
	
	constructor(classReferences) {
		this.classReferences = classReferences;
		this.levels = {};
	}

	store(id, str, tl, br) {
		// Create if necessary
		if (this.levels[id] === undefined || this.levels[id] === null) {
			this.levels[id] = {};
		}

		// Set content and loaded
		this.levels[id].level = str;
		this.levels[id].loaded = true;
		this.levels[id].tl = tl;
		this.levels[id].br = br;
	}

	get(id, game) {
		var levelObj = this.levels[id];

		if (levelObj === undefined || levelObj === null) {
			console.error("Level with id[" + id + "] not stored in LevelParser");
			return null;
		}

		if (levelObj.loaded === false) {
			console.error("Level with id[" + id + "] has not yet been loaded by the LevelParser");
			return null;
		}

		if (levelObj.level === undefined || levelObj.level === null) {
			console.error("Level with id[" + id + "] mysteriously lacks a level representation loaded in it LevelParser");
			return null;
		}

		return this.parse(id, levelObj, game);
	}

	parse(id, levelObj, game) {
		var level = new Level(id, game);
		level.setCorners([levelObj.tl, levelObj.br]);
		return this.parseLevel(levelObj.level, level);
	}

	parseLevel(str, level) {
		var items = str.split("|");

		// Item by item through level definition
		for (let i = 0; i < items.length; i++) {
			// Parse each item defined
			var words = items[i].match(/[\w-.!?]+/g);

			// Empty line
			if (words === undefined || words === null || words.length === 0) {
				continue;
			}

			// Check type with class references (e.g. Biomancer)
			var type = words[0],
				reference = this.classReferences[type];
			
			if (reference === undefined  || reference.addToLevel === undefined || reference.addToLevel === null) {
				console.error("Type[" + type + "] not properly defined in Class References (project/levels/LevelList.js), must have 'addToLevel'");
				continue;
			}

			// Create object
			var obj,
				wordIndex = 1;

			// Generate or create
			if (reference.generate !== undefined && typeof(reference.generate) === "function" && 
				reference.generateParams >= 0 && wordIndex + reference.generateParams <= words.length) {
				// Generate
				obj = reference.generate(...words.slice(wordIndex, wordIndex + reference.generateParams));
				wordIndex += reference.generateParams;
			} else if (reference.constructor !== undefined && typeof(reference.constructor) === 'function') {
				// Construct
				obj = reference.constructor();
			} else {
				console.error("Parsing level item[" + i + "] of Type[" + type + "] not properly defined in Class References (project/levels/LevelList.js), " + 
							  "must have 'constructor' or 'generate' with number of 'generateParams'");
				continue;
			}

			// Set parent to level
			obj.setParent(level);

			// Parse properties on object
			for (; wordIndex < words.length; wordIndex++) {
				// Properties
				switch (words[wordIndex].toLowerCase()) {
					case "loc":
					case "location":
					case "pos":
					case "position":
						// Conditions not met
						if (wordIndex + 2 >= words.length || isNaN(parseFloat(words[wordIndex + 1])) || isNaN(parseFloat(words[wordIndex + 1]))) {
							console.error("Parsing level item[" + i + "] word[" + wordIndex + "] - position x y  - without proper formatting");
							continue;
						}

						// Set position
						obj.setPosition({x: parseFloat(words[wordIndex + 1]), y: parseFloat(words[wordIndex + 2])});

						// Skip params
						wordIndex += 2;
						break;
					case "scale":
						// Conditions not met
						if (wordIndex + 1 >= words.length || isNaN(parseFloat(words[wordIndex + 1]))) {
							console.error("Parsing level item[" + i + "] word[" + wordIndex + "] - scale amount  - without proper formatting");
							continue;
						}

						// Set scale
						console.log("set scale " + parseFloat(words[wordIndex + 1]));
						obj.setScale(parseFloat(words[wordIndex + 1]));

						// Skip params
						wordIndex += 1;
						break;
					case "scale_x":
					case "scalex":
						// Conditions not met
						if (wordIndex + 1 >= words.length || isNaN(parseFloat(words[wordIndex + 1]))) {
							console.error("Parsing level item[" + i + "] word[" + wordIndex + "] - scalex amount  - without proper formatting");
							continue;
						}

						// Set scale
						obj.setScaleX(parseFloat(words[wordIndex + 1]));

						// Skip params
						wordIndex += 1;
						break;
					case "scale_y":
					case "scaley":
						// Conditions not met
						if (wordIndex + 1 >= words.length || isNaN(parseFloat(words[wordIndex + 1]))) {
							console.error("Parsing level item[" + i + "] word[" + wordIndex + "] - scaley amount  - without proper formatting");
							continue;
						}

						// Set scale
						obj.setScaleY(parseFloat(words[wordIndex + 1]));

						// Skip params
						wordIndex += 1;
						break;
				}
			}

			// Default properties
			if (reference.pivot !== undefined) {
				obj.setPivotPoint(reference.pivot);
			}

			if (reference.dimensions !== undefined) {
				obj.hitbox.setHitboxFromImage(reference.dimensions);
			}

			// Id - parsed instruction
			obj.id = items[i] + "|";

			// Add object to level
			reference.addToLevel(level, obj, reference.options);
		}
		
		return level;
	}

	loadFile(id, filename) {
		var req = new XMLHttpRequest(),
			that = this;

		// Store initial object
		this.levels[id] = {loaded: false, level: null};

		req.open("GET", filename);
		req.onreadystatechange = function () {
			// Store content
			that.store(id, req.responseText);
		};
		req.send();
	}

}