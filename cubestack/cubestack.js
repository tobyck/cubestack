/* 
Cubestack

A stack based esolang that only uses moves on a 3x3 rubiks cube.
Created by Toby Connor-Kebbell, May - June 2022.
*/

var base36map = [
    "R", "R'", "R2", "r", "r'", "r2",
    "L", "L'", "L2", "l", "l'", "l2",
    "U", "U'", "U2", "u", "u'", "u2",
    "D", "D'", "D2", "d", "d'", "d2",
    "F", "F'", "F2", "f", "f'", "f2",
    "B", "B'", "B2", "b", "b'", "b2"
];

var pad = (num) => {
    return num.toString().length == 2 ? num : "0" + num;
}

var stringToRubiks = (string) => {
    return "S " + string.split("").map(char => pad(char.charCodeAt(0).toString(36))
                        .split("").map(digit => base36map[parseInt(digit, 36)]))
                        .flat().join(" ") + " S'";
}

var rubiksToString = (rubiks) => {
    if (rubiks.slice(0, 2) == "S " && rubiks.slice(-3) == " S'") {
        if (rubiks.slice(2, -3).replace(/\s/g, "").length == 0) {
            return "";
        } else {
            return rubiks.slice(2, -3)
                     .match(/(?<=\s|^)..?\s..?(?=\s|$(?<=))/g).map(pair => pair.split(" "))
                     .map(pair => String.fromCharCode(parseInt(pair.map(move => base36map.indexOf(move)
                     .toString(36)).join(""), 36))).join("");
        }
    }
}

var numberToRubiks = (number) => {
    return "M " + number.toString().split(".").map(number => parseInt(number).toString(36)
                 .split("").map(digit => base36map[parseInt(digit, 36)]).join(" ")).join(" M2 ") + " M'";
}

var rubiksToNumber = (rubiks) => {
    if (rubiks.slice(0, 2) == "M " && rubiks.slice(-3) == " M'") {
        return parseFloat(rubiks.slice(2, -3).split(" M2 ")
                     .map(move => move.split(" ")
                     .map(move => base36map.indexOf(move).toString(36)).join(""))
                     .map(base36 => parseInt(base36, 36)).join("."));
    }
}

var allMoves = [
    // functions in stdlib.js
    "R", "R'", "L", "L'", "L2", "R2",
    "U", "D", "D'", "F", "F'", "B", 
    "B'", "D2", "F2", "B2", "r", "r'",
    "r2", "d", "u", "u'", "l2", "u2", 
    "l", "d2", "U2", "f", "f'",

    // other functions
    "M2", "b", "b2", "l'", "d'", "U'", "b'", "f2", "y2", "S2",

    // literals
    "S", "S'", "M", "M2", "M'", "E", "E2", "E'",

    // control flow
    "x", "x2", "x'", "y", "y'", "z", "z2", "z'"
];

var singleMoveCommands = allMoves.slice(0, 39),
    stdlibFunctions = allMoves.slice(0, 29);

class Token {
    constructor(type, name, moves, value = null) {
        this.type = type; // type of token e.g. "function"
        this.name = name; // name of token e.g. "add"
        this.moves = moves; // list of moves
        this.value = value;
    
        if (value == null) {
            switch (name) {
                case "string":
                    this.value = JSON.stringify(rubiksToString(moves.join(" "))).replace(/\\\\/g, "\\");
                    break;
                case "number":
                    this.value = rubiksToNumber(moves.join(" "));
                    break;
                case "list":
                    var openedLists = 0,
                    closedLists = 0,
                    token = [],
                    tokens = [];

                    moves.slice(1, -1).forEach((move, index, array) => {
                        if (move == "E") {
                            openedLists++;
                        } else if (move == "E'") {
                            closedLists++;
                        }

                        if (index == array.length - 1) {
                            token.push(move);
                        } if ((openedLists == closedLists && move == "E2") || index == array.length - 1) {
                            tokens.push(token);
                            token = [];
                        } else {
                            token.push(move);
                        } 
                    });

                    this.value = tokens.map(token => lex(token.join(" ")));
                    break;
                case "if":
                case "while loop":
                    var delimiter = name == "if" ? "x2" : "z2",
                        openedBlocks = 0,
                        closedBlocks = 0,
                        delimiterIndex;

                    moves.slice(1, -1).forEach((move, index) => {
                        if (move == delimiter[0]) {
                            openedBlocks++;
                        } else if (move == delimiter[0] + "'") {
                            closedBlocks++;
                        } else if (move == delimiter && openedBlocks == closedBlocks) {
                            delimiterIndex = index + 1;
                        }
                    });

                    this.value = [lex(moves.slice(1, delimiterIndex).join(" ")), lex(moves.slice(delimiterIndex + 1, -1).join(" "))];
                    break;
                case "for loop":
                    this.value = lex(moves.slice(1, -1).join(" "));
                    break;
            }
        }
    }
}

