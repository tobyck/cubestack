var allMoves = [
    "R", "R'", "L", "L'", "L2", "R2", "U", 
    "D", "D'", "F", "F'", "B", "B'", "D2", 
    "F2", "B2", "r", "r'", "r2", "d", "u", 
    "u'", "l2", "u2", "l", "d2", "U2", "f", 
    "f'", "M2", "b", "b2", "l'", "d'", "U'", 
    "b'", "f2", "y2", "S2", "S", "S'", "M", 
    "M2", "M'", "E", "E2", "E'",  "x", "x2", 
    "x'", "y", "y'", "z", "z2", "z'"
];

var base36map = [
    "R", "R'", "R2", "r", "r'", "r2",
    "L", "L'", "L2", "l", "l'", "l2",
    "U", "U'", "U2", "u", "u'", "u2",
    "D", "D'", "D2", "d", "d'", "d2",
    "F", "F'", "F2", "f", "f'", "f2",
    "B", "B'", "B2", "b", "b'", "b2"
];

var highlight = (code) => {
    if (code.replace(/\s\s|\n/g, " ").split(" ").filter(move => !!move).filter(move => !allMoves.includes(move)).length > 0) {
        return `<span style="color:#fa3c3c">${code.replaceAll("\n", "<br>")}</span>`;
    } else {
        var state = "",
            output = "";

        var addSingleMove = (move, color) => {
            if (state != "string" && state != "number") {
                output += `<span style="color:${color}">${move}</span>`;
            } else {
                if (state == "number" || state == "string") {
                    if (base36map.concat(state == "number" ? ["M2"] : []).includes(move)) {
                        output += move;
                    } else {
                        output += `<span style="color:#fa3c3c">${move}</span>`;
                    }
                } else {
                    output += move;
                }
            }
        }

        for (var move of code.split(/(?=\s|\n)|(?<=\s|\n)/g)) {
            if (move == "M") { // numbers
                state = "number";
                output += `<span style="color:#b0cfa4">${move}`;
            } else if (move == "M'") {
                if (state == "number") {
                    output += `M'</span>`;
                    state = "";
                } else {
                    output += `<span style="color:#fa3c3c">${move}`;
                }
            } else if (move == "S") { // strings
                state = "string";
                output += `<span style="color:#d98e73">${move}`;
            } else if (move == "S'") {
                if (state == "string") {
                    output += `S'</span>`;
                    state = "";
                } else {
                    output += `<span style="color:#fa3c3c">${move}`;
                }
            } else if (move == "E" || move == "E'") { // lists
                output += `<span style="color:#ffd500">${move}</span>`;
            } else if (move == "E2") {
                output += `<span style="color:white">E2</span>`;
            } else if (allMoves.slice(0, 29).concat(["b", "f2"]).includes(move)) { // stdlib functions (plus some)
                addSingleMove(move, "#e0e07e");
            } else if ("b' M2 b2 d' l' U'".split(" ").includes(move)) { // stack modification
                addSingleMove(move, "#389edb");
            } else if ("x x2 x' y y' z z2 z' S2".split(" ").includes(move)) { // control flow
                addSingleMove(move, "#d082c4");
            } else if (move == "y2") { // loop variables
                output += `<span style="color:#89deff">y2</span>`;
            } else { // spaces and newlines
                output += move;
            }
        }

        return output.replaceAll("\n", "<br>");
    }
}