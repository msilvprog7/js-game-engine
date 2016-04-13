"use strict";


var DIALOGUE_SCRIPT_VARS = {
	count: 0,
	FILENAME: "biomancer/misc/dialogue.png",
	PIVOT: {x: 25, y: 25},
	DIMENSIONS: {width: 50, height: 50},
	ADD_DEFAULTS: {
		parentIsLevel: true,
		indexReferenceEntity: undefined, //Leave undefined for before focus child, or if no child exists appending to end
		indexReferencePlacing: true, //True or undefined is before, false is after
		monitorHealth: false //True only if monitor health from start
	},
};


class DialogueScript extends ScriptObject {
	
	constructor(id, text) {

		super(id);

		// Set text
		this.text = this.filter(text);
		this.setScript(this.show);
	}

	/** 
	 * Change from one string representation to string
	 */
	filter(text) {
		return text.replace(/---/g, " ");
	}

	show() {
		this.UserInterface.showDialog(this.text);
		this.activated = true;
	}

	/**
	  * Generate Dialogue
	 */
	static generateDialogue(text, cols, rows) {
		var DialogueImage = DIALOGUE_SCRIPT_VARS.FILENAME,
			generatedDialogue = new DialogueScript("Dialogue-" + DIALOGUE_SCRIPT_VARS.count, text),
			currentDialogueId = 0,
			width = DIALOGUE_SCRIPT_VARS.DIMENSIONS.width,
			height = DIALOGUE_SCRIPT_VARS.DIMENSIONS.height;

		// Layout walls
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				var currentDialogue = new Sprite("Dialogue" + "-" + DIALOGUE_SCRIPT_VARS.count + "-" + currentDialogueId, DialogueImage);
				currentDialogue.setPosition({x: j * width, y: i * height});
				currentDialogue.setPivotPoint({x: width / 2, y: height / 2});
				currentDialogue.hitbox.setHitboxFromImage(DIALOGUE_SCRIPT_VARS.DIMENSIONS);
				generatedDialogue.addChild(currentDialogue);
				currentDialogueId++;
			}
		}

		// Central pivot point on the display object container
		generatedDialogue.setPivotPoint({x: cols * width / 2, y: rows * height / 2});

		// Set hitbox
		generatedDialogue.hitbox.setHitboxFromImage({width: cols * width, height: rows * height});

		// Increment count
		DIALOGUE_SCRIPT_VARS.count++;

		return generatedDialogue;
	}

}