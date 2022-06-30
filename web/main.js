if (navigator.userAgent.indexOf("Safari") >= 0 && navigator.userAgent.indexOf("Chrome") <= -1) {
    alert("Sorry, this website is not supported on Safari based browsers. Please try again in a different browser.");
    document.body.innerHTML = "";
} else {
    var $ = (element) => document.querySelector(element);

    var canvas = $("#canvas");
    var ctx = canvas.getContext("2d");

    var drawFace = (data, x, y) => {
        var faceSize = innerWidth / 12;
        ctx.strokeStyle = "transparent";
        var gap = innerWidth / 550;
        ctx.lineWidth = gap;
        for (var i = 0; i < data.length; i++) {
            var colourMap = {
                "green": "#3cbf37",
                "white": "#eeeeee",
                "orange": "#ff9a00",
                "yellow": "#ffe100",
                "red": "#fa3c3c",
                "blue": "#0080ff",
            }
            
            ctx.fillStyle = colourMap[data[i]] || "grey";
            ctx.fillRect(x + (i % 3) * faceSize / 3 + (gap * (i % 3)), y + Math.floor(i / 3) * faceSize / 3 + (gap * Math.floor(i / 3)), faceSize / 3, faceSize / 3);
            ctx.strokeRect(x + (i % 3) * faceSize / 3 + (gap * (i % 3)), y + Math.floor(i / 3) * faceSize / 3 + (gap * Math.floor(i / 3)), faceSize / 3, faceSize / 3);
        }
    }

    var updateDisplay = () => {
        $("#code-display").innerHTML = highlight($("#code-textarea").value);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var cube = generateCube($("#code-display").innerText);
        var faceSize = innerWidth / 12;

        var faceGap = innerWidth / 70;
        canvas.height = faceSize * 3 + faceGap * 3;
        canvas.width = faceSize * 4 + faceGap * 4;

        drawFace(cube.top, faceSize + faceGap, 0)
        drawFace(cube.front, faceSize + faceGap, faceSize + faceGap)
        drawFace(cube.left, 0, faceSize + faceGap)
        drawFace(cube.bottom, faceSize + faceGap, faceSize * 2 + faceGap * 2)
        drawFace(cube.right, faceSize * 2 + faceGap * 2, faceSize + faceGap)
        drawFace(cube.back, faceSize * 3 + faceGap * 3, faceSize + faceGap)

    }

    $("#code-textarea").addEventListener("input", updateDisplay);
    window.addEventListener("resize", updateDisplay);
    window.addEventListener("load", () => {
        if (location.search) {
            var [code, input] = location.search.slice(1).split("&").map(query => atob(decodeURIComponent(query)));
            $("#code-textarea").value = code;
            $("#input-textarea").value = input;
            updateDisplay();
            run();
        }

        expand($("#code-textarea"));
        expand($("#input-textarea"));
        updateDisplay();
    });

    $("#code-textarea").addEventListener("keydown", event => {
        if (event.key == "Tab") {
            event.preventDefault();
            $("#code-textarea").setRangeText(
                "  ",
                $("#code-textarea").selectionStart,
                $("#code-textarea").selectionStart,
                "end"
            );
        }
    });

    var expand = (element) => {
        element.style.height = "0";
        element.style.height = (element.scrollHeight) + "px";
    }

    var run = () => {
        var compiled = compile(lex($("#code-display").innerText), $("#input-textarea").value, { platform: "web" });
        var blob = new Blob([ `fetch("https://raw.githubusercontent.com/tobyck/cubestack/master/cubestack/stdlib.js").then(response => response.text()).then(text => { eval(text); ${compiled} });` ], { type: "text/javascript" });
        var blobURL = URL.createObjectURL(blob);
        var worker = new Worker(blobURL);

        setTimeout(() => {
            worker.terminate();
        }, 5000);

        $("#output").innerText = "\n";
        var started = false;
        worker.onmessage = event => {
            if (!started) {
                $("#output").innerText = "";
                started = true;
            }

            if (event.data.type == "output") $("#output").innerText += event.data.message;
            else if (event.data.message == "exit") worker.terminate();
        }
    }

    document.addEventListener("keydown", event => {
        if ((event.metaKey || event.ctrlKey) && event.key == "Enter") {
            run();
        }
    });

    $("#moves").addEventListener("input", () => {
        if ($("#moves").value.length > 0) {
            if ($("#moves").value.slice(0, 2) == "M " && $("#moves").value.slice(-3) == " M'") {
                $("#num-or-str").value = rubiksToNumber($("#moves").value);
                $(".arrow").style.fill = "#999";
            } else if ($("#moves").value.slice(0, 2) == "S " && $("#moves").value.slice(-3) == " S'") {
                $("#num-or-str").value = rubiksToString($("#moves").value);
                $(".arrow").style.fill = "#999";
            } else {
                $(".arrow").style.fill = "#fa3c3c";
            }
        } else {
            $("#num-or-str").value = "";
            $(".arrow").style.fill = "#999";
        }
    });

    $("#num-or-str").addEventListener("input", () => {
        if ($("#num-or-str").value.length > 0) {
            if ($("#num-or-str").value[0] == "\"" && $("#num-or-str").value[$("#num-or-str").value.length - 1] == "\"") {
                $("#moves").value = stringToRubiks($("#num-or-str").value.slice(1, -1));
            } else {
                if (Number.isNaN(parseFloat($("#num-or-str").value))) {
                    $("#moves").value = stringToRubiks($("#num-or-str").value);
                } else {
                    $("#moves").value = numberToRubiks(Math.abs($("#num-or-str").value));
                }
            }
        } else {
            $("#moves").value = "";
        }
    });

    $(".clear").onclick = () => {
        $("#code-textarea").value = "";
        $("#code-display").innerHTML = "";
        $("#input-textarea").value = "";
        $("#output").innerHTML = '<span style="color:#666">Output...</span><br>\n';
        expand($("#input-textarea"));
        updateDisplay();
    }

    $(".link").onclick = () => {
        var code = $("#code-textarea").value,
            input = $("#input-textarea").value;
        
        $("#output").style.overflow = "scroll";
        if (code || input) {
            $("#output").innerText = `https://${location.hostname}?${encodeURIComponent(btoa(code))}&${encodeURIComponent(btoa(input))}`;
        } else {
            
            $("#output").innerText = location.origin;
        }
    }
}