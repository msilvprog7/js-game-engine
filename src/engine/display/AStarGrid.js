"use strict";


class AStarGrid {
	constructor(level) {
		this.level = level;
		this.grid = [[]];
		this.objects = {};
		// this.removables = {};
		// dict keyed by x,y for instant tile lookup
		this.staticTiles = {};
	}

	/**
	 * Create grid given pixel corners and tile size.
	 */
	generateGrid(topLeft, bottomRight, tileWidth) {
		var xIndex = 0;
		var yIndex = 0;
		this.topLeft = topLeft;
		this.bottomRight = bottomRight;
		this.tileWidth = tileWidth;
		for (let x = this.topLeft.x; x < this.bottomRight.x; x += tileWidth) {
			this.grid[xIndex] = [];
			yIndex = 0;
			for (let y = this.topLeft.y; y < this.bottomRight.y; y += tileWidth) {
				this.grid[xIndex][yIndex] = 0;
				yIndex++;
			}
			
			xIndex++;
		}

		// pad grid to square
		if (xIndex < yIndex) {
			for (let x = xIndex; x < yIndex; x++) {
				// fill with 1's because impassable
				this.grid[x] = Array.apply(null, Array(yIndex)).map(Number.prototype.valueOf,1);
			}
		} else if (yIndex < xIndex) {
			for (let x = 0; x < xIndex; x++) {
				for (let y = yIndex; y < xIndex; y++) {
					this.grid[x][y] = 1;
				}
			}
		}
	}

	/**
	 * Set block of tiles to impassible give pixel corners
	 */
	markTiles(tl, br) {
		var xStart = this.coordToIndex('x', tl.x),
			xEnd = this.coordToIndex('x', br.x),
			yStart = this.coordToIndex('y', tl.y),
			yEnd = this.coordToIndex('y', br.y);

		for (let x = xStart; x <= xEnd; x++) {
			for (let y = yStart; y <= yEnd; y++) {
				this.grid[x][y] = 1;
			}
		}
		return this;
	}

	/**
	 * Get the grid tiles for area covered by given pixel corners.
	 * May also get only middle tile.
	 */
	getTiles(tl, br, isSingle) {
		var tiles = [];

		if (isSingle) {
			let midpoint = MathUtil.getMidpoint(tl, br),
				x = this.coordToIndex('x', midpoint.x),
				y = this.coordToIndex('y', midpoint.y);

			tiles.push({
				x: x,
				y: y
			});
			
		} else {
			let xStart = this.coordToIndex('x', tl.x),
				xEnd = this.coordToIndex('x', br.x),
				yStart = this.coordToIndex('y', tl.y),
				yEnd = this.coordToIndex('y', br.y);

			for (let x = xStart; x <= xEnd; x++) {
				for (let y = yStart; y <= yEnd; y++) {
					// this.grid[x][y] = 1;
					tiles.push({
						x: x,
						y: y
					});
				}
			}
		}

		return tiles;
	}

	/**
	 * Convert pixel coordinate to grid index
	 */
	coordToIndex(type, value) {
		if (type == 'x') {
			return Math.floor(Math.abs(this.topLeft.x - value) / this.tileWidth);
		} else if (type == 'y') {
			return Math.floor(Math.abs(this.topLeft.y - value) / this.tileWidth);
		} else {
			return -1;
		}
	}

	/**
	 * Convert grid index to pixel coordinate based on middle of tile
	 */
	indexToCoord(point) {
		var x = (point[0] + 0.5) * this.tileWidth + this.topLeft.x,
			y = (point[1] + 0.5) * this.tileWidth + this.topLeft.y;

		return {
			x: x,
			y: y
		};
	}

	/**
	 * Set tiles in grid to value. 1 for impassable, 0 for open.
	 */
	updateTiles(tiles, value) {
		for (let tile of tiles) {
			if (!this.isStaticTile(tile)) {
				this.grid[tile.x][tile.y] = value;
			}
		}
	}

	/**
	 * Add static object painting to grid, never removed or moved
	 */
	addStatic(tl, br){
		// just call mark tiles
		var tiles = this.getTiles(tl, br);	
		this.updateTiles(tiles, 1);
		this.addStaticTiles(tiles);
	}

	/**
	 * Add tiles to list of tiles to never be changed (for walls and such)
	 */
	addStaticTiles(tiles) {
		for (let tile of tiles) {
			let key = tile.x + ',' + tile.y;
			this.staticTiles[key] = tile;
		}
	}

	/**
	 * Check if tile is static (not to be changed)
	 */
	isStaticTile(tile) {
		var key = tile.x + ',' + tile.y;
		return this.staticTiles[key] !== undefined;
	}