var lex = (code) => {
    var tokens = [],
        token = [],
        state = "";

    const BLOCKS = {
        M: "number",
        S: "string",
        E: "list",
        x: "if",
        y: "for loop",
        z: "while loop",
    }

    var invalidMoveError = () => tokens = [new Token("error", "invalid move", move, `${move} is not a valid move on a 3x3 rubiks cube`)];
    for (var move of (code ?? "").replace(/\s{2,}|\n/g, " ").split(" ").filter(move => !!move)) {
        if (Object.values(BLOCKS).includes(state)) {
            var moveForBlock = Object.keys(BLOCKS)[Object.values(BLOCKS).indexOf(state)];
            if (move == moveForBlock) {
                openedBlocks++;
                token.push(move);
            } else if (move == moveForBlock + "'") {
                closedBlocks++;
                token.push(move);
                if (openedBlocks == closedBlocks) {
                    var type;
                    if (Object.keys(BLOCKS).slice(0, 3).includes(moveForBlock)) type = "literal";
                    else type = "control flow";
                    tokens.push(new Token(type, BLOCKS[moveForBlock], token))
                    state = "";
                }
            } else {
                if (allMoves.includes(move)) {
                    token.push(move);
                } else {
                    invalidMoveError();
                }
            }
        } else {
            if (Object.keys(BLOCKS).includes(move)) {
                state = BLOCKS[move];
                token = [move];
                var openedBlocks = 1,
                    closedBlocks = 0;
            } else if (singleMoveCommands.includes(move)) {
                tokens.push(new Token("function", null, move));
            } else {
                invalidMoveError();
            }
        }
    }

    return tokens;
}

