"use strict";

var USER_INTERFACE_VARS = {
	ALPHA: 0.0,
	INTERFACE_FILE: "biomancer/ui/main.png",
	DIALOG_CLOSE: 81, // Q
	ANIMAL_CONTAINER_FILE: "biomancer/ui/ui-animal-container.png"
}
let _userinterfaceInstance = null;

class UserInterface extends DisplayObjectContainer {
	constructor(ctx) {
		if(!_userinterfaceInstance) {
			super('user-interface', USER_INTERFACE_VARS.INTERFACE_FILE);
			_userinterfaceInstance = this;			
			this.alpha = USER_INTERFACE_VARS.ALPHA;
			this.canvasCTX = ctx;			
			this.animalContainer = new UIAnimalDisplay();
			this.addChild(this.animalContainer);
			this.dialogShown = false;
			this.dialog = undefined;
		}

		return _userinterfaceInstance;
	}	

	update(pressedKeys) {
		if(pressedKeys.contains(USER_INTERFACE_VARS.DIALOG_CLOSE)) {
			if(this.dialog && this.dialog.finished) {
				this.removeChild(this.dialog);
				this.dialog = undefined;
			}
		}
	}

	showDialog(message, options) {
		if(!this.dialogShown) {
			this.dialog = new DialogContainer(message, options, this.canvasCTX)
			this.addChild(this.dialog);
		}
	}
}

var UI_ANIMAL_VARS = {
	XPOS: 0,
	YPOS: 0,
	ALPHA: 0.5
}

class UIAnimalDisplay extends DisplayObjectContainer {
	constructor() {
		super('user-interface-animal-container', USER_INTERFACE_VARS.ANIMAL_CONTAINER_FILE)
		this.currentAnimal = undefined;
		this.availableAnimals = [];
		this.alpha = UI_ANIMAL_VARS.ALPHA;
		this.setPosition = {x: UI_ANIMAL_VARS.XPOS, y: UI_ANIMAL_VARS.YPOS};
	}

	addAnimal(name, imageFile) {
		this.availableAnimals.push(name);
		this.addChild("ui-animal-"+name, imageFile);
		if(this.currentAnimal === undefined) { this.currentAnimal = name; }
	}

	removeAnimal(name) {
		this.availableAnimals = this.availableAnimals.filter(x => x !== name);
		this.removeChildById("ui-animal-"+name);
		if(this.currentAnimal === name) { this.currentAnimal = undefined; }
	}

	setCurrentAnimal(name) {
		this.currentAnimal = name;
	}


}