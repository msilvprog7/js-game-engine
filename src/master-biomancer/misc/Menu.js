"use strict";


class Menu extends DisplayObjectContainer {
	constructor(id, game) {
		super(id, undefined);
		this.options = [];
		this.fontSize = 30;
		this.font = 'Montserrat';
	}

	update() {
		super.update();
	}

	draw(g) {
		super.draw(g);
	}

	addOption(opt) {
		this.addChild(opt);
		this.options.push(opt);
		opt.menu = this;
		return this;
	}

	getOptions() {
		return this.options;
	}

	setFontSize(fontSize) {
		this.fontSize = fontSize;
	}

	setFont(font) {
		this.font = font;
	}

	getFontString() {
		return this.fontSize + 'px ' + this.font;
	}
}

class MenuOption extends DisplayObjectContainer {
	constructor(id, text, click, menu) {
		super(id, undefined);
		this.text = text;
		this.color = '#ffffff';
		this.clickFunc = click;
		this.height = 50;
		this.width = 50;
		this.menu = menu;
	}

	update() {
		super.update();
	}

	draw(g) {
		super.draw(g);
		this.g = g;
		this.applyTransformations(g);
		g.font = this.menu.getFontString();
		g.fillStyle = this.color;
		g.fillText(this.text, 0, 0);
		this.reverseTransformations(g);
	}

	click(game) {
		this.clickFunc(game);
	}

	getWidth() {
		this.g.font = this.menu.fontSize + 'px Arial';
		return this.g.measureText(this.text).width;
	}

	getHeight() {
		return this.menu.fontSize * 1.5;
	}

	setWidth(w) {
		this.width = w;
		return this;
	}

	setHeight(h) {
		this.height = h;
		return this;
	}

}

class TextDO extends DisplayObjectContainer {
	constructor(id, text, font) {
		super(id, undefined);
		this.text = text;
		this.font = font;
		this.color = 'white';
	}

	setFont(font) {
		this.font = font;
	}

	draw(g) {
		super.draw(g);
		// this.g = g;
		this.applyTransformations(g);
		g.font = this.font;
		g.fillStyle = this.color;
		g.fillText(this.text, 0, 0);
		this.reverseTransformations(g);
	}
}