var compile = (tokens, input = "", options = {}) => {
    defaultOptions = {
        inputSplit: "\n",
        lineEnding: "\n",
        platform: "node",
        stackName: "stack",
        setup: true,
        includeStack: true,
        joinCompiled: " "
    }

    for (var key in defaultOptions) defaultOptions[key] = options[key] ?? defaultOptions[key];
    options = defaultOptions;

    if (typeof globalThis.depth == "undefined") globalThis.depth = 0;
    
    var compiled = options.includeStack ? [`var ${options.stackName} = [];`] : [];
    if (options.setup) {
        if (options.platform == "node") compiled.push("var stdlib = require(\"./stdlib.js\");");
        else if (options.platform == "web") compiled.push(`$("#output").innerText = "";`)
        compiled.push("var loopVars = {};");
    }

    var cubestackPrint = () => {
        compiled.push(
            `var toPrint = ${options.stackName}.pop() ?? "";`,
            `if (Array.isArray(toPrint)) toPrint = JSON.stringify(toPrint, null, 2);`,
        );

        if (options.platform == "node") {
            compiled.push(`process.stdout.write(toPrint + ${JSON.stringify(options.lineEnding)});`);
        } else if (options.platform == "web") {
            compiled.push(`$("#output").innerText += toPrint + ${JSON.stringify(options.lineEnding)};`);
        }
    }

    for (var token of tokens) {
        if (token.type == "literal") {
            if (token.name == "list") {
                globalThis.depth++;
                compiled.push(`var arrayToPush${globalThis.depth} = [];`);

                var listEvalOptions = structuredClone(options);
                    listEvalOptions.setup = false;
                    listEvalOptions.includeStack = false;
                    listEvalOptions.stackName = `stackCopy${globalThis.depth}`;

                for (var elem of token.value) {
                    if (elem.length == 1 && ["number", "string"].includes(elem[0].name)) {
                        compiled.push(`arrayToPush${globalThis.depth}.push(${elem[0].value});`);
                    } else {
                        compiled.push(
                            `var ${listEvalOptions.stackName} = stack.slice();`,
                            compile(elem, input, listEvalOptions),
                            `arrayToPush${globalThis.depth}.push(stackCopy${globalThis.depth}[stackCopy${globalThis.depth}.length - 1]);`
                        );
                    }
                }

                globalThis.depth--;
                if (globalThis.depth == 0) {
                    compiled.push(`stack.push(arrayToPush1);`);
                } else {
                    compiled.push(`${(token.value.length == 1 ? `arrayToPush` : `stackCopy`) + globalThis.depth}.push(arrayToPush${globalThis.depth + 1});`);
                }
            } else {
                compiled.push(`${options.stackName}.push(${token.value});`);
            }
        } else if (token.type == "function") {
            if (stdlibFunctions.includes(token.moves)) {
                compiled.push(
                    `var args = ${options.stackName}.slice(${options.stackName}.length - stdlib["${token.moves}"].length);`,
                    `${options.stackName} = ${options.stackName}.slice(0, ${options.stackName}.length - args.length);`,
                    `${options.stackName}.push(stdlib["${token.moves}"](...args));`
                );
            } else {
                if (token.moves == "b") { // print (without trailing newline)
                    cubestackPrint();
                    globalThis.printed = true;
                } else if (token.moves == "b'") { // get all input wrapped in a list
                    compiled.push(`${options.stackName}.push(${JSON.stringify(input.split(options.inputSplit))}.map(item => item.split("").filter(char => Number.isNaN(parseInt(char))).length > 0 ? item : parseFloat(item)));`);
                } else if (token.moves == "M2") { // duplicate top item
                    compiled.push(`${options.stackName}.push(${options.stackName}[${options.stackName}.length - 1]);`);
                } else if (token.moves == "U'") { // pop the stack
                    compiled.push(`${options.stackName}.pop(4);`)
                } else if (token.moves == "b2") { // push a copy of the stack to the stack
                    compiled.push(`${options.stackName}.push(${options.stackName}.slice());`);
                } else if (token.moves == "d'") { // set the stack to the top item
                    compiled.push(`${options.stackName} = Array.isArray(${options.stackName}[${options.stackName}.length - 1]) ? ${options.stackName}.pop() : [${options.stackName}.pop()];`);
                } else if (token.moves == "l'") { // swap the top two items on the stack
                    compiled.push(
                        `var topTwo = ${options.stackName}.slice(${options.stackName}.length - 2);`,
                        `${options.stackName} = ${options.stackName}.slice(0, ${options.stackName}.length - 2).concat(topTwo.reverse());`,
                    );
                } else if (token.moves == "f2") { // exit the program
                    compiled.push("// program exited (f2 command)");
                    return compiled.join("\n");
                } else if (token.moves == "y2") { // get a loop variable
                    compiled.push(`${options.stackName}.push(loopVars[${options.stackName}.pop()]);`);
                } else if (token.moves == "S2") { // break a loop
                    compiled.push(`break;`);
                }
            }
        } else if (token.type == "control flow") {
            var codeBlockOptions = structuredClone(options);
            codeBlockOptions.setup = false;
            codeBlockOptions.includeStack = false;

            if (token.name == "if") {
                compiled.push(
                    `if (${options.stackName}.pop()) {`,
                    compile(token.value[0], input, codeBlockOptions),
                    `}`
                );
                if (token.value.length > 1) {
                    compiled.pop();
                    compiled.push(
                        `} else {`,
                        compile(token.value[1], input, codeBlockOptions),
                        `}`
                    );
                }
            } else if (token.name == "for loop") {
                compiled.push(
                    `let loopVar = ${options.stackName}.pop();`,
                    `if (typeof ${options.stackName}[${options.stackName}.length - 1] == "number") {`,
                    `var range = [];`,
                    `var rangeLength = ${options.stackName}.pop();`,
                    `for (var i = 0; i < rangeLength; i++) range.push(i);`,
                    `${options.stackName}.push(range);`,
                    `}`,
                    `for (loopVars[loopVar] of ${options.stackName}.pop()) {`,
                    compile(token.value, input, codeBlockOptions),
                    `}`
                );
            } else if (token.name == "while loop") {
                if (token.value.length == 1 || token.value[0].length == 0) {
                    compiled.push(
                        `while (true) {`,
                        compile(token.value[0], input, codeBlockOptions)
                    );
                } else {
                    var conditionEvalOptions = structuredClone(options);
                    conditionEvalOptions.setup = false;
                    conditionEvalOptions.includeStack = false;
                    conditionEvalOptions.stackName = "stackCopy"
                    compiled.push(
                        `var ${conditionEvalOptions.stackName} = stack.slice();`,
                        compile(token.value[0], input, conditionEvalOptions),
                        `while (stackCopy[stackCopy.length - 1]) {`,
                        compile(token.value[1], input, codeBlockOptions),
                    );
                }
                compiled.push(`}`);
            }
        } else if (token.type == "error") {
            globalThis.errored = true;
            if (options.platform == "node") {
                compiled.push(`process.stdout.write("error:\\n  ${token.value}\\n  ${token.name}\\n");`);
            } else if (options.platform == "web") {
                compiled.push(`$("#output").innerText += "error:\\n  ${token.name}\\n  ${token.value}\\n";`);
            }
            break;
        }
    }
    
    if (!globalThis.printed && options.setup && !globalThis.errored) cubestackPrint();

    return compiled.join(options.joinCompiled);
}

if (typeof module != "undefined") module.exports = { compile, lex };