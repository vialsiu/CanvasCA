let ctx = null;
let img = null;

let image = 'wony.jpg';

window.onload = onAllAssetsLoaded;
document.write("<div id='loadingMessage'>Loading...</div>");

//Canvas
function onAllAssetsLoaded() {
    document.getElementById('loadingMessage').style.visibility = "hidden";

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = image;
}

//Flip  Horizontally, Flip Vertically
window.addEventListener('DOMContentLoaded', function() {
    const insertButton = document.getElementById('insert');
    insertButton.addEventListener("click", insertImage);

    function insertImage() {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    const flipHorButton = document.getElementById('fliphor');
    flipHorButton.addEventListener("click", flipHorizontal);

    function flipHorizontal() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        img.src = canvas.toDataURL();
    }

    const flipVertButton = document.getElementById('flipvert');
    flipVertButton.addEventListener("click", flipVertical);

    function flipVertical() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        img.src = canvas.toDataURL();
    }
});

//(Aesthetic purposes) Update toolbar background = colorpicker,
// EXCEPT the light pink colour at defaut (default) or white
window.addEventListener('DOMContentLoaded', function() {
    var defaulthexvalue = "#D1C7C7";
    var colorpicker = document.getElementById("colorpicker");
    colorpicker.value = defaulthexvalue;
});

window.addEventListener('DOMContentLoaded', function() {
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
    colorpicker.addEventListener('change', function() {
        changeToolbarColor();
    });
});

//Everything to do with drawing
document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let drawEnabled = false;

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    function startDrawing(e) {
        if (!drawEnabled) return;
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function draw(e) {
        if (!drawEnabled || !isDrawing) return;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle = colorpicker.value; 
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function stopDrawing() {
        isDrawing = false;
    }

    const drawButton = document.getElementById("draw");
    drawButton.addEventListener("click", toggleDrawing);
    
    function toggleDrawing() {
        drawEnabled = !drawEnabled;
        if (drawEnabled) {
            canvas.style.cursor = "crosshair";
            canvas.addEventListener("mousedown", startDrawing);
            canvas.addEventListener("mousemove", draw);
            canvas.addEventListener("mouseup", stopDrawing);
            canvas.addEventListener("mouseout", stopDrawing);
            drawButton.style.backgroundColor = "#474646";       
         } else {
            canvas.style.cursor = "default";
            canvas.removeEventListener("mousedown", startDrawing);
            canvas.removeEventListener("mousemove", draw);
            canvas.removeEventListener("mouseup", stopDrawing);
            canvas.removeEventListener("mouseout", stopDrawing);
            drawButton.classList.remove("drawing");
            drawButton.style.backgroundColor = "";
        }
    }
});