var vectorise = (func) => {
    return function inner(a, b) {
        if (Array.isArray(a) && Array.isArray(b)) {
            return a.map((item, index) => inner(item, b[index] ?? 0));
        } else if (Array.isArray(a)) {
            return a.map(item => inner(item, b))
        } else if (Array.isArray(b)) {
            return b.map(item => inner(a, item))
        } else {
            return func(a, b);
        }
    }
}

var stdlib = {
    // math
    "R": (a, b) => a + b,
    "R'": (a, b) => {
        if ([a, b].filter(arg => typeof arg == "string").length == 1) {
            if (typeof a == "string") {
                return a.slice(0, -b);
            } else {
                return b.slice(0, -a);
            }
        } else {
            return a - b;
        }
    },
    "L": (a, b) => {
        if ([a, b].filter(arg => typeof arg == "string").length == 1) {
            if (typeof a == "string") {
                return a.repeat(Math.abs(b));
            } else {
                return b.repeat(Math.abs(a));
            }
        } else {
            return a * b;
        }
    },
    "L'": (a, b) => {
        if (b == undefined) {
            if (typeof a == "string") return a.split("").reverse().join("");
            else if (Array.isArray(a)) return a.reverse();
        } else {
            if ([a, b].filter(arg => typeof arg == "string").length == 1) {
                if (typeof a == "string") {
                    return a.reverse();
                } else {
                    return b.reverse();
                }
            } else {
                return a / b;
            }
        }
        
    },
    "L2": (a, b) => {
        if ([a, b].filter(arg => typeof arg == "string").length == 1) {
            if (typeof a == "string") {
                return a.toUpperCase();
            } else if (typeof b == "string") {
                return b.toUpperCase();
            }
        } else {
            return a ** b;
        }
    },
    "R2": (a, b) => {
        if ([a, b].filter(arg => typeof arg == "string").length == 1) {
            if (typeof a == "string") {
                return a.toLowerCase();
            } else if (typeof b == "string") {
                return b.toLowerCase();
            }
        } else {
            return a ** (1 / b);
        }
    },
    "U": (a, b) => a % b,

    // logic
    "D": (a, b) => a == b,
    "D'": (a, b) => a != b,
    "F": (a, b) => a < b,
    "F'": (a, b) => a > b,
    "B": (a, b) => a <= b,
    "B'": (a, b) => a >= b,
    "D2": (a, b) => a && b,
    "F2": (a, b) => a || b,
    "B2": (a) => !a,

    // list operaters
    "r": (a, b) => a[b % a.length],
    "r'": (a, b) => a.indexOf(b),
    "r2": (a, b) => a.concat([b]),
    "d": (a, b) => {
        a.splice(b, 1);
        return a;
    },
    "u": (a, b) => a.join(b),
    "u'": (a, b) => a.split(b),
    "l2": (a, b, c) => a.slice(b, c),
    "u2": (a, b) => a.slice(b).concat(a.slice(0, b)),
    "l": (a) => a.length,
    "d2": () => Math.random(),
    "U2": (a, b, c) => {
        var range = [];
        for (var i = a; i < b; i += c) range.push(i);
        return range;
    },
    "f": (a) => Math.floor(a),
    "f'": (a, b) => {
        if (b == "list") {
            if (typeof a == "number") {
                return a.toString().split("").map(digit => parseInt(digit) || ".");
            } else {
                return a.split("")
            }
        } else if (b == "string") {
            return a.toString();
        } else if (b == "int") {
            return parseInt(a);
        } else if (b == "float") {
            return parseFloat(a);
        } else {
            return `error:\n  invalid type to convert to (${b})`;
        }
    }
};

var index = 0;
for (var key in stdlib) {
    if (index < 16 && stdlib[key].length == 2 && !"L' L2 R2".split(" ").includes(key)) {
        let func = stdlib[key];
        stdlib[key] = (a, b) => {
            if (b == undefined) {
                return a;
            } else {
                return vectorise(func)(a, b);
            }
        }
    }
    index++;
}

if (typeof module != "undefined") module.exports = stdlib;
else if (typeof window != "undefined") window.stdlib = stdlib;