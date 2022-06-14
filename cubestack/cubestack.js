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
                    this.value = JSON.stringify(rubiksToString(moves.join(" ")));
                    break;
                case "number":
                    this.value = rubiksToNumber(moves.join(" "));
                    break;
                case "list":
                    this.value = moves.slice(1, -1).join(" ").replace(/E | E'/g, "").split(" E2 ").map(elem => lex(elem));
            }
        }
    }
}

var lex = (code) => {
    var tokens = [],
        token = [],
        state = "";

    var endToken = (type, name, token, value = null) => {
        token.push(move);
        tokens.push(new Token(type, name, token, value));
        state = "";
    }

    var invalidMove = (move) => {
        tokens.push(new Token("error", "invalid move", move, `${move} is not a valid move on a 3x3 rubiks cube`));
    }

    for (var move of (code ?? "").replace(/\s{2,}|\n/g, " ").split(" ").filter(move => !!move)) {
        if (state == "string") {
            if (base36map.includes(move)) {
                token.push(move);
            } else if (move == "S'") {
                if (token.length % 2 == 0) {
                    tokens.push(new Token("error", "invalid string", token.concat([move]), `string literals must have an even amount of moves`));
                } else {
                    endToken("literal", "string", token);
                }
            } else {
                tokens.push(new Token("error", "invalid string", move, `${move} is not a valid move inside a string`));
            }
        } else if (state == "number") {
            if (base36map.includes(move) || move == "M2") {
                token.push(move);
            } else if (move == "M'") {
                endToken("literal", "number", token);
            } else {
                tokens.push(new Token("error", "invalid number", move, `${move} is not a valid move inside a number`));
            }
        } else if (state == "list") {
            if (move == "E") {
                openedLists++;
                token.push(move);
            } else if (move == "E'") {
                closedLists++;
                if (closedLists == openedLists) {
                    endToken("literal", "list", token);
                } else {
                    token.push(move);
                }
            } else {
                if (allMoves.includes(move)) {
                    token.push(move);
                } else {
                    invalidMove(move);
                }
            }
        } else if (state == "if") {
            if (move == "x'") {
                endToken("control flow", "if", token, token.join(" ").slice(2).split(" x2 ").map(code => lex(code)));
            } else if (allMoves.includes(move)) {
                token.push(move);
            } else {
                invalidMove(move);
            }
        } else if (state == "for loop") {
            if (move == "y'") {
                endToken("control flow", "for loop", token, lex(token.slice(1).join(" ")));
            } else if (allMoves.includes(move)) {
                token.push(move);
            } else {
                
            }
        } else if (state == "while loop") {
            if (move == "z'") {
                endToken("control flow", "while loop", token, token.slice(1).join(" ").split(" z2 ").map(code => lex(code)));
            } else if (allMoves.includes(move)) {
                token.push(move);
            } else {
                invalidMove(move);
            }
        } else {
            switch (move) {
                case "S":
                    state = "string";
                    break;
                case "M":
                    state = "number";
                    break;
                case "E":
                    state = "list";
                    var openedLists = 1,
                        closedLists = 0;
                    break;
                case "x":
                    state = "if";
                    break;
                case "y":
                    state = "for loop";
                    break;
                case "z":
                    state = "while loop";
                    break;
                default:
                    if (singleMoveCommands.includes(move)) {
                        tokens.push(new Token("function", null, move)); 
                    } else {
                        tokens.push(new Token("error", "invalid token", move, `unexpected token ${move}`));
                    }
            }

            token = [move];
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
        joinCompiled: "\n"
    }

    for (var key in defaultOptions) defaultOptions[key] = options[key] ?? defaultOptions[key];
    options = defaultOptions;

    var compiled = [];
    if (options.setup) {
        if (input) {
            compiled.push(
                `var inputs = ${JSON.stringify(input.split(options.inputSplit))}.map(item => item.split("").filter(char => Number.isNaN(parseInt(char))).length > 0 ? item : parseFloat(item));`,
                `var ${options.stackName} = inputs;`
            );
        } else {
            compiled.push(`var ${options.stackName} = [];`);
        }
        
        if (options.platform == "node") compiled.push("var stdlib = require(\"./stdlib.js\");");
        else if (options.platform == "web") compiled.push(`$("#output").innerText = "";`)

        compiled.push("var loopVars = {};");
    }

    for (var token of tokens) {
        if (token.type == "literal") {
            if (token.name == "list") {
                // only flat lists work currently :(
                compiled.push(`var arrayToPush = [];`);
                for (var elem of token.value) {
                    var listEvalOptions = structuredClone(options);
                    listEvalOptions.setup = false;
                    listEvalOptions.stackName = "stackCopy"
                    compiled.push(
                        `var ${listEvalOptions.stackName} = stack.slice();`,
                        compile(elem, input, listEvalOptions),
                        `arrayToPush.push(stackCopy[stackCopy.length - 1]);`
                    );
                }
                compiled.push(`${options.stackName}.push(arrayToPush);`);
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
                    compiled.push(
                        `var toPrint = ${options.stackName}.pop() ?? "";`,              
                        `if (typeof toPrint != "string") toPrint = JSON.stringify(toPrint, null, 2);`,
                    );

                    if (options.platform == "node") {
                        compiled.push(`process.stdout.write(toPrint + ${JSON.stringify(options.lineEnding)});`);
                    } else if (options.platform == "web") {
                        compiled.push(`$("#output").innerText += toPrint + ${JSON.stringify(options.lineEnding)};`);
                    }

                    var printed = true;
                } else if (token.moves == "b'") { // get all input wrapped in a list
                    compiled.push(`${options.stackName}.push(${JSON.stringify(input.split(options.inputSplit))}.map(item => item.split("").filter(char => Number.isNaN(parseInt(char))).length > 0 ? item : parseFloat(item)));`);
                } else if (token.moves == "M2") { // duplicate top item
                    compiled.push(`${options.stackName}.push(${options.stackName}[${options.stackName}.length - 1]);`);
                } else if (token.moves == "U'") { // pop the stack
                    compiled.push(`${options.stackName}.pop();`)
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
                    compiled.push("process.exit(0);");
                } else if (token.moves == "y2") { // get a loop variable
                    compiled.push(`${options.stackName}.push(loopVars[${options.stackName}.pop()]);`);
                } else if (token.moves == "S2") { // break a loop
                    compiled.push(`break;`);
                }
            }
        } else if (token.type == "control flow") {
            var codeBlockOptions = structuredClone(options);
            codeBlockOptions.setup = false;

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
                compiled.push(`process.stdout.write("error:\\n  ${token.name}\\n  ${token.value}\\n");`);
            } else if (options.platform == "web") {
                compiled.push(`$("#output").innerText += "error:\\n  ${token.name}\\n  ${token.value}\\n";`);
            }
            break;
        }
    }
    
    if (!printed && options.setup && !globalThis.errored) {    
        compiled.push(
            `var toPrint = ${options.stackName}.pop() ?? "";`,              
            `if (typeof toPrint != "string") toPrint = JSON.stringify(toPrint, null, 2);`,
        );

        if (options.platform == "node") {
            compiled.push(`process.stdout.write(toPrint + ${JSON.stringify(options.lineEnding)});`);
        } else if (options.platform == "web") {
            compiled.push(`$("#output").innerText += toPrint + ${JSON.stringify(options.lineEnding)};`);
        }
    }

    return compiled.join(options.joinCompiled);
}

if (typeof module != "undefined") module.exports = { compile, lex };