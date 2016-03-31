"use strict";

var LEVEL_EDITOR_VARS = {
	BACKGROUND_COLOR: "#f0faf9",
	DRAW_RATE: 1000 / 30,
	POSITION_DISPLAY_ID: "position",
	TOOLBAR_ID: "toolbarOptions",
	DRAW_BUTTON_ID: "drawButton",
	SELECT_CLASS_ID: "selectClass",
	SELECT_OBJECT_ID: "selectObject",
	DEFAULT_SELECT_OBJECT: "<none>",
	EDIT_OBJECT_DIV: "editObject",
	VISIBLE_GRID_ROW_SEPARATION: 50,
	VISIBLE_GRID_COL_SEPARATION: 50,
	ORIGIN_GRID_COLOR: "#cba864",
	REGULAR_GRID_COLOR: "#d1f0d6",
	SNAP_GRID_COLOR: "#3f86bd",
	SNAP_GRID_RADIUS: 15,
	SNAP_GRID_DISPLAY_RADIUS: 5,
	DRAW_DRAG_SPEED: 8,
	DRAW_DRAG_RATE: 1000 / 30,
	DEFAULT_GENERATE_PARMAS: {
		"Exceed-Width": 1,
		"Exceed-Height": 1
	}
};

/**
 * The level editor 
 */
class LevelEditor extends DisplayObject {

	constructor(canvas) {
		super("level-editor", undefined);

		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.reset();
	}

	/** 
	 * Draw functions
	 */
	draw(force) {
		if (force === undefined && new Date().getTime() < this.nextDraw) {
			return;
		}

		// Set the level's position (negative of the editors because I goofed)
		this.level.setPosition({x: -this.position.x, y: -this.position.y});

		// Clear context
		this.ctx.clearRect(0, 0, this.dimensions.width, this.dimensions.height);

		// Draw children
		this.level.draw(this.ctx);

		// Draw drawable object
		this.drawCurrentObject();

		// Draw grid lines in view
		this.drawVisibleGrid();

		// Draw editor tools
		this.drawNearestSnapGrid();

		// Update next draw
		this.nextDraw = new Date().getTime() + LEVEL_EDITOR_VARS.DRAW_RATE;
	}

	drawVisibleGrid() {
		// Horizontal lines
		let yMod = this.position.y % LEVEL_EDITOR_VARS.VISIBLE_GRID_ROW_SEPARATION,
			yPos = ((yMod > 0) ? LEVEL_EDITOR_VARS.VISIBLE_GRID_ROW_SEPARATION - yMod : -yMod);
		for (; yPos <= this.dimensions.height; yPos += LEVEL_EDITOR_VARS.VISIBLE_GRID_ROW_SEPARATION) {
			this.drawHorizontalLine((Math.abs(this.position.y + yPos) < 0.0001) ? LEVEL_EDITOR_VARS.ORIGIN_GRID_COLOR : LEVEL_EDITOR_VARS.REGULAR_GRID_COLOR,
				yPos, 0, this.dimensions.width);
		}

		// Vertical lines
		let xMod = this.position.x % LEVEL_EDITOR_VARS.VISIBLE_GRID_COL_SEPARATION,
			xPos = ((xMod > 0) ? LEVEL_EDITOR_VARS.VISIBLE_GRID_COL_SEPARATION - xMod : -xMod);
		for (; xPos <= this.dimensions.width; xPos += LEVEL_EDITOR_VARS.VISIBLE_GRID_COL_SEPARATION) {
			this.drawVerticalLine((Math.abs(this.position.x + xPos) < 0.0001) ? LEVEL_EDITOR_VARS.ORIGIN_GRID_COLOR : LEVEL_EDITOR_VARS.REGULAR_GRID_COLOR,
				xPos, 0, this.dimensions.height);
		}
	}

	drawVerticalLine(color, x, y0, y1) {
		this.ctx.save();

		this.ctx.strokeStyle = color;
		this.ctx.beginPath();
		this.ctx.moveTo(x, y0);
		this.ctx.lineTo(x, y1);
		this.ctx.closePath();
		this.ctx.stroke();

		this.ctx.restore();
	}

	drawHorizontalLine(color, y, x0, x1) {
		this.ctx.save();

		this.ctx.strokeStyle = color;
		this.ctx.beginPath();
		this.ctx.moveTo(x0, y);
		this.ctx.lineTo(x1, y);
		this.ctx.closePath();
		this.ctx.stroke();

		this.ctx.restore();
	}

	drawCurrentObject() {
		if (!this.drawing || this.drawingObject === undefined) {
			return;
		}

		// Draw with position relative to the editor as a display object container
		this.drawingObject.displayObject.draw(this.ctx);
	}

	drawNearestSnapGrid() {
		if (this.nearestSnapGrid === undefined) {
			return;
		}

		this.ctx.save();

		this.ctx.fillStyle = LEVEL_EDITOR_VARS.SNAP_GRID_COLOR;
		this.ctx.beginPath();
		this.ctx.arc(this.nearestSnapGrid.x, this.nearestSnapGrid.y, LEVEL_EDITOR_VARS.SNAP_GRID_DISPLAY_RADIUS, 0, 2 * Math.PI);
		this.ctx.fill();

		this.ctx.restore();
	}



	/**
	 * Reset the state of the editor
	 */
	reset() {
		var that = this;

		// Next draw
		this.nextDraw = 0;

		// Disable text selection
		document.onselectstart = function () { return false; };

		// Set background color
		this.canvas.style.setProperty("background-color", LEVEL_EDITOR_VARS.BACKGROUND_COLOR);

		// Dimensions
		this.dimensions = {width: this.canvas.width, height: this.canvas.height};
		// Offset
		this.offset = {x: this.canvas.width / 2, y: this.canvas.height / 2};
		// Position
		this.setPosition({x: -this.canvas.width / 2, y: -this.canvas.height / 2});

		// Create level
		this.level = new Level("level", undefined);
		this.level.setPosition({x: -this.position.x, y: -this.position.y}); // Always negative of the current editors
		this.level.monitorHealth = function (entity) { };

		// Get class references
		this.getClassReferences();

		// Create object select
		this.createSelectObject();

		// Create edit object panel
		this.createEditObjectPanel();

		// Set listeners
		this.canvas.onmousemove = (e) => { e.preventDefault(); e.stopPropagation(); that.updateCursor(e) };
		this.canvas.onmousedown = (e) => { e.preventDefault(); e.stopPropagation(); that.mouseDown(e) };
		this.canvas.onmouseup = (e) => { e.preventDefault(); e.stopPropagation(); that.mouseUp(e) };
		this.canvas.onmouseout = (e) => { e.preventDefault(); e.stopPropagation(); that.mouseOut(e) };
		document.getElementById(LEVEL_EDITOR_VARS.SELECT_CLASS_ID).onchange = (e) => { e.preventDefault(); e.stopPropagation(); that.getDrawingObject(); };
		document.getElementById(LEVEL_EDITOR_VARS.DRAW_BUTTON_ID).onclick = (e) => { e.preventDefault(); e.stopPropagation(); that.drawClicked(); };
		document.getElementById(LEVEL_EDITOR_VARS.SELECT_OBJECT_ID).onchange = (e) => { e.preventDefault(); e.stopPropagation(); that.selectPlacedObject(); };

		// State
		this.setDragging(false);
		this.setDraggable(true);
		this.setDrawing(false);

		// Draw
		this.draw();
	}

	getClassReference(name) {
		return CLASS_REFERENCES[name];
	}

	/**
	 * Get class references to create objects from
	 */
	getClassReferences() {
		var keys = Object.keys(CLASS_REFERENCES);
		this.types = [];

		if (keys.length === 0) {
			document.getElementById(LEVEL_EDITOR_VARS.TOOLBAR_ID).innerHTML = "No class references...";
			return;
		}

		// Collect types
		for (let i = 0; i < keys.length; i++) {
			var obj = CLASS_REFERENCES[keys[i]],
				typeList = this.types.filter(x => x.type === obj.type);
			// Add type 
			if (typeList.length === 0) {
				this.types.push({
					type: obj.type,
					references: [{
						name: keys[i],
						object: obj
					}]
				});
			} else {
				typeList[0].references.push({name: keys[i], object: obj});
			}
		}

		// Form selects
		var select = document.createElement("select");
		select.id = LEVEL_EDITOR_VARS.SELECT_CLASS_ID;

		for (let i = 0; i < this.types.length; i++) {
			var optionGroup = document.createElement("optgroup");
			optionGroup.label = this.types[i].type;

			for (let j = 0; j < this.types[i].references.length; j++) {
				var option = document.createElement("option");
				option.value = this.types[i].references[j].name;
				option.text = this.types[i].references[j].name;
				optionGroup.appendChild(option);
			}

			select.appendChild(optionGroup);
		}

		// Add select to toolbar
		document.getElementById(LEVEL_EDITOR_VARS.TOOLBAR_ID).appendChild(select);

		// Draw button
		var button = document.createElement("button");
		button.type = "button";
		button.id = LEVEL_EDITOR_VARS.DRAW_BUTTON_ID;
		document.getElementById(LEVEL_EDITOR_VARS.TOOLBAR_ID).appendChild(button);
	}

	/**
	 * Create select field for objects once placed
	 */
	createSelectObject() {
		var select = document.createElement("select");
		select.id = LEVEL_EDITOR_VARS.SELECT_OBJECT_ID;

		var option = document.createElement("option");
		option.value = LEVEL_EDITOR_VARS.DEFAULT_SELECT_OBJECT;
		option.text = LEVEL_EDITOR_VARS.DEFAULT_SELECT_OBJECT;
		select.appendChild(option);

		document.getElementById(LEVEL_EDITOR_VARS.TOOLBAR_ID).appendChild(select);
	}

	createEditObjectPanel() {
		var that = this,
			div = document.createElement("div");
		div.id = LEVEL_EDITOR_VARS.EDIT_OBJECT_DIV;
		div.style.display = "none";

		// Move button
		var move = document.createElement("button");
		move.innerHTML = "Move";
		move.onclick = function () { that.moveSelectedObject(); };
		div.appendChild(move);

		// Re-add to level button
		var reAdd = document.createElement("button");
		reAdd.innerHTML = "Re-Add to Level";
		reAdd.onclick = function () { that.reAddSelectedObject(); };
		div.appendChild(reAdd);

		// Delete from level button
		var deleteObj = document.createElement("button");
		deleteObj.innerHTML = "Delete";
		deleteObj.onclick = function () { that.deleteSelectedObject(); };
		div.appendChild(deleteObj);

		document.getElementById(LEVEL_EDITOR_VARS.TOOLBAR_ID).appendChild(div);
	}

	moveSelectedObject() {
		var selectedValue = document.getElementById(LEVEL_EDITOR_VARS.SELECT_OBJECT_ID).value,
			objectName = selectedValue.match(/[\w-.]+/g)[0];

		if (selectedValue === LEVEL_EDITOR_VARS.DEFAULT_SELECT_OBJECT) {
			return;
		}

		this.deleteSelectedObject();

		// Set selected and force to draw
		document.getElementById(LEVEL_EDITOR_VARS.SELECT_CLASS_ID).value = objectName;
		this.getDrawingObject();
		this.setDrawing(true);

		this.draw(true);

		document.getElementById(LEVEL_EDITOR_VARS.EDIT_OBJECT_DIV).style.display = "none";
	}

	reAddSelectedObject() {
		var selectedValue = document.getElementById(LEVEL_EDITOR_VARS.SELECT_OBJECT_ID).value,
			child = this.level.getChildById(selectedValue),
			reference = this.getClassReference(selectedValue.match(/[\w-.]+/g)[0]);

		if (selectedValue === LEVEL_EDITOR_VARS.DEFAULT_SELECT_OBJECT) {
			return;
		}

		// Delete
		this.deleteSelectedObject();

		// Add
		reference.addToLevel(this.level, child, reference.options);
		var option = document.createElement("option");
		option.value = child.id;
		option.text = child.id;
		document.getElementById(LEVEL_EDITOR_VARS.SELECT_OBJECT_ID).appendChild(option);

		this.draw(true);

		document.getElementById(LEVEL_EDITOR_VARS.EDIT_OBJECT_DIV).style.display = "none";
	}

	deleteSelectedObject() {
		var select = document.getElementById(LEVEL_EDITOR_VARS.SELECT_OBJECT_ID),
			selectedValue = select.value;

		if (selectedValue === LEVEL_EDITOR_VARS.DEFAULT_SELECT_OBJECT) {
			return;
		}

		this.level.removeChild(this.level.getChildById(selectedValue));

		for (let i = 0; i < select.length; i++) {
			if (select[i].value === selectedValue) {
				select.remove(i);
				break;
			}
		}

		this.draw(true);

		document.getElementById(LEVEL_EDITOR_VARS.EDIT_OBJECT_DIV).style.display = "none";
	}

	/**
	 * Set state of the editor to dragging the map around
	 */
	setDragging(value, e) {
		this.dragging = value;

		if (!this.dragging && this.dragFrom !== undefined) {
			var diff = MouseEventHandlers.pointDifference(this.dragFrom, this.formatPosition(MouseEventHandlers.getMousePosition(this.canvas, e)));
			this.position = {x: this.originalPosition.x - diff.x, y: this.originalPosition.y - diff.y};
		}

		this.originalPosition = (this.dragging) ? this.position : undefined;
		this.dragFrom = (this.dragging) ? this.formatPosition(MouseEventHandlers.getMousePosition(this.canvas, e)) : undefined;
	}

	/**
	 * Update dragging state using the canvas-normalized mouse position
	 */
	drag(position) {
		var diff = MouseEventHandlers.pointDifference(this.dragFrom, position);
		this.position = {x: this.originalPosition.x - diff.x, y: this.originalPosition.y - diff.y};
		this.draw();
	}

	/**
	 * Update the map's position based on the desired value
	 */
	drawDrag(diff) {
		this.position = {
			x: this.position.x + diff.x,
			y: this.position.y + diff.y
		};
		this.nextDrawDrag = new Date().getTime() + LEVEL_EDITOR_VARS.DRAW_DRAG_RATE;
	}

	/**
	 * Allow to map to be dragged when clicked
	 */
	setDraggable(value) {
		this.draggable = value;
	}

	/**
	 * Set the editor state to drawing or not (placing objects on the map)
	 */
	setDrawing(value) {
		this.drawing = value;
		document.getElementById(LEVEL_EDITOR_VARS.DRAW_BUTTON_ID).innerHTML = (this.drawing) ? "Cancel" : "Draw";

		// Disable or enabled draggable
		this.setDraggable(!this.drawing);

		if (this.drawing && this.drawingObject === undefined) {
			this.getDrawingObject();
		} else if (!this.drawing) {
			this.nearestSnapGrid = undefined;
		}
	}

	/**
	 * Set the ability to drag a drawing for generated class references (like tiles)
	 */
	setDrawDragging(value, e) {
		if (this.drawDragging && !value) {
			this.generateCurrentObject();
		}

		this.drawDragging = value;

		if (this.drawDragging && e !== undefined) {
			var position = this.formatPosition(MouseEventHandlers.getMousePosition(this.canvas, e));
			// relative to canvas
			this.drawDraggingStartPosition = position;
			// non-relative, based on map
			this.drawDraggingMapStartPosition = this.canvasToMapPosition(position);
			// time till next draw drag computations
			this.nextDrawDrag = 0;
		} else {
			this.drawDraggingStartPosition = undefined;
			this.drawDraggingMapStartPosition = undefined;
		}
	}

	/**
	 * Draw button clicked
	 */
	drawClicked() {
		this.setDrawing(!this.drawing);
		this.draw(true);
	}

	/**
	 * Get the current class reference to be drawn
	 */
	getDrawingObject() {
		// Find image
		var selectedValue = document.getElementById(LEVEL_EDITOR_VARS.SELECT_CLASS_ID).value,
			reference = undefined;

		for (let i = 0; i < this.types.length; i++) {
			for (let j = 0; j < this.types[i].references.length; j++) {
				if (this.types[i].references[j].name === selectedValue) {
					reference = this.types[i].references[j].object;
					break;
				}
			}
		}

		if (reference === undefined) {
			console.error("Invalid class reference selected for drawing...");
			this.drawingObject = undefined;
			return;
		}

		var displayObject = undefined,
			that = this,
			pivotOffset = {
				x: (reference.pivot !== undefined) ? reference.pivot.x : 0,
				y: (reference.pivot !== undefined) ? reference.pivot.y : 0
			},
			generateParams = undefined;

		// Get display object
		if (reference.constructor !== undefined && typeof(reference.constructor) === "function") {
			// Construct
			displayObject = reference.constructor();
			var oldOnload = displayObject.displayImage.onload;
			displayObject.displayImage.onload = function () {
				oldOnload();
				that.draw(true);
			};
		} else if (reference.generate !== undefined && typeof(reference.generate) === "function" && reference.generateParams >= 0) {
			// Generate
			generateParams = reference.generateParamsEditorOption.map(x => LEVEL_EDITOR_VARS.DEFAULT_GENERATE_PARMAS[x]);
			displayObject = reference.generate(...generateParams);
		}

		// Set centered position
		displayObject.setPosition({
			x: this.dimensions.width / 2 - pivotOffset.x, 
			y: this.dimensions.height / 2 - pivotOffset.y
		});

		// Create drawingObject for use
		this.drawingObject = {
			name: selectedValue,
			displayObject: displayObject,
			reference: reference,
			generateParams: generateParams
		};

		// If draw not clicked, let's just click it
		if (!this.drawing) {
			this.setDrawing(true);
		}
	}

	regenerateDrawingObject(generateParams) {
		// Get display object
		var position = this.drawingObject.displayObject.position;
		this.drawingObject.displayObject = this.drawingObject.reference.generate(...generateParams);

		// Set to old position
		this.drawingObject.displayObject.setPosition(position);

		// Set params
		this.drawingObject.generateParams = generateParams;
	}

	/**
	 * Place the current class reference after click
	 */
	generateCurrentObject() {
		// Shift to map coordinates
		this.drawingObject.displayObject.position = this.canvasToMapPosition(this.drawingObject.displayObject.position);

		// Assign id
		this.drawingObject.displayObject.id = this.getDrawingObjectForParser();
		console.log("Object[" + this.drawingObject.displayObject.id + "] added to level");

		// Add to select
		var option = document.createElement("option");
		option.value = this.drawingObject.displayObject.id;
		option.text = this.drawingObject.displayObject.id;
		document.getElementById(LEVEL_EDITOR_VARS.SELECT_OBJECT_ID).appendChild(option);

		// Create and add to level
		this.drawingObject.reference.addToLevel(this.level, this.drawingObject.displayObject, this.drawingObject.reference.options);

		// Set drawable false
		this.drawingObject = undefined;
		this.setDrawing(false);
		this.draw(true);
	}

	/**
	 * Get the encoding used by the level parser for the current drawing object
	 */
	getDrawingObjectForParser() {
		var id = this.drawingObject.name + " ";

		if (this.drawingObject.generateParams !== undefined) {
			for (let i = 0; i < this.drawingObject.generateParams.length; i++) {
				id += this.drawingObject.generateParams[i] + " ";
			}
		}

		// Position
		id += "position " + this.drawingObject.displayObject.position.x + " " + this.drawingObject.displayObject.position.y + " ";

		// Ending token
		return id + "| ";
	}

	/**
	 * Select an object already placed on the level
	 */
	selectPlacedObject() {
		var selectedValue = document.getElementById(LEVEL_EDITOR_VARS.SELECT_OBJECT_ID).value;
		
		if (selectedValue === LEVEL_EDITOR_VARS.DEFAULT_SELECT_OBJECT) {
			document.getElementById(LEVEL_EDITOR_VARS.EDIT_OBJECT_DIV).style.display = "none";
			return;
		}

		document.getElementById(LEVEL_EDITOR_VARS.EDIT_OBJECT_DIV).style.display = "inline-block";
	}

	/** 
	 * Set the nearest snap grid
	 */
	setNearestSnapGrid(position) {
		var pivot = {
			x: (this.drawingObject.reference.pivot !== undefined) ? this.drawingObject.reference.pivot.x : 0,
			y: (this.drawingObject.reference.pivot !== undefined) ? this.drawingObject.reference.pivot.y : 0,
		};

		let xPos = position.x + this.position.x - pivot.x,
			xMod = xPos % LEVEL_EDITOR_VARS.VISIBLE_GRID_COL_SEPARATION,
			yPos = position.y + this.position.y - pivot.y,
			yMod = yPos % LEVEL_EDITOR_VARS.VISIBLE_GRID_ROW_SEPARATION;

		if (Math.abs(xMod) >= LEVEL_EDITOR_VARS.VISIBLE_GRID_COL_SEPARATION / 2) {
			xMod += ((xMod < 0) ? 1 : -1) * LEVEL_EDITOR_VARS.VISIBLE_GRID_COL_SEPARATION;
		}

		if (Math.abs(yMod) >= LEVEL_EDITOR_VARS.VISIBLE_GRID_ROW_SEPARATION / 2) {
			yMod += ((yMod < 0) ? 1 : -1) * LEVEL_EDITOR_VARS.VISIBLE_GRID_ROW_SEPARATION;
		}

		// Test non-snap
		if (Math.abs(xMod) > LEVEL_EDITOR_VARS.SNAP_GRID_RADIUS || Math.abs(yMod) > LEVEL_EDITOR_VARS.SNAP_GRID_RADIUS) {
			this.nearestSnapGrid = undefined;
			return;
		}

		// Relative to canvas
		this.nearestSnapGrid = {x: xPos - xMod - this.position.x, y: yPos - yMod - this.position.y};
		
		// Snap! (relative to canvas)
		this.drawingObject.displayObject.position = this.nearestSnapGrid;
	}

	/**
	 * Update cursor information based on state of the editor
	 */
	updateCursor(e) {
		var position = this.formatPosition(MouseEventHandlers.getMousePosition(this.canvas, e));

		if (this.dragging) {
			// Dragging
			this.drag(position);
			this.setPositionDisplay();
		} else if (this.drawDragging) {
			// Check if time to do this
			if (new Date().getTime() < this.nextDrawDrag) {
				return;
			}

			// Draw dragging
			var diffMapPosition = this.formatPosition(MouseEventHandlers.scaleUnitVector(
										MouseEventHandlers.pointDifference(this.drawDraggingStartPosition, position),
										LEVEL_EDITOR_VARS.DRAW_DRAG_SPEED)),
				differenceInGenParams = false,
				absPositionDiff = MouseEventHandlers.pointDifference(this.drawDraggingMapStartPosition, this.canvasToMapPosition(position)),
				that = this;

			// Shift map in direction from starting point
			this.drawDrag(diffMapPosition);

			// Recompute the generated problems based on mouse position
			var computedGenerateParams = this.drawingObject.reference.generateParamsEditorOption.map(function (option) {
				switch (option) {
					case "Exceed-Width":
						var numCols = Math.ceil(absPositionDiff.x / that.drawingObject.reference.exceedWidth);
						return (numCols > 0) ? numCols : 1;
					case "Exceed-Height":
						var numRows = Math.ceil(absPositionDiff.y / that.drawingObject.reference.exceedHeight);
						return (numRows > 0) ? numRows : 1;
					default:
						return 0;
				}
			});

			// Determine if we need to regenerate the object
			for (let i = 0; i < computedGenerateParams.length; i++) {
				if (computedGenerateParams[i] !== this.drawingObject.generateParams[i]) {
					differenceInGenParams = true;
					this.drawingObject.generateParams[i] = computedGenerateParams[i];
				}
			}

			// Regenerate drawing object (if needed)
			if (differenceInGenParams) {
				this.regenerateDrawingObject(computedGenerateParams);
			}
			
			// Move position of display object (relative)
			this.drawingObject.displayObject.position = {
				x: this.drawingObject.displayObject.position.x - diffMapPosition.x,
				y: this.drawingObject.displayObject.position.y - diffMapPosition.y
			};

			// Move snap grid too
			if (this.nearestSnapGrid !== undefined) {
				this.nearestSnapGrid = this.drawingObject.displayObject.position;
			}
			
			// Draw it
			this.draw();
		} else if (this.drawing) {
			// Drawing

			// Move drawing object to follow mouse (position relative to canvas)
			var pivotOffset = {
				x: (this.drawingObject.reference.pivot !== undefined) ? this.drawingObject.reference.pivot.x : 0,
				y: (this.drawingObject.reference.pivot !== undefined) ? this.drawingObject.reference.pivot.y : 0
			};
			this.drawingObject.displayObject.position = {
				x: position.x - pivotOffset.x, 
				y: position.y - pivotOffset.y
			};

			// Get nearest snap grid
			this.setNearestSnapGrid(position);

			this.draw();
		} else {
			this.setPositionDisplay(position);
		}
	}

	mouseDown(e) {
		if (this.draggable) {
			// Start dragging
			this.setDraggable(false);
			this.setDragging(true, e);
		} else if (this.drawing) {
			// Create object (if constructed)
			if (this.drawingObject.reference.generate !== undefined && typeof(this.drawingObject.reference.generate) === "function") {
				this.setDrawDragging(true, e);
			} else {
				this.generateCurrentObject();
			}
		}
	}

	mouseUp(e) {
		if (this.dragging) {
			// Done dragging
			this.setDragging(false, e);
			this.setDraggable(true);
			this.draw(true);
		} else if (this.drawDragging) {
			// Done drawing the generated class reference
			this.setDrawDragging(false, e);
		}
	}

	mouseOut(e) {
		if (this.dragging) {
			// Done dragging
			this.setDragging(false, e);
			this.setDraggable(true);
			this.draw(true);
		} else if (this.drawDragging) {
			// Done drawing the generated class reference
			this.setDrawDragging(false, e);
		}
	}

	setPositionDisplay(position) {
		if (position === undefined) {
			document.getElementById(LEVEL_EDITOR_VARS.POSITION_DISPLAY_ID).innerHTML = "( --, --)";
			return;
		}

		var mapPosition = this.canvasToMapPosition(position);
		document.getElementById(LEVEL_EDITOR_VARS.POSITION_DISPLAY_ID).innerHTML = 
			"(" + mapPosition.x + ", " + mapPosition.y + ")";
	}

	canvasToMapPosition(position) {
		return {
			x: this.formatNumber(position.x + this.position.x),
			y: this.formatNumber(position.y + this.position.y)
		};
	}

	formatPosition(position) {
		return {
			x: this.formatNumber(position.x),
			y: this.formatNumber(position.y)
		};
	}

	formatNumber(num) {
		return Math.floor(num);
	}

}