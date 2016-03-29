"use strict";

var USER_INTERFACE_VARS = {
	ALPHA: 0.7,
	INTERFACE_FILE: "biomancer/ui/main.png",
	DIALOG_CLOSE: 81 // Q
}
let _userinterfaceInstance = null;

class UserInterface extends DisplayObjectContainer {
	constructor(ctx) {
		if(!_userinterfaceInstance) {
			super('user-interface', USER_INTERFACE_VARS.INTERFACE_FILE);
			_userinterfaceInstance = this;			
			this.alpha = USER_INTERFACE_VARS.ALPHA;
			this.canvasCTX = ctx;
			this.currentAnimal = undefined;
			this.availableAnimals = [];
			this.dialogShown = false;
			this.dialog = undefined;
		}

		return _userinterfaceInstance;
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