	/**
	 * Adds dynamic object to grid, may move or be removed
	 */
	addObject(obj, tl, br, isMover, isSingle) {
		var tiles;

		isSingle = isSingle || false;
		tiles = this.getTiles(tl, br, isSingle);
		isMover = isMover || false;

		this.objects[obj.id] = new GridEntry(this, obj, tiles, isMover);
		this.updateTiles(tiles, 1);
		// eventType, listener, callback, context
		if (isMover)
			obj.addEventListener(MoveEvent.POSITION_CHANGED(), this, this.handlePositionChanged, this);
		return this;
	}

	/**
	 * Remove entry from grid.
	 */
	removeObject(o) {
		var entry = this.objects[o.id];
		this.updateTiles(entry.tiles, 0);
		if (entry.isMover) 
			entry.obj.removeEventListener(MoveEvent.POSITION_CHANGED(), this);
		delete this.objects[o.id];
	}

	/**
	 * Get grid entry for given id
	 */
	getObject(id) {
		return this.objects[id];
	}

	/**
	 * Handler for updating grid based on position changes
	 */
	handlePositionChanged(e) {
		var that = this.listener,
			entry = that.objects[e.source.id],
			tiles = that.getTiles(e.tl, e.br);

		// check for tile change
		if (!that.compareTiles(entry.tiles, tiles)) {
			that.updateTiles(entry.tiles, 0);
			that.updateTiles(tiles, 1);
			entry.tiles = tiles;
		}
	}

	/**
	 * Check if two tile arrays are the same
	 */
	compareTiles(t1, t2) {
		if (t1.length !== t2.length) {
			return false;
		} else {
			for (let tile of t1) {
				let hasTile = t2.some(t => {tile.x == t.x && tile.y == t.y});
				if (!hasTile)
					return false;
			}
		}
		return true;
	}

	/**
	 *	Get set of points for straight line using bresenham
	 */
	calcStraightLine(p1, p2) {
		var coords = [],
			x1 = p1.x,
			y1 = p1.y,
			x2 = p2.x,
			y2 = p2.y,
			dx = Math.abs(x2 - x1),
			dy = Math.abs(y2 - y1),
			sx = (x1 < x2) ? 1 : -1,
			sy = (y1 < y2) ? 1 : -1,
			err = dx - dy;

		// first coord
		coords.push({
			x: x1,
			y: y1
		});

		while (!((x1 == x2) && (y1 == y2))) {
			var e2 = err * 2;
			if (e2 > -dy) {
				err -= dy;
				x1 += sx;
			}
			if (e2 < dx) {
				err += dx;
				y1 += sy;
			}
			// add coord
			coords.push({
				x: x1,
				y: y1
			});
		}

		return coords;
	}

	/**
	 * Check if path is clear between two objects in grid
	 *
	 */
	hasLineOfSight(id1, id2) {
		var e1 = this.getObject(id1),
			e2 = this.getObject(id2),
			coords = this.calcStraightLine(e1.getCenter(), e2.getCenter()),
			allTiles = e1.tiles.concat(e2.tiles),
			flag = true;
		// just use first tile for now (many are singles)

		// remove character tiles from list
		// coords.shift();
		// coords.pop();
		// open src and dest tiles
		this.updateTiles(allTiles, 0);
		for (let coord of coords) {
			if (this.grid[coord.x][coord.y] === 1) {
				flag = false;
				break;
			}
		}
		// close src and dest tiles
		this.updateTiles(allTiles, 1);
		return flag;
	}

	/**
	 * Get string representation of grid state
	 */
	gridToString() {
		var str = '';

		for (let y = 0; y < this.grid.length; y++) {
			for (let x = 0; x < this.grid.length; x++) {
				if (x !== 0) {
					str += ',';
				}
				str += this.grid[x][y] ? 'X' : ' ';
			}
			str += '\n';
		}

		return str;
	}

	/**
	 * Get path between two entries as array of pixel locations
	 */
	getObjectPath(id1, id2) {
		var e1 = this.getObject(id1),
			e2 = this.getObject(id2),
			allTiles = e1.tiles.concat(e2.tiles),
			path;

		//open src and dest tiles
		this.updateTiles(allTiles, 0);
		path = this.findPath(e1.getOrigin(), e2.getOrigin(), e1.getWidth(), e1.getHeight());
		// close src and dest
		this.updateTiles(allTiles, 1);
		return path.map(this.indexToCoord, this);
	}

	getObjectOrigin(id) {
		return this.getObject(id).getOrigin();
	}

