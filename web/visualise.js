/* 
Returns an object containing what the cube would look like after given moves.
*/

var generateCube = (moves) => {
    moves = moves.trim().replace(/\s{2,}|\n/g, " ")

    var cube = {
        front: Array(9).fill("green"),
        top: Array(9).fill("white"),
        left: Array(9).fill("orange"),
        bottom: Array(9).fill("yellow"),
        right: Array(9).fill("red"),
        back: Array(9).fill("blue"),
    }

    var execMove = (move) => {
        if (move == "x") {
            var temp = cube.top
            cube.top = cube.front;
            cube.front = cube.bottom;
            cube.bottom = rotate(cube.back, 2);
            cube.back = rotate(temp, 2);
            cube.left = rotate(cube.left, 3);
            cube.right = rotate(cube.right);
        } else if (move == "y") {
            var temp = cube.left
            cube.left = cube.front;
            cube.front = cube.right;
            cube.right = cube.back;
            cube.back = temp;
            cube.top = rotate(cube.top);
            cube.bottom = rotate(cube.bottom, 3);
        } else if (move == "z") {
            var temp = cube.top
            cube.top = rotate(cube.left);
            cube.left = rotate(cube.bottom);
            cube.bottom = rotate(cube.right);
            cube.right = rotate(temp);
            cube.front = rotate(cube.front);
            cube.back = rotate(cube.back, 3);
        } else if (move == "U") {
            cube.top = rotate(cube.top);
            var temp = cube.left.slice(0, 3);
            cube.left = cube.front.slice(0, 3).concat(cube.left.slice(3))
            cube.front = cube.right.slice(0, 3).concat(cube.front.slice(3))
            cube.right = cube.back.slice(0, 3).concat(cube.right.slice(3))
            cube.back = temp.concat(cube.back.slice(3))   
        }
    }

    var moveMap = {
        "x": "x",
        "x'": "x x x",
        "x2": "x x",
        "y": "y",
        "y'": "y y y",
        "y2": "y y",
        "z": "z",
        "z'": "z z z",
        "z2": "z z",
        "U": "U",
        "U'": "U U U",
        "U2": "U U",
        "D": "z2 U z2",
        "D'": "z2 U' z2",
        "D2": "z2 U2 z2",
        "R": "z' U z",
        "R'": "z' U' z",
        "R2": "z' U2 z",
        "L": "z U z'",
        "L'": "z U' z'",
        "L2": "z U2 z'",
        "F": "x U x'",
        "F'": "x U' x'",
        "F2": "x U2 x'",
        "B": "x' U x",
        "B'": "x' U' x",
        "B2": "x' U2 x",
        "M": "L' R x'",
        "M'": "L R' x",
        "M2": "L2 R2 x2",
        "E": "U D' y'",
        "E'": "U' D y",
        "E2": "U2 D2 y2",
        "S": "B F' z",
        "S'": "B' F z'",
        "S2": "B2 F2 z2",
        "u": "U E'",
        "u'": "U' E",
        "u2": "U2 E2",
        "d": "U y'",
        "d'": "U' y",
        "d2": "D2 E2",
        "r": "M' R",
        "r'": "M R'",
        "r2": "M2 R2",
        "l": "M L",
        "l'": "M' L'",
        "l2": "M2 L2",
        "f": "F S",
        "f'": "F' S'",
        "f2": "F2 S2",
        "b": "B S'",
        "b'": "B' S",
        "b2": "B2 S2",
    }

    var rotate = (array, times = 1) => {
        var toRotate = array;
        for (var time = 0; time < times; time++) {
            var newFace = [];
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    newFace.push(toRotate[6 + i - (3 * j)]);
                }
            }

            toRotate = newFace;
        }

        return toRotate;
    }

    var deepFlatten = (arr) => {
        var flat = [];
        for (var item of arr) {
            if (Array.isArray(item)) {
                flat = flat.concat(deepFlatten(item));
            } else {
                flat.push(item);
            }
        }
        
        return flat;
    }

    if (moves.split(" ").filter(move => !!move).filter(move => !(move in moveMap)).length < 1 || moves.length == 0) {
        var moves = deepFlatten(moves.split(" ").map(move => (moveMap[move] ?? "").split(" ")));
        while (moves.filter(item => !"xyzU".includes(item)).length > 0) {
            moves = deepFlatten(moves.map(item => moveMap[item].split(" ")));
        }

        for (var move of moves) execMove(move);
    } else {
        for (var face in cube) {
            cube[face] = Array(9).fill("grey");
        }
    }

    return cube;    
}