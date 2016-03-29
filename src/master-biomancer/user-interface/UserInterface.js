"use strict";

var USER_INTERFACE_VARS = {
	ALPHA: 0.7,
	INTERFACE_FILE: "biomancer/ui/main.png",
	DIALOG_FILE: "biomancer/ui/dialog-box.png",
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

var DIALOG_VARS = {
	WIDTH: 400,
	HEIGHT: 250,
	DEFAULT_FONT_SIZE: 60, //In pixels
	DEFAULT_Y_SPACING: 2,
	X_TEXT_START: 35,
	Y_TEXT_START: 40,
	X_POSITION: 250,
	Y_POSITION: 250,
	PERIOD_MULTIPLIER: 6,
	FONT_INCREMENT: 2,
	FONT_STYLE: "Arial",
	BOX_ALPHA: 0.7,
	TEXT_ALPHA: 1.0,
}

class DialogContainer extends DisplayObject {
	constructor(message, options, ctx) {
		super('dialog-message', USER_INTERFACE_VARS.DIALOG_FILE);
		if(!message) { message = "Please put a message."}
		this.finalMsg = message;
		this.options = options;
		this.finished = false;
		this.setPosition({x: DIALOG_VARS.X_POSITION, y: DIALOG_VARS.Y_POSITION});
		this.setAlpha(DIALOG_VARS.BOX_ALPHA);
		this.currentFontSize = DIALOG_VARS.DEFAULT_FONT_SIZE;
		this.ySpacing = DIALOG_VARS.DEFAULT_Y_SPACING;
		ctx.font=this.currentFontSize+"px " + DIALOG_VARS.FONT_STYLE;
		this.words = message.split(" ");
		this.wordsLength = this.words.length;

		this.chunkedText = this.chunkText(message, ctx);

		if(this.options.wordTime !== undefined && this.options.wordTime > 0) {
			this.nextWordTime = new Date().getTime() + this.options.wordTime;
			this.currentWords = [[this.words[0]]];
			this.currentWordsMapped = this.currentWords.map(e => e.join(' '));
			this.wordToAdd = 1;
		}
	}

	draw(ctx) {
		if(this.displayImage && this.visible){
			this.applyTransformations(ctx);
			if(this.loaded) {
				ctx.drawImage(this.displayImage,0,0);
				this.setAlpha(DIALOG_VARS.TEXT_ALPHA);
				let currentLines = this.getCurrentText(),
					lineHeight = this.currentFontSize + this.ySpacing;
				for(let i=0; i < currentLines.length; i++) {
					ctx.fillText(currentLines[i], DIALOG_VARS.X_TEXT_START, DIALOG_VARS.Y_TEXT_START+lineHeight*i);
				}
				this.setAlpha(DIALOG_VARS.BOX_ALPHA);
			}
			this.reverseTransformations(ctx);
		}
	}

	getCurrentText() {		
		if(this.options.wordTime === undefined || this.options.wordTime === 0) { 
			this.finished = true;
			return this.chunkedText; 
		}		
		let cur_time = new Date().getTime();
		if(cur_time >= this.nextWordTime && this.wordToAdd < this.wordsLength) {
			let cur_line = 0, inc = this.chunkedText[cur_line].split(" ").length, cur_length = inc;
			while(cur_length < this.wordToAdd) {
				cur_length += inc;
				cur_line++;
			}			
			if(this.currentWords[cur_line] === undefined) {
				this.currentWords[cur_line] = [];
			}
			this.currentWords[cur_line].push(this.words[this.wordToAdd]);
			this.nextWordTime = cur_time + this.options.wordTime;
			if(this.options.pauseOnPeriods && this.words[this.wordToAdd].indexOf('.') >= 0) { 
				this.nextWordTime += (this.options.wordTime*DIALOG_VARS.PERIOD_MULTIPLIER);
			}
			this.wordToAdd++;
			this.currentWordsMapped = this.currentWords.map(e => e.join(' '));
		}
		if(this.wordToAdd >= this.wordsLength) { this.finished = true; }
		return this.currentWordsMapped;
	}

	chunkText(message, ctx) {
		if(this.chunkedText !== undefined) { return this.chunkedText; }
		var result = [message], textFits = false, 
			maxHeight = DIALOG_VARS.HEIGHT,
			maxWidth = DIALOG_VARS.HEIGHT;
		while(!textFits) {
			let lineHeight = this.currentFontSize + this.ySpacing;
			let allowed_lines = maxHeight / (lineHeight),
				current_lines = [];        

            let line = "";

            for (let n = 0; n < this.wordsLength; n++) {
            	if(current_lines.length > allowed_lines) { break; }
                let testLine = line + this.words[n] + " ";
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
            	this.currentFontSize -= DIALOG_VARS.FONT_INCREMENT;
            	ctx.font=this.currentFontSize+"px " + DIALOG_VARS.FONT_STYLE;
            } else {
            	textFits = true;
            	result = current_lines;
            }     
		}
		this.chunkedText = result;
		return result;
	}
}