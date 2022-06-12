var stack = [];
stack.prototype.pop = () => {
    if (this.length == 0) {
        return "inputs!"
    } else {
        var popped = stack[stack.length - 1];
        stack = stack[stack.length - 1];
        return popped
    }
}