	/**
	 * Get path from one grid location to another
	 */
	findPath(pathStart, pathEnd, width, height) {
		// shortcuts for speed
		var	abs = Math.abs;
		var	max = Math.max;
		var	pow = Math.pow;
		var	sqrt = Math.sqrt;
		var world = this.grid;

		// the world data are integers:
		// anything higher than this number is considered blocked
		// this is handy is you use numbered sprites, more than one
		// of which is walkable road, grass, mud, etc
		var maxWalkableTileNum = 0;

		// keep track of the world dimensions
	    // Note that this A-star implementation expects the world array to be square: 
		// it must have equal height and width. If your game world is rectangular, 
		// just fill the array with dummy values to pad the empty space.
		var worldWidth = world[0].length;
		var worldHeight = world.length;
		var worldSize =	worldWidth * worldHeight;

		// which heuristic should we use?
		// default: no diagonals (Manhattan)
		// var distanceFunction = ManhattanDistance;
		// var findNeighbours = function(){}; // empty

		/*

		// alternate heuristics, depending on your game:

		// diagonals allowed but no sqeezing through cracks:
		var distanceFunction = DiagonalDistance;
		var findNeighbours = DiagonalNeighbours;

		// diagonals and squeezing through cracks allowed:
		var distanceFunction = DiagonalDistance;
		var findNeighbours = DiagonalNeighboursFree;
		*/
		// euclidean but no squeezing through cracks:
		var distanceFunction = EuclideanDistance;
		var findNeighbours = DiagonalNeighbours;
		/*
		// euclidean and squeezing through cracks allowed:
		var distanceFunction = EuclideanDistance;
		var findNeighbours = DiagonalNeighboursFree;

		*/

		// distanceFunction functions
		// these return how far away a point is to another

		function ManhattanDistance(Point, Goal)
		{	// linear movement - no diagonals - just cardinal directions (NSEW)
			return abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
		}

		function DiagonalDistance(Point, Goal)
		{	// diagonal movement - assumes diag dist is 1, same as cardinals
			return max(abs(Point.x - Goal.x), abs(Point.y - Goal.y));
		}

		function EuclideanDistance(Point, Goal)
		{	// diagonals are considered a little farther than cardinal directions
			// diagonal movement using Euclide (AC = sqrt(AB^2 + BC^2))
			// where AB = x2 - x1 and BC = y2 - y1 and AC will be [x3, y3]
			return sqrt(pow(Point.x - Goal.x, 2) + pow(Point.y - Goal.y, 2));
		}

		// Neighbours functions, used by findNeighbours function
		// to locate adjacent available cells that aren't blocked

		// Returns every available North, South, East or West
		// cell that is empty. No diagonals,
		// unless distanceFunction function is not Manhattan
		function Neighbours(x, y)
		{
			var	N = y - 1,
			S = y + 1,
			E = x + 1,
			W = x - 1,
			myN = N > -1 && canWalkHere(x, N),
			myS = S < worldHeight && canWalkHere(x, S),
			myE = E < worldWidth && canWalkHere(E, y),
			myW = W > -1 && canWalkHere(W, y),
			result = [];
			if(myN)
			result.push({x:x, y:N});
			if(myE)
			result.push({x:E, y:y});
			if(myS)
			result.push({x:x, y:S});
			if(myW)
			result.push({x:W, y:y});
			findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
			return result;
		}

		// returns every available North East, South East,
		// South West or North West cell - no squeezing through
		// "cracks" between two diagonals
		function DiagonalNeighbours(myN, myS, myE, myW, N, S, E, W, result)
		{
			if(myN)
			{
				if(myE && canWalkHere(E, N))
				result.push({x:E, y:N});
				if(myW && canWalkHere(W, N))
				result.push({x:W, y:N});
			}
			if(myS)
			{
				if(myE && canWalkHere(E, S))
				result.push({x:E, y:S});
				if(myW && canWalkHere(W, S))
				result.push({x:W, y:S});
			}
		}

		// returns every available North East, South East,
		// South West or North West cell including the times that
		// you would be squeezing through a "crack"
		function DiagonalNeighboursFree(myN, myS, myE, myW, N, S, E, W, result)
		{
			myN = N > -1;
			myS = S < worldHeight;
			myE = E < worldWidth;
			myW = W > -1;
			if(myE)
			{
				if(myN && canWalkHere(E, N))
				result.push({x:E, y:N});
				if(myS && canWalkHere(E, S))
				result.push({x:E, y:S});
			}
			if(myW)
			{
				if(myN && canWalkHere(W, N))
				result.push({x:W, y:N});
				if(myS && canWalkHere(W, S))
				result.push({x:W, y:S});
			}
		}

		// returns boolean value (world cell is available and open)
		function canWalkHere(x, y)
		{
			var xMax = x + width,
				yMax = y + height;
			// return ((world[x] != null) &&
			// 	(world[x][y] != null) &&
			// 	(world[x][y] <= maxWalkableTileNum));
			for (let i = x; i < xMax; i++) {
				if (world[i] == null) 
					return false;
				for (let j = y; j < yMax; j++) {
					if (world[i][j] == null || world[i][j] > maxWalkableTileNum)
						return false;
				}
			}
			return true;
		};

		// Node function, returns a new object with Node properties
		// Used in the calculatePath function to store route costs, etc.
		function Node(Parent, Point)
		{
			var newNode = {
				// pointer to another Node object
				Parent:Parent,
				// array index of this Node in the world linear array
				value:Point.x + (Point.y * worldWidth),
				// the location coordinates of this Node
				x:Point.x,
				y:Point.y,
				// the heuristic estimated cost
				// of an entire path using this node
				f:0,
				// the distanceFunction cost to get
				// from the starting point to this node
				g:0
			};

			return newNode;
		}

		// Path function, executes AStar algorithm operations
		function calculatePath()
		{
			// create Nodes from the Start and End x,y coordinates
			var	mypathStart = Node(null, {x:pathStart.x, y:pathStart.y});
			var mypathEnd = Node(null, {x:pathEnd.x, y:pathEnd.y});
			// create an array that will contain all world cells
			var AStar = new Array(worldSize);
			// list of currently open Nodes
			var Open = [mypathStart];
			// list of closed Nodes
			var Closed = [];
			// list of the final output array
			var result = [];
			// reference to a Node (that is nearby)
			var myNeighbours;
			// reference to a Node (that we are considering now)
			var myNode;
			// reference to a Node (that starts a path in question)
			var myPath;
			// temp integer variables used in the calculations
			var length, max, min, i, j;
			// iterate through the open list until none are left
			while(length = Open.length)
			{
				max = worldSize;
				min = -1;
				for(i = 0; i < length; i++)
				{
					if(Open[i].f < max)
					{
						max = Open[i].f;
						min = i;
					}
				}
				// grab the next node and remove it from Open array
				myNode = Open.splice(min, 1)[0];
				// is it the destination node?
				if(myNode.value === mypathEnd.value)
				{
					myPath = Closed[Closed.push(myNode) - 1];
					do
					{
						result.push([myPath.x, myPath.y]);
					}
					while (myPath = myPath.Parent);
					// clear the working arrays
					AStar = Closed = Open = [];
					// we want to return start to finish
					result.reverse();
				}
				else // not the destination
				{
					// find which nearby nodes are walkable
					myNeighbours = Neighbours(myNode.x, myNode.y);
					// test each one that hasn't been tried already
					for(i = 0, j = myNeighbours.length; i < j; i++)
					{
						myPath = Node(myNode, myNeighbours[i]);
						if (!AStar[myPath.value])
						{
							// estimated cost of this particular route so far
							myPath.g = myNode.g + distanceFunction(myNeighbours[i], myNode);
							// estimated cost of entire guessed route to the destination
							myPath.f = myPath.g + distanceFunction(myNeighbours[i], mypathEnd);
							// remember this new path for testing above
							Open.push(myPath);
							// mark this node in the world graph as visited
							AStar[myPath.value] = true;
						}
					}
					// remember this route as having no more untested options
					Closed.push(myNode);
				}
			} // keep iterating until the Open list is empty
			return result;
		}

		// actually calculate the a-star path!
		// this returns an array of coordinates
		// that is empty if no path is possible
		return calculatePath();

	} // end of findPath() function
}


/**
 * Entry in A star grid
 */
class GridEntry {
	constructor(grid, obj, tiles, isMover) {
		this.grid = grid;
		this.obj = obj;
		this.tiles = tiles;
		this.isMover = isMover;
	}

	getOrigin() {
		return this.tiles[0];
	}

	getCenter() {
		var origin = this.getOrigin();
		return {
			x: Math.floor(this.getWidth()/2) + origin.x,
			y: Math.floor(this.getHeight()/2) + origin.y
		};
	}

	getWidth() {
		return this.tiles[this.tiles.length-1].x - this.tiles[0].x + 1;
	}

	getHeight() {
		return this.tiles[this.tiles.length-1].y - this.tiles[0].y + 1;
	}

	getPixelOrigin() {
		var origin = this.getOrigin();

		return this.grid.indexToCoord([origin.x, origin.y]);
	}
}