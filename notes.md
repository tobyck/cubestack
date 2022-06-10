Mini-tokeniser for lists.
Will need later for deep list evaluation.

```js
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
```

TODO:
- [X] fix output on web
- [x] implement lists
- [ ] check all commands
- [X] fix visualisation



Potential structure for deep list evaluation:

```js
[1, [1 6+, 2]]
var arrayToPush1 = [];

var stackCopy = stack.slice();
stackCopy.push(1);
arrayToPush1.push(stackCopy[stackCopy.length - 1]);

var arrayToPush2 = [];

var stackCopy = stack.slice();
stackCopy.push(1);
stackCopy.push(6);
stackCopy.push(stdlib["R"](stack.pop(), stack.pop()));
arrayToPush2.push(stackCopy[stackCopy.length - 1]);

var stackCopy = stack.slice();
stackCopy.push(2);
arrayToPush2.push(stackCopy[stackCopy.length - 1]);
arrayToPush1.push(arrayToPush2);

stack.push(arrayToPush1);
```

Compiler tests
compiler tests
var x = "M l M' S R2 b S' y S R2 b S' y2 M R' M' R b y'";
var x = "M r M' S S' y d2 M l' M' L f b y'";
var x = "M R2 M' M L2 M' b2 M R' M' R b";
var x = "M R2 M' M L2 M' F' M r M' L b"
var x = "E M R' M' E2 E M R2 M' E2 M r M' M r' M' R E' E2 S R2 b S' E'";
         [   1     ,  [   2     ,    3      4     + ]  ,      i     ]
         [1, [2, 3 4+], "i"]