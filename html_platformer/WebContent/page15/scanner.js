function getInterestBlocks(image, color, canvasObject) {
	// draw image and get data
	var imageData = getImageData(image, canvasObject);
	// extract corners from image data, using the given color for interest objects
	var corners = findCorners(imageData, color);
	// print corner histogram
	//cornerHistogram(this);
	// extract solid blocks of interest objects, using the corners and the interest color
	var blocks = extractBlocks(imageData, corners, color);
	return blocks;
}

function getImageData(img, canvasObject) {
	// draw image
	canvasObject.context.drawImage(img,0,0);
	var width = img.naturalWidth;
	var height = img.naturalHeight;
	// obtain image pixel data
	var data = canvasObject.context.getImageData(0, 0, width, height).data;
	// clear image
	canvasObject.context.clearRect(0, 0, canvasObject.width, canvasObject.height);
	return {data: data, width: width, height: height};
}

//using the corners, create the solid blocks in the image
function extractBlocks(imageData, corners, color) {
	// project corners on x and y, obtain set of x and y points
	var projx = new Array();
	var projy = new Array();
	for (var i = 0; i < corners.length; i++) {
		projx[corners[i].x] = 1;
		projy[corners[i].y] = 1;
	}
	var x = new Array();
	for (var i = 0; i < projx.length; i++) {
		if (projx[i] == 1) {
			x[x.length] = i;
		}
	}
	var y = new Array();
	for (i = 0; i < projy.length; i++) {
		if (projy[i] == 1) {
			y[y.length] = i;
		}
	}
	// create division blocks
	var blocks = new Array();
	for (var i = 1; i < y.length; i++) {
		for (var j = 1; j < x.length; j++) {
			blocks[blocks.length] = {x0: x[j-1], y0: y[i-1], x1: x[j], y1: y[i]};
		}
	}
	// select solid blocks
	var solidBlocks = new Array();
	for (var i = 0; i < blocks.length; i++) {
		var x = (blocks[i].x0 + blocks[i].x1) / 2;
		var y = (blocks[i].y0 + blocks[i].y1) / 2;
		var pixel = getPixel(x, y, imageData);
		if (checkPixelColor(pixel, color)) {
			solidBlocks[solidBlocks.length] = blocks[i];
		}
	}
	return solidBlocks;
}

// pixel size is always 4
function getPixel(x, y, imageData) {
	x = Math.floor(x);
	y = Math.floor(y);
	var i = (y * imageData.width + x) * 4;
	if (i < imageData.height * imageData.width * 4) {
		var pixel = {r: imageData.data[i], 
				g: imageData.data[i+1], 
				b: imageData.data[i+2], 
				a: imageData.data[i+3],
				x: x,
				y: y
				};
		return pixel;
	}
	return {};
}

// returns true if pixel is of the provided color
function checkPixelColor(pixel, color) {
	return pixel.r == color.r && pixel.g == color.g && pixel.b == color.b;
}

// returns true if both pixels have the same color
function comparePixelColors(pixel1, pixel2) {
	return pixel1.r == pixel2.r && pixel1.g == pixel2.g && pixel1.b == pixel2.b;
}

function isEdgeCorner(imageData, color, x_1, y_1, x, y, x1, y1) {
	var pixel = getPixel(x, y, imageData);
	if (checkPixelColor(pixel, color)) {
		var previousPixel = getPixel(x_1, y_1, imageData);
		var nextPixel = getPixel(x1, y1, imageData);
		if (!(checkPixelColor(previousPixel, color) && checkPixelColor(nextPixel, color))) {
			return true;
		}
	}
	return false;
}

function findCorners(imageData, color) {
	var corners = new Array();
	var x = 1;
	var y = 1;
	
	// detect edge corners (changes in black-white across edge)
	for (y = 1; y < imageData.height-1; y++) {
		// find on left edge
		var x = 0;
		if (isEdgeCorner(imageData, color, x, y-1, x, y, x, y+1)) {
			corners[corners.length] = {x: x, y: y};
		}
		// find on right edge
		var x = imageData.width-1;
		if (isEdgeCorner(imageData, color, x, y-1, x, y, x, y+1)) {
			corners[corners.length] = {x: x, y: y};
		}
	}
	for (x = 1; x < imageData.width-1; x++) {
		// find on top edge
		var y = 0;
		if (isEdgeCorner(imageData, color, x-1, y, x, y, x+1, y)) {
			corners[corners.length] = {x: x, y: y};
		}
		// find on bottom edge
		var y = imageData.height-1;
		if (isEdgeCorner(imageData, color, x-1, y, x, y, x+1, y)) {
			corners[corners.length] = {x: x, y: y};
		}
	}
	// detect middle image corners
	for (y = 1; y < imageData.height-1; y++) {
		for (x = 1; x < imageData.width-1; x++) {
			var pixel = getPixel(x, y, imageData);
			if (checkPixelColor(pixel, color)) {
				// check sum of surrounding pixels
				var sum = 0;
				for (i = -1; i <= 1; i++) {
					for (j = -1; j <= 1; j++) {
						var tPixel = getPixel(x+j, y-i, imageData)
						if (checkPixelColor(tPixel, color)) {
							sum += 1;
						}
					}
				}
				if (sum == 8 || sum == 4 || sum == 5) {
					corners[corners.length] = {x: x, y: y};
				}
			} 
			
		}
	}
	// add image corners as corners
	corners[corners.length] = {x: 0, y: 0};
	corners[corners.length] = {x: 0, y: imageData.height-1};
	corners[corners.length] = {x: imageData.width-1, y: imageData.height-1};
	corners[corners.length] = {x: imageData.width-1, y: 0};
	return corners;
}