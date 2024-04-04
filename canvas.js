let canvas = null;
let ctx = null;
let img = null;
let paths = []; // Array to store paths

//let image = 'wony.jpg';
let isEraserMode = false;


window.onload = onAllAssetsLoaded;
document.write("<div id='loadingMessage'>Loading...</div>");

//Canvas
function onAllAssetsLoaded() {
    document.getElementById('loadingMessage').style.visibility = "hidden";

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    //img = new Image();
    //img.onload = function () {
    //    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    //};
    //img.src = image;
}
// Function to redraw all saved paths
/*function redrawPaths() {
    console.log("FAG")
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    paths.forEach(path => {
        if (path.length > 1) {
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            path.forEach(point => {
                ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();}
    });
}*/
function redrawPaths() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    paths.forEach(path => {
        if (path.length > 1) {
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                const point = path[i];
                if (point.isEraser) {
                    ctx.clearRect(point.x - 5, point.y - 5, 10, 10); 
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            }
            ctx.stroke();
        }
    });
}


//Flip Horizontally, Flip Vertically

function flipHorizontal() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    redrawPaths();
    //ctx.restore();
    //img.src = canvas.toDataURL();
}
function flipVertical() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ctx.save();
    ctx.scale(1, -1);
    ctx.translate(0, -canvas.height);
    redrawPaths();
    //ctx.restore();
}

//(Aesthetic purposes) Update toolbar background = colorpicker,
// EXCEPT the light pink colour at defaut (default) or white
window.addEventListener('DOMContentLoaded', function () {
    var defaulthexvalue = "#D1C7C7";
    var colorpicker = document.getElementById("colorpicker");
    colorpicker.value = defaulthexvalue;
});

window.addEventListener('DOMContentLoaded', function () {
    var colorpicker = document.getElementById("colorpicker");
    var defaultToolbarBackground = "linear-gradient(to right, #e6b8b7, #e6c0b8, #e6c8b8, #e6d0b8, #e6d8b8, #e6e0b8, #dfe6b8, #d7e6b8, #cfe6b8, #c7e6b8, #b8e6be, #b8e6c6, #b8e6ce, #b8e6d6, #b8e6de)";
    function changeToolbarColor() {
        var toolbar = document.getElementById("toolbar");
        var selectedColor = colorpicker.value;
        if (selectedColor.toUpperCase() === "#FFFFFF" || selectedColor.toUpperCase() === "#D1C7C7") {
            toolbar.style.background = defaultToolbarBackground;
        } else {
            toolbar.style.background = selectedColor;
        }
    }
    changeToolbarColor();
    colorpicker.addEventListener('change', function () {
        changeToolbarColor();
    });
});

// Eraser button
window.addEventListener('DOMContentLoaded', function () {
    const eraserButton = document.getElementById('eraser');
    eraserButton.addEventListener("click", toggleEraser);

    function toggleEraser() {
        isEraserMode = !isEraserMode;
        if (isEraserMode) {
            eraserButton.style.backgroundColor = "#474646";
            canvas.style.cursor = "pointer";
        } else {
            eraserButton.style.backgroundColor = "";
        }
    }
});

//Everything to do with drawing
document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let drawEnabled = false;
    let eraseEnabled = false;

    canvas.addEventListener("mousedown", startDrawingOrErasing);
    canvas.addEventListener("mousemove", drawOrErase);
    canvas.addEventListener("mouseup", stopDrawingOrErasing);
    canvas.addEventListener("mouseout", stopDrawingOrErasing);

    function startDrawingOrErasing(e) {
        if (!drawEnabled && !eraseEnabled) return;
        isDrawing = true;
        if (eraseEnabled) {
            paths.push([]); // Create a new empty path in the array
        } else {
            paths.push([{ x: NaN, y: NaN }]); // Start a new path with a "dummy" point
        }
        addPoint(e);
        //[lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function drawOrErase(e) {
        if (!drawEnabled && !eraseEnabled || !isDrawing) return;
            addPoint(e);
            redrawPaths();
        
        //ctx.moveTo(lastX, lastY);
        //ctx.lineTo(e.offsetX, e.offsetY);
        //ctx.stroke();
        //[lastX, lastY] = [e.offsetX, e.offsetY];
        //ctx.closePath()
    }

    

    // Function to add a point to the current path
    function addPoint(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        //paths[paths.length - 1].push({ x, y });
        /*if (eraseEnabled) {
            // Remove nearby points from all paths
            paths.forEach(path => {
                path = path.filter(point => {
                    return Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2) > 10; // Adjust the eraser size as needed
                });
            });
        } else {
            // Add the point to the current path
            paths[paths.length - 1].push({ x, y });
        }*/

        if (eraseEnabled) {
            paths[paths.length - 1].push({ x, y, isEraser: true }); // Add the point with eraser flag
        } else {
            paths[paths.length - 1].push({ x, y }); // Add the point without eraser flag
        }
    }

    function stopDrawingOrErasing() {
        isDrawing = false;
    }

    const drawButton = document.getElementById("draw");
    const eraserButton = document.getElementById('eraser');

    drawButton.addEventListener("click", toggleDrawing);
    eraserButton.addEventListener("click", toggleErasing);

    function toggleDrawing() {
        if (eraseEnabled) {
            toggleErasing();
        }
        drawEnabled = !drawEnabled;
        if (drawEnabled) {
            canvas.style.cursor = "crosshair";
            drawButton.style.backgroundColor = "#474646";
        } else {
            canvas.style.cursor = "default";
            drawButton.style.backgroundColor = "";
        }
    }

    function toggleErasing() {
        if (drawEnabled) {
            toggleDrawing()
        }
        eraseEnabled = !eraseEnabled;
        if (eraseEnabled) {
            canvas.style.cursor = "pointer";
            eraserButton.style.backgroundColor = "#474646";
        } else {
            canvas.style.cursor = "default";
            eraserButton.style.backgroundColor = "";
        }
    }
});

//Save button
function saveCanvas() {
    var dataURL = canvas.toDataURL();
    var link = document.createElement('a');
    link.href = dataURL;
    link.download = 'canvas_image.png';
    link.click();
}

//Insert button
function insertImage() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', function (event) {
        var file = event.target.files[0];

        if (file) {
            var reader = new FileReader();

            reader.onload = function (e) {
                var img = new Image();
                img.onload = function () {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = e.target.result;
            };

            reader.readAsDataURL(file);
        }
    });
    input.click();
}
