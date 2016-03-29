"use strict";

var USER_INTERFACE_VARS = {
	ALPHA: 0.7,
	DIALOG_FILE: "user-interface/dialog.png"
}
let _userinterfaceInstance = null;

class UserInterface extends DisplayObjectContainer {
	constructor(filename) {
		if(!_soundManagerInstance) {
			super('user-interface', filename);
			_soundManagerInstance = this;			
			this.alpha = USER_INTERFACE_VARS.ALPHA;

			this.currentAnimal = undefined;
			this.availableAnimals = [];
		}

		return _soundManagerInstance;
	}

	update() {

	}

	showDialog(message) {

	}
}

var DIALOG_VARS = {
	WIDTH: 300,
	HEIGHT: 150,
	DEFAULT_FONT_SIZE: 24, //In pixels
	DEFAULT_Y_SPACING: 2
}

class DialogContainer extends DisplayObject {
	constructor(message, options, ctx) {
		super('dialog-message', USER_INTERFACE_VARS.DIALOG_FILE);
		this.finalMsg = message;
		this.options = options;
		this.currentFontSize = DIALOG_VARS.DEFAULT_FONT_SIZE;
		this.ySpacing = DIALOG_VARS.DEFAULT_Y_SPACING;
		this.chunkedText = this.chunkText(message, ctx);
		this.words = message.split(" ");
	}

	draw(ctx) {
		if(this.displayImage && this.visible){
			this.applyTransformations(ctx);
			if(this.loaded) {
				ctx.drawImage(this.displayImage,0,0);
				let current_lines = this.chunkedText;
				for(let i=0; i < current_lines.length; i++) {
					ctx.fillText(current_lines[i]);
				}
			}
			this.reverseTransformations(ctx);
		}
	}

	getCurrentText() {
		if(this.options.messageTime === 0) { return this.chunkedText; }
		let cur_time = new Date().getTime();

	}

	chunkText(message, ctx) {
		if(this.chunkedText !== undefined) { return this.chunkedText; }
		var result = [message], textFits = false, 
			maxHeight = DIALOG_VARS.HEIGHT,
			maxWidth = DIALOG_VARS.HEIGHT,
			words = this.words;
		while(!textFits) {
			let lineHeight = this.currentFontSize + this.ySpacing;
			let allowed_lines = maxHeight / (lineHeight),
				current_lines = [];        

            let line = "";

            for (let n = 0; n < words.length; n++) {
            	if(current_lines.length > allowed_lines) { break; }
                let testLine = line + words[n] + " ";
                let metrics = ctx.measureText(testLine);
                let testWidth = metrics.width;

                if (testWidth > maxWidth) {
                    //context.fillText(line, x, y);
                    current_lines.push(testLine);
                    line = "";
                }
                else {
                    line = testLine;
                }
            }
            if(current_lines.length > allowed_lines) {
            	this.currentFontSize -= 2;
            } else {
            	textFits = true;
            }     
		}
		this.chunkedText = result;
		return result;
	}
}