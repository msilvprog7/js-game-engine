"use strict";

var DIALOG_VARS = {
	WIDTH: 330,
	HEIGHT: 100,
	DIALOG_FILE: "biomancer/ui/dialog-box.png",
	CLOSE_ICON: "biomancer/ui/q-key.png",
	CLOSE_ICON_POSITION: {x: 450, y: 110},
	DEFAULT_FONT_SIZE: 28, //In pixels
	DEFAULT_Y_SPACING: 2,
	X_TEXT_START: 33,
	Y_TEXT_START: 33,
	X_POSITION: 250,
	Y_POSITION: 357,
	PERIOD_MULTIPLIER: 6,
	FONT_INCREMENT: 2,
	FONT_STYLE: "Arial",
	BOX_ALPHA: 0.7,
	TEXT_ALPHA: 1.0,
	FINISHED_TIMEOUT: 10000
};


class DialogContainer extends DisplayObjectContainer {
	constructor(message, options, ctx) {
		super('dialog-message', DIALOG_VARS.DIALOG_FILE);
		if(!message) { message = "Please put a message."}
		this.finalMsg = message;
		this.options = options || {};
		this.finished = false;
		this.setPosition({x: DIALOG_VARS.X_POSITION, y: DIALOG_VARS.Y_POSITION});
		this.setAlpha(DIALOG_VARS.BOX_ALPHA);
		this.currentFontSize = DIALOG_VARS.DEFAULT_FONT_SIZE;
		this.ySpacing = DIALOG_VARS.DEFAULT_Y_SPACING;
		ctx.font=this.currentFontSize+"px " + DIALOG_VARS.FONT_STYLE;
		this.words = message.split(" ");
		this.wordsLength = this.words.length;
		this.finishedTime = -1;

		this.chunkedText = this.chunkText(message, ctx);
		this.chunkedTextLineLength = this.chunkedText.map(e => e.split(" ").length);
		this.closeIcon = new Sprite("dialog-close-key", DIALOG_VARS.CLOSE_ICON);
		this.closeIcon.setPosition(DIALOG_VARS.CLOSE_ICON_POSITION);

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
				this.children.forEach(function (child) {
					child.draw(ctx);
				});
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
			let cur_line = 0, cur_length = this.chunkedTextLineLength[cur_line],
				chunkLength = this.chunkedText.length;
			while(cur_length < this.wordToAdd) {
				cur_line++;
				cur_length += this.chunkedTextLineLength[cur_line];				
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
		if(this.wordToAdd >= this.wordsLength && !this.finished) {
			this.finished = true; 
			this.finishedTimeout = cur_time+DIALOG_VARS.FINISHED_TIMEOUT;
			this.addChild(this.closeIcon);
		}
		return this.currentWordsMapped;
	}

	chunkText(message, ctx) {
		if(this.chunkedText !== undefined) { return this.chunkedText; }
		var result = [message], textFits = false, 
			maxHeight = DIALOG_VARS.HEIGHT,
			maxWidth = DIALOG_VARS.WIDTH;
		while(!textFits) {
			let lineHeight = this.currentFontSize + this.ySpacing;
			let allowed_lines = maxHeight / (lineHeight),
				current_lines = [];        

            let line = "";

            for (let n = 0; n < this.wordsLength; n++) {
            	if(current_lines.length > allowed_lines) { break; }
                let testLine = line + this.words[n] + " ";
                let metrics = ctx.measureText(testLine);

                if (metrics.width > maxWidth) {
                    //context.fillText(line, x, y);
                    current_lines.push(line);
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