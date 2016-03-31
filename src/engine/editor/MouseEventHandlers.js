"use strict";

/**
 * Static functions to handle Mouse Events
 */
class MouseEventHandlers {
	
	static getMousePosition(canvas, e) {
		var boundingRect = canvas.getBoundingClientRect();
		return {x: (e.clientX - boundingRect.left), y: (e.clientY - boundingRect.top)};
	}

	static pointDifference(p1, p2) {
		return {x: p2.x - p1.x, y: p2.y - p1.y};
	}

	static scaleUnitVector(vector, magnitude) {
		var unit = MouseEventHandlers.getUnit(vector);
		return {x: unit.x * magnitude, y: unit.y * magnitude};
	}

	static getUnit(vector) {
		var dist = MouseEventHandlers.getDistance(vector);
		return {x: (dist !== 0) ? vector.x / dist : 0, y: (dist !== 0) ? vector.y / dist : 0};
	}

	static getDistance(vector) {
		return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
	}

}