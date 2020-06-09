ctx = canvas.getContext('2d')
canvasWidth = canvasHeight = 0

cubeScale = 100
cubeSize = 0
sides = 6
cube = []

colors = [
	'white',
	'green',
	'red',
	'blue',
	'orange',
	'yellow'
]

renderer = () => console.log('no renderer')

function lerp(v0, v1, t) {
	return (1 - t) * v0 + t * v1;
}

function vectorLerp(a, b, t) {
	return a.map((item, index) => {
		return lerp(a[index], b[index], t)
	})
}

function setCube(n) {
	cubeSize = n
	cube = []
	for (let side = 0; side < sides; side++) {
		cube.push([])
		for (let row = 0; row < n; row++) {
			for (let col = 0; col < n; col++) {
				cube[side].push(side)
			}
		}
	}
	makeRenderer(n)
}

function turnR(layer) {
	cube[3].reverse()
	for (let row = 0; row < cubeSize; row++) {
		let i = row * cubeSize + layer
		let tmp = cube[0][i]
		cube[0][i] = cube[1][i]
		cube[1][i] = cube[5][i]
		cube[5][i] = cube[3][i]
		cube[3][i] = tmp
	}
	cube[3].reverse()

	if (layer == 0) {
		turnJustSide(4)
		turnJustSide(4)
		turnJustSide(4)
	}
	if (layer == cubeSize - 1) {
		turnJustSide(2)
	}
}

function isSolved() {
	for(let side = 0; side < sides; side++) {
		for(let i = 0; i < cubeSize * cubeSize; i++) {
			if(cube[side][i] !== side) {
				return false
			}
		}
	}
	return true
}

function rotateY() {
	turnJustSide(0)
	turnJustSide(5)
	turnJustSide(5)
	turnJustSide(5)
	for (let i = 0; i < cubeSize * cubeSize; i++) {
		let tmp = cube[1][i]
		cube[1][i] = cube[2][i]
		cube[2][i] = cube[3][i]
		cube[3][i] = cube[4][i]
		cube[4][i] = tmp
	}
}

function rotateXPrime() {
	for (let i = 0; i < cubeSize; i++) {
		turnR(i)
	}
}


function rotateZ() {
	rotateY()
	rotateXPrime()
	rotateXPrime()
	rotateXPrime()
	rotateY()
	rotateY()
	rotateY()
}

function turnF(layer) {
	rotateY()
	rotateY()
	rotateY()
	turnR(layer)
	rotateY()
}

function turnU(layer) {
	rotateXPrime()
	turnF(layer)
	turnF(layer)
	turnF(layer)
	rotateXPrime()
	rotateXPrime()
	rotateXPrime()
}

function turnJustSide(side) {
	let odd = cubeSize % 2
	let squareSize = Math.ceil(cubeSize / 2)
	let otherDimension = odd ? squareSize - 1 : squareSize
	for (let row = 0; row < squareSize; row++) {
		for (let col = 0; col < otherDimension; col++) {
			let places = [
				row * cubeSize + col,
				(cubeSize - 1 - col) * cubeSize + row,
				(cubeSize - 1 - row) * cubeSize + cubeSize - 1 - col,
				col * cubeSize + (cubeSize - 1 - row)
			]
			tmp = cube[side][places[0]]
			cube[side][places[0]] = cube[side][places[1]]
			cube[side][places[1]] = cube[side][places[2]]
			cube[side][places[2]] = cube[side][places[3]]
			cube[side][places[3]] = tmp
		}
	}
}

function scalar(vector, scalar) {
	return vector.map(item => item * scalar)
}

/*
2         1
 ..     ..
   .. ..
     .
 	 .
 	 .
     0
*/
axisVectors = [
	[0, 1],
	[Math.cos(Math.PI * 2 * (-1 / 4 + 1 / 3)), -Math.sin(Math.PI * 2 * (-1 / 4 + 1 / 3))],
	[Math.cos(Math.PI * 2 * (-1 / 4 + 2 / 3)), -Math.sin(Math.PI * 2 * (-1 / 4 + 2 / 3))]
]
axisMatrix = []
for (let i = 0; i < axisVectors[0].length; i++) {
	let row = []
	for (let j = 0; j < axisVectors.length; j++) {
		row.push(axisVectors[j][i])
	}
	axisMatrix.push(row)
}

function path(vectors, color) {
	ctx.beginPath();
	for (let i in vectors) {
		let resultVector = math.multiply(axisMatrix, vectors[i])
		if (i == 0) {
			ctx.moveTo(resultVector[0], resultVector[1])
		} else {
			ctx.lineTo(resultVector[0], resultVector[1])
		}
	}
	ctx.closePath();
	ctx.fillStyle = color
	ctx.strokeStyle = '#000'
	ctx.lineWidth = 0.02
	ctx.fill()
	ctx.stroke()
}

function vec2Circle(vector) {
	ctx.beginPath();
	ctx.arc(vector[0], vector[1], .2, 0, 2 * Math.PI);
	ctx.lineWidth = 0.05
	ctx.strokeStyle = '#f0f'
	ctx.stroke()
}

function circle(vector) {
	let pos = math.multiply(axisMatrix, vector)
	vec2Circle(pos)
}

function debugCircle(vector) {
	ctx.save()
	ctx.translate(canvasWidth / 2, canvasHeight / 2)
	ctx.scale(cubeScale, cubeScale)
	circle(vector)
	ctx.restore()
}

function debugVec2Circle(vector) {
	ctx.save()
	ctx.translate(canvasWidth / 2, canvasHeight / 2)
	ctx.scale(cubeScale, cubeScale)
	vec2Circle(vector)
	ctx.restore()
}

const uBox = [
	[-1, 1, 1],
	[-1, 1, -1],
	[-1, -1, -1],
	[-1, -1, 1]
]
const fBox = [
	[-1, -1, 1],
	[-1, -1, -1],
	[1, -1, -1],
	[1, -1, 1]
]
const rBox = [
	[-1, -1, -1],
	[-1, 1, -1],
	[1, 1, -1],
	[1, -1, -1]
]

function makeRenderer(n) {
	uBoxes = {}
	fBoxes = {}
	rBoxes = {}

	// box - [top-left, top-right, bottom-right, bottom-left]

	function toBox(box, x, y) {
		return vectorLerp(
			vectorLerp(box[0], box[1], x),
			vectorLerp(box[3], box[2], x),
			y
		)
	}

	function toBoxes(box, xMin, xMax, yMin, yMax) {
		return [
			toBox(box, xMin, yMin),
			toBox(box, xMax, yMin),
			toBox(box, xMax, yMax),
			toBox(box, xMin, yMax)
		]
	}

	for (let row = 0; row < n; row++) {
		for (let col = 0; col < n; col++) {
			let i = row * n + col

			let xMin = col / n
			let xMax = (col + 1) / n
			let yMin = row / n
			let yMax = (row + 1) / n

			uBoxes[i] = toBoxes(uBox, xMin, xMax, yMin, yMax)
			fBoxes[i] = toBoxes(fBox, xMin, xMax, yMin, yMax)
			rBoxes[i] = toBoxes(rBox, xMin, xMax, yMin, yMax)
		}
	}


	renderer = function(cube) {
		for (let i in cube[0]) {
			path(uBoxes[i], colors[cube[0][i]])
			path(fBoxes[i], colors[cube[1][i]])
			path(rBoxes[i], colors[cube[2][i]])
		}
	}
}

function render() {
	ctx.fillStyle = "#000"
	ctx.fillRect(0, 0, canvasWidth, canvasHeight)
	ctx.save()
	ctx.translate(canvasWidth / 2, canvasHeight / 2)
	ctx.scale(cubeScale, cubeScale)

	renderer(cube)

	ctx.restore()

	document.title = isSolved() ? 'Press S to scramble' : 'IsoCubeSim.js'
}

function resize() {
	canvasWidth = window.innerWidth
	canvasHeight = window.innerHeight
	canvas.width = canvasWidth
	canvas.height = canvasHeight
	render()
}

// https://jsfiddle.net/PerroAZUL/zdaY8/1/
function ptInTriangle(p, p0, p1, p2) {
	var A = 1 / 2 * (-p1[1] * p2[0] + p0[1] * (-p1[0] + p2[0]) + p0[0] * (p1[1] - p2[1]) + p1[0] * p2[1]);
	var sign = A < 0 ? -1 : 1;
	var s = (p0[1] * p2[0] - p0[0] * p2[1] + (p2[1] - p0[1]) * p[0] + (p0[0] - p2[0]) * p[1]) * sign;
	var t = (p0[0] * p1[1] - p0[1] * p1[0] + (p0[1] - p1[1]) * p[0] + (p1[0] - p0[0]) * p[1]) * sign;

	return s > 0 && t > 0 && (s + t) < 2 * A * sign;
}



function ptInQuad(p, quad) {
	return ptInTriangle(p, quad[0], quad[1], quad[2]) || ptInTriangle(p, quad[0], quad[3], quad[2])
}

setCube(parseInt(prompt('Enter size of cube:', '3')))
render()

window.onresize = resize

mouseX = 0
mouseY = 0
clickedQuad = null

document.body.onmousedown = function(e) {
    e.preventDefault()
	clickedQuad = null
	mouseX = e.offsetX
	mouseY = e.offsetY

	fixedCoords = scalar([
		mouseX - canvasWidth / 2,
		mouseY - canvasHeight / 2
	], 1 / cubeScale)

	for (let i = 0; i < cubeSize * cubeSize; i++) {
		if (
			ptInQuad(
				fixedCoords,
				uBoxes[i].map(vector => math.multiply(axisMatrix, vector))
			)
		) {
			clickedQuad = [0, i]
		}
		if (
			ptInQuad(
				fixedCoords,
				fBoxes[i].map(vector => math.multiply(axisMatrix, vector))
			)
		) {
			clickedQuad = [1, i]
		}
		if (
			ptInQuad(
				fixedCoords,
				rBoxes[i].map(vector => math.multiply(axisMatrix, vector))
			)
		) {
			clickedQuad = [2, i]
		}
	}
}

document.body.oncontextmenu = function(e) {
    e.preventDefault()
    return false
}

document.body.onmouseup = function(e) {
    e.preventDefault()
	if (clickedQuad) {
		let changeX = e.offsetX - mouseX
		let changeY = e.offsetY - mouseY

		let distance = Math.sqrt(changeX * changeX + changeY * changeY)

		let angle
		if (distance != 0) {
			angle = Math.asin(-changeY / distance)
			if (changeX < 0) {
				angle = Math.PI - angle
			}
			angle /= Math.PI * 2
			// start from bottom
			angle -= .75
			if (angle < 1) {
				angle += 1
			}
		}

		let mode = angle * 6

		// U face

		if (clickedQuad[0] == 0) {
			if (mode >= 4.5) {
				if (e.ctrlKey) {
					rotateXPrime()
					rotateXPrime()
					rotateXPrime()
				} else {
					let layer = clickedQuad[1] % cubeSize
					turnR(layer)
					turnR(layer)
					turnR(layer)
				}
			}
			if (mode >= 3 && mode < 4.5) {
				if (e.ctrlKey) {
					rotateZ()
					rotateZ()
					rotateZ()
				} else {
					let layer = Math.floor(clickedQuad[1] / cubeSize)
					turnF(layer)
					turnF(layer)
					turnF(layer)
				}
			}
			if (mode >= 1.5 && mode < 3) {
				if (e.ctrlKey) {
					rotateXPrime()
				} else {
					let layer = clickedQuad[1] % cubeSize
					turnR(layer)
				}
			}
			if (mode >= 0 && mode < 1.5) {
				if (e.ctrlKey) {
					rotateZ()
				} else {
					let layer = Math.floor(clickedQuad[1] / cubeSize)
					turnF(layer)
				}
			}
		}
		// F face
		if (clickedQuad[0] == 1) {
			if (mode >= 3.5 && mode < 5) {
				if (e.ctrlKey) {
					rotateY()
				} else {
					let layer = Math.floor(clickedQuad[1] / cubeSize)
					turnU(layer)
				}
			}
			if (mode >= 2 && mode < 3.5) {
				if (e.ctrlKey) {
					rotateXPrime()
				} else {
					let layer = clickedQuad[1] % cubeSize
					turnR(layer)
				}
			}
			if (mode >= .5 && mode < 2) {
				if (e.ctrlKey) {
					rotateY()
					rotateY()
					rotateY()
				} else {
					let layer = Math.floor(clickedQuad[1] / cubeSize)
					turnU(layer)
					turnU(layer)
					turnU(layer)
				}
			}
			if (mode >= 0 && mode < .5 || mode >= 5) {
				if (e.ctrlKey) {
					rotateXPrime()
					rotateXPrime()
					rotateXPrime()
				} else {
					let layer = clickedQuad[1] % cubeSize
					turnR(layer)
					turnR(layer)
					turnR(layer)
				}
			}
		}
		// F face
		if (clickedQuad[0] == 2) {
			if (mode >= 1 && mode < 2.5) {
				if (e.ctrlKey) {
					rotateY()
					rotateY()
					rotateY()
				} else {
					let layer = Math.floor(clickedQuad[1] / cubeSize)
					turnU(layer)
					turnU(layer)
					turnU(layer)
				}
			}
			if (mode >= 2.5 && mode < 4) {
				if (e.ctrlKey) {
					rotateZ()
					rotateZ()
					rotateZ()
				} else {
					let layer = cubeSize - 1 - clickedQuad[1] % cubeSize
					turnF(layer)
					turnF(layer)
					turnF(layer)
				}
			}
			if (mode >= 4 && mode < 5.5) {
				if (e.ctrlKey) {
					rotateY()
				} else {
					let layer = Math.floor(clickedQuad[1] / cubeSize)
					turnU(layer)
				}
			}
			if (mode >= 0 && mode < 1 || mode >= 5.5) {
				if (e.ctrlKey) {
					rotateZ()
				} else {
					let layer = cubeSize - 1 - clickedQuad[1] % cubeSize
					turnF(layer)
				}
			}
		}
		render()
	}
}

function randint(max) {
	return Math.floor(Math.random() * max)
}

function choose(list) {
	return list[randint(list.length)]
}

function scramble() {
	for(let i = 0; i < cubeSize * cubeSize; i++) {
		for(let turns = 0; turns < 4; turns++) {
			choose([turnU, turnF, turnR])(randint(cubeSize))
		}

		choose([rotateXPrime, rotateY, rotateZ])()
	}
	render()
}

window.onload = function() {
	resize()
}

window.onkeydown = function(e) {
	if(e.keyCode == 83) {
		scramble()
	}
}
