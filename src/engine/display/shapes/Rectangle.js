"use strict";

var RECTANGLE_VARS = {
	count: 0
};


class Rectangle extends DisplayObject {
	
	constructor(position, dimensions, color) {
		super("rectangle-" + RECTANGLE_VARS.count, undefined);
		this.setPosition(position);
		this.setDimensions(dimensions);
		this.fillColor = color;
		RECTANGLE_VARS.count++;
	}

	setDimensions(dimensions) {
		this.width = dimensions.width;
		this.height = dimensions.height;
	}

	getDimensions() {
		return {
			width: this.width,
			height: this.height
		};
	}

	setFillColor(color) {
		this.fillColor = color;
	}

	getFillColor() {
		return this.fillColor;
	}

	/**
	 * Draws the rectangle
	 */
	draw(g){
		if(this.visible) {

			this.applyTransformations(g);
			
			// Save state
			g.save();

			if (this.fillColor !== undefined) {
				// Fill
				g.fillStyle = this.fillColor;
				g.fillRect(0, 0, this.width, this.height);
			} else {
				// Stroke
				g.strokeStyle = "#000000";
				g.strokeRect(0, 0, this.width, this.height);
			}

			// Cleanup
			g.restore();

			this.reverseTransformations(g);
		}
	}

}