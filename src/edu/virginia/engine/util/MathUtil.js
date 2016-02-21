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
}