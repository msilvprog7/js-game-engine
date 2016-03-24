"use strict";

class Matrix{
	constructor(twoDimArray) {
		this.matrix = twoDimArray;
		this.n = twoDimArray.length;
		this.m = twoDimArray[0].length;
	}

	multiply(otherMatrix) {
		var matrix1 = this.matrix,
			n1 = this.n,
			m1 = this.m,
			matrix2 = otherMatrix.matrix,
			n2 = otherMatrix.n,
			m2 = otherMatrix.m;

		if(m1 !== n2) {
			console.error("You can't multiply a " + n1 + "x" + m1 + " matrix with a " + n2 + "x" + m2 + " matrix...");
			return;
		}

		var result = new Array(n1);
		
		for (var r = 0; r < n1; r++) {
			result[r] = new Array(m2);

			for (var c = 0; c < m2; c++) {
				result[r][c] = 0;
				for(var i = 0; i < m1; i++) {
					result[r][c] += matrix1[r][i] * matrix2[i][c];
				}
			}
		}
		return new Matrix(result);
	}

	getPoint() {
		if (this.n !== 3 || this.m !== 1) {
			return undefined;
		}
		return new Point(this.matrix[0][0], this.matrix[1][0]);
	}
}

class Point{
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	getMatrix() {
		return new Matrix([
				[this.x],
				[this.y],
				[1.0]
			]);
	}
}

class Vector{
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	unit() {
		if (this.x === 0.0 && this.y === 0.0) {
			return new Vector(0.0, 0.0);
		}

		return new Vector(this.x / this.distance(), this.y / this.distance());
	}

	distance() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	project(v) {
		var unitV = this.unit();
		var scale = v.dot(unitV);
		return new Vector(unitV.x * scale, unitV.y * scale);
	}

	scale(mag) {
		return new Vector(this.x*mag, this.y*mag);
	}

	dot(v) {
		return (this.x * v.x + this.y * v.y);
	}
}

class Line{
	constructor(p1, p2) {
		this.p1 = p1;
		this.p2 = p2;
	}

	ccw(p1, p2, p3) {
		// Returns true if counterclockwise triangle from p1 to p3, false otherwise
		return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
	}

	intersects(otherLine) {
		// Line intersection algorithm we found online that determines
		// intersection by determining clockwise or counter-clockwise
		// rotation of the triangles formed between the end-points of lines
		var p1 = this.p1,
			p2 = this.p2,
			p3 = otherLine.p1,
			p4 = otherLine.p2;

		return (this.ccw(p1, p3, p4) !== this.ccw(p2, p3, p4)) && (this.ccw(p1, p2, p3) !== this.ccw(p1, p2, p4));
	}

	getIntersectionPoint(otherLine) {
		// Only call on one we know intersects

		// Find parameter of intersection
		var t = ((otherLine.p2.x - otherLine.p1.x) * (this.p1.y - otherLine.p1.y) - (otherLine.p2.y - otherLine.p1.y) * (this.p1.x - otherLine.p1.x)) / 
				((otherLine.p2.y - otherLine.p1.y) * (this.p2.x - this.p1.x) - (otherLine.p2.x - otherLine.p1.x) * (this.p2.y - this.p1.y));
		return new Point(this.p1.x + t * (this.p2.x - this.p1.x), this.p1.y + t * (this.p2.y - this.p1.y));
	}

	normal(point) {
		// Returns a unit vector normal from line to the point
		var undirectedNormal = new Vector(this.p2.y - this.p1.y, -(this.p2.x - this.p1.x)),
			lineToPoint = new Vector(point.x - this.p1.x, point.y - this.p1.y);

		return undirectedNormal.project(lineToPoint).unit();
	}
}

class BoundingRectangle{
	constructor() {
		this.width = 0;
		this.height = 0;
	}

	addPoint(point) {
		if (this.point === undefined) {
			this.point = point;
			return;
		}

		// Get leftmost point
		var leftmost = new Point(Math.min(this.point.x, point.x), Math.min(this.point.y, point.y));
		
		// Update width and height
		this.width = Math.max(this.point.x, point.x) - leftmost.x;
		this.height = Math.max(this.point.y, point.y) - leftmost.y;
	}
}

class MathUtil {


	static randomInt(min, max) {
		return Math.floor((Math.random() * (max - min + 1)) + min);
	}

	static either() {
		if (arguments.length === 0) {
			return undefined;
		}

		return arguments[MathUtil.randomInt(0, arguments.length - 1)];
	}

	static euclidianDist(pos1, pos2) {
		return Math.sqrt((pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.y - pos2.y) * (pos1.y - pos2.y));
	}

	static modRadians(radians) {
		while (radians < 0) {
			radians += 2 * Math.PI;
		}

		return radians % (2 * Math.PI);
	}
}

var init_pi = function() {
	let pi_vars = [
		{n: 'PI4', v: Math.PI/4},
		{n: 'PI2', v: Math.PI/2},
		{n: '3PI4', v: 3*Math.PI/4},
		{n: 'PI', v: Math.PI},
		{n: '5PI4', v: 5*Math.PI/4},
		{n: '3PI2', v: 3*Math.PI/2},
		{n: '7PI4', v: 7*Math.PI/4},
		{n: '2PI', v: 2*Math.PI}		
	];
	pi_vars.forEach(function(pi_var) {
		Object.defineProperty(MathUtil, pi_var.n, {
		    value: pi_var.v,
		    writable : false,
		    enumerable : true,
		    configurable : false
		});
	});
}();
