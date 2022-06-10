const cubestack = require("./cubestack.js");
const fs = require("fs");

var args = process.argv.slice(2);
var usageMessage = `
Cubestack

    node main.js [file] [string of inputs (required)] [options ...]

    Options:
        -h, --help: Show this help message
        -v, --version: Show version
        -c, --compiled: Show compiled code
        -e, --eval: Evaluate code instead of file
        -s, --split: Split input by string
        -l, --lineending: Set line ending

    Examples:
        node main.js "test.txt" ""
            Run text.txt (which has Cubestack code inside of it) with no input
        node main.js "test.txt" "5" -cl ""
            Run text.txt with input "5", show compiled code and end lines with ""
        node main.js "b' b" "5 6" -ecs " "
            Evaluate code "b' b" with input "5 6", and split input by " "
        
    For more information, see the github repository: https://github.com/tobyck/cubestack
`

if (args.length == 0) {
    console.log(usageMessage);
} else {
    var options = [],
        newArgs = [];

    for (var arg of args) {
        if (arg[0] == "-") {
            options = options.concat(arg.slice(1).split(""));
            var emptyCount = arg.slice(1).split("").filter(item => !"sl".includes(item)).length;
            newArgs.push(...Array(emptyCount).fill(""));
        } else if (arg.startsWith("--") && ["--help", "--version", "--compiled", "--eval", "--split", "--lineending"].includes(arg)) {
            options.push(arg[2]);
            if (!"sl".includes(arg[2])) newArgs.push("");
        } else {
            newArgs.push(arg);
        }
    }

    options.unshift("f", "i");

    var code, input, compilerOptions = {};

    if (options.includes("h")) {
        console.log(usageMessage);
    } else if (options.includes("v")) {
        console.log("Cubestack v" + require("./package.json").version);
    } else {
        for (var i = 0; i < options.length; i++) {
            if (options[i] == "f") {
                code = options.includes("e") ? newArgs[i] : fs.readFileSync(newArgs[i], "utf8");
            } if (options[i] == "i") {
                input = newArgs[i];
            } if (options[i] == "s") {
                compilerOptions.inputSplit = newArgs[i];
            } if (options[i] == "l") {
                compilerOptions.lineEnding = newArgs[i];
            }
        }
        var compiled = cubestack.compile(cubestack.lex(code), input, compilerOptions);
        if (options.includes("c")) console.log(compiled + "\n");
        eval(compiled);
    }
}