let ctx = null;

let offscreenCanvas = null;
let offscreenCanvasCtx = null;

let imageWidth = 100;
let imageHeight = 100;
let imageX = 250;
let imageY = 250;

let images = [
    // {src: img1, x: 100, y: 100, width: 100, height: 100, rotation: 0, red: 0, green: 0, blue: 0, threshold: false, posterise: false, invert: false, sepia: false, greyscale: false, brightness: 0},
    // {src: img2, x: 200, y: 200, width: 100, height: 100, rotation: 0, red: 0, green: 0, blue: 0, threshold: false, posterise: false, invert: false, sepia: false, greyscale: false, brightness: 0},
    // {src: img3, x: 300, y: 300, width: 100, height: 100, rotation: 0, red: 0, green: 0, blue: 0, threshold: false, posterise: false, invert: false, sepia: false, greyscale: false, brightness: 0}
];

let lastX = 0;
let lastY = 0;

let isDrawing = false;

let drawBtn = null;
let eraserBtn = null;
let currentImageIndex = null;

let offsetX = 0;
let offsetY = 0;

let mouseX = 0;
let mouseY = 0;

let radius = 10;
let scribbleCanvas = null; 
let scribbleCanvasCtx = null; 

// let eraserCanvas = null;
// let eraserCanvasCtx = null;
let scribbleEnabled = false;
let eraseEnabled = false;

window.onload = onAllAssetsLoaded;
document.write("<div id='sf_loadingMessage'>Loading...</div>");
function onAllAssetsLoaded() {
    document.getElementById('sf_loadingMessage').style.visibility = "hidden";

    canvas = document.getElementById("sf_canvas");
    ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    offscreenCanvas = document.createElement('canvas');
    offscreenCanvasCtx = offscreenCanvas.getContext('2d');
    offscreenCanvas.width = canvas.clientWidth;
    offscreenCanvas.height = canvas.clientHeight;
    
    scribbleCanvas = document.createElement("canvas");
    scribbleCanvasCtx = scribbleCanvas.getContext("2d");
    scribbleCanvas.width = canvas.clientWidth;
    scribbleCanvas.height = canvas.clientHeight;

    renderCanvas();

    drawBtn = document.getElementById('sf_drawing');
    eraserBtn = document.getElementById('sf_erasing');
    drawBtn.addEventListener("click", toggleScribbling);
    eraserBtn.addEventListener("click", toggleErasing);

    canvas.addEventListener('mousedown', mousedownHandler);
    canvas.addEventListener('mousemove', moveHandler);
    window.onmousewheel = document.onmousewheel = mousewheelHandler;

    scribbleCanvasCtx.fillStyle = "black"

    let insertBtn = document.getElementById('sf_insert');
    insertBtn.addEventListener("click", insertImage);
    let deleteBtn = document.getElementById('sf_delete');
    deleteBtn.addEventListener("click", deleteImage);
    document.getElementById('sf_delete').addEventListener('click', deleteImage);

    canvas.addEventListener('mousedown', startDrawingOrErasing);
    canvas.addEventListener('mousemove', drawOrErase);
    canvas.addEventListener('mouseup', stopDrawingOrErasing);

    ctx.fillStyle = "darkgray";
    ctx.font = "20px Arial";
    ctx.textAlign = "center"; 
    ctx.textBaseline = "middle";
    ctx.fillText("UPLOAD IMG TO START", canvas.width / 2, canvas.height / 2);

    renderScribbleCanvas();
}

function renderScribbleCanvas() {
    ctx.drawImage(scribbleCanvas, 0, 0, canvas.width, canvas.height);
}

function renderCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    images.forEach((image, index) => {
        offscreenCanvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        if (index === currentImageIndex) {
            offscreenCanvasCtx.fillStyle = "darkgrey";
            offscreenCanvasCtx.save();
            offscreenCanvasCtx.translate((image.x + image.width / 2), (image.y + image.height / 2));
            offscreenCanvasCtx.rotate(Math.radians(image.rotation)); 
            offscreenCanvasCtx.fillRect(-image.width / 2 - 2, -image.height / 2 - 2, image.width + 4, image.height + 4);
            offscreenCanvasCtx.restore();
        }
        let filteredImage = applyFilters(image.src, image);
        offscreenCanvasCtx.save(); 
        offscreenCanvasCtx.translate((image.x + image.width / 2), (image.y + image.height / 2));
        offscreenCanvasCtx.rotate(Math.radians(image.rotation));
        offscreenCanvasCtx.drawImage(filteredImage, -image.width / 2, -image.height / 2, image.width, image.height);
        offscreenCanvasCtx.restore(); 
        ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
    });
    // ctx.drawImage(scribbleCanvas, 0, 0, canvas.width, canvas.height);
    renderScribbleCanvas();
}


function applyFilters(image, options) {
    const compositeOperations = {
        sf_default: 'source-over',
        sf_sourceatop: 'source-atop',
        sf_sourcein: 'source-in',
        sf_sourceout: 'source-out',
        sf_destinationatop: 'destination-atop',
        sf_destinationin: 'destination-in',
        sf_destinationout: 'destination-out',
        sf_destinationover: 'destination-over',
        sf_lighter: 'lighter',
        sf_hue: 'hue',
        // sf_textMask: 'xor'
    };

    let filteredImageCanvas = document.createElement('canvas');
    let filteredImageCtx = filteredImageCanvas.getContext('2d');
    filteredImageCanvas.width = options.width;
    filteredImageCanvas.height = options.height;

    const centerX = filteredImageCanvas.width / 2;
    const centerY = filteredImageCanvas.height / 2;

    filteredImageCtx.beginPath();
    filteredImageCtx.fillStyle = ""; 
    filteredImageCtx.arc(centerX, centerY, 150, 0, Math.PI * 2);
    filteredImageCtx.fill();
    filteredImageCtx.closePath();

    let selectedCompositeOperation = document.getElementById('sf_options').value;
    let compositeOperation = compositeOperations[selectedCompositeOperation];
    filteredImageCtx.globalCompositeOperation = compositeOperation;

    filteredImageCtx.drawImage(
        image, 
        0, 
        0, 
        filteredImageCanvas.width, 
        filteredImageCanvas.height
    );
    
    if (selectedCompositeOperation === 'sf_lighter' || selectedCompositeOperation === 'sf_hue') {
        filteredImageCtx.globalCompositeOperation = 'source-over'
        filteredImageCtx.fillStyle = 'rgba(173, 216, 230, 0.7)';
        filteredImageCtx.beginPath();
        filteredImageCtx.arc(centerX, centerY, 150, 0, Math.PI * 2); 
        filteredImageCtx.fill();
    }

    filteredImageCtx.globalCompositeOperation = 'source-over';


    let imageData = filteredImageCtx.getImageData(0, 0, options.width, options.height);
    // Apply filters
    for (let i = 0; i < imageData.data.length; i += 4) {
        // Adjust RGB values
        imageData.data[i + 0] += options.red; 
        imageData.data[i + 1] += options.green; 
        imageData.data[i + 2] += options.blue; 

        // Threshold
        if (options.threshold) {
            let grayscale = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
            let threshold = grayscale < 128 ? 0 : 255;
            imageData.data[i] = threshold;
            imageData.data[i + 1] = threshold; 
            imageData.data[i + 2] = threshold; 
        }

        // Posterise
        if (options.posterise) {
            imageData.data[i + 0] -= imageData.data[i + 0] % 64; 
            imageData.data[i + 1] -= imageData.data[i + 1] % 64; 
            imageData.data[i + 2] -= imageData.data[i + 2] % 64; 
        }

        // Invert
        if (options.invert) {
            imageData.data[i + 0] = 255 - imageData.data[i + 0]; 
            imageData.data[i + 1] = 255 - imageData.data[i + 1]; 
            imageData.data[i + 2] = 255 - imageData.data[i + 2];
        }

        // Sepia
        if (options.sepia) {
            let red = imageData.data[i];
            let green = imageData.data[i + 1];
            let blue = imageData.data[i + 2];
            imageData.data[i] = (red * 0.393) + (green * 0.769) + (blue * 0.189); 
            imageData.data[i + 1] = (red * 0.349) + (green * 0.686) + (blue * 0.168); 
            imageData.data[i + 2] = (red * 0.272) + (green * 0.534) + (blue * 0.131); 
        }

        // Greyscale
        if (options.greyscale) {
            let grayscale = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
            imageData.data[i] = grayscale; 
            imageData.data[i + 1] = grayscale; 
            imageData.data[i + 2] = grayscale; 
        }

        // Adjust brightness
        imageData.data[i + 0] += options.brightness; 
        imageData.data[i + 1] += options.brightness; 
        imageData.data[i + 2] += options.brightness; 
    }

    filteredImageCtx.putImageData(imageData, 0, 0);

    return filteredImageCanvas;
}


//(Aesthetic purposes) Update toolbar background = colorpicker,
// EXCEPT the light pink colour at defaut (default) or white
window.addEventListener('DOMContentLoaded', function () {
     let defaulthexvalue = "#000000";
     let colorpicker = document.getElementById("sf_colorpicker");
     colorpicker.value = defaulthexvalue;
});

window.addEventListener('DOMContentLoaded', function () {
    let colorpicker = document.getElementById("sf_colorpicker");
    let defaultToolbarBackground = "linear-gradient(to right, #e6b8b7, #e6c0b8, #e6c8b8, #e6d0b8, #e6d8b8, #e6e0b8, #dfe6b8, #d7e6b8, #cfe6b8, #c7e6b8, #b8e6be, #b8e6c6, #b8e6ce, #b8e6d6, #b8e6de)";
    let defaultBrushScale = "rgb(134, 134, 134)"
    
    function changeToolbarColor() {

        let toolbar = document.getElementById("sf_toolbar");
        let brushscaler = document.getElementById("sf_brushScaling");
        let selectedColor = colorpicker.value;
        if (selectedColor.toUpperCase() === "#FFFFFF" || selectedColor.toUpperCase() === "#000000") {
            toolbar.style.background = defaultToolbarBackground;
            brushscaler.style.accentColor = defaultBrushScale;
        } else {
            toolbar.style.background = selectedColor;
            brushscaler.style.accentColor = selectedColor;
        }
    }
    changeToolbarColor();
    colorpicker.addEventListener('change', function () {
        changeToolbarColor();
    });

});

function mousedownHandler(e) {
    if (e.which === 1) {
        let canvasBoundingRectangle = canvas.getBoundingClientRect();
        mouseX = e.clientX - canvasBoundingRectangle.left;
        mouseY = e.clientY - canvasBoundingRectangle.top;
        let clickedInsideImage = false;
        for (let i = images.length - 1; i > -1; i--) {
            if (mouseIsInsideImage(images[i].x, images[i].y, images[i].width, images[i].height, mouseX, mouseY)) {
                if (!eraseEnabled) { 
                    canvas.style.cursor = "pointer";
                    offsetX = mouseX - images[i].x;
                    offsetY = mouseY - images[i].y;
                    currentImageIndex = i;
                    clickedInsideImage = true;
                    renderCanvas();
                    break;
                }
            }
        }
        if (!clickedInsideImage && !eraseEnabled) { 
            canvas.style.cursor = "default";
            currentImageIndex = null;
            renderCanvas();
        }
    }
}

function moveHandler(e) {
    if (!scribbleEnabled && currentImageIndex !== null && e.which === 1 && !eraseEnabled) { // Allow image movement only if eraser is not enabled
        let canvasBoundingRectangle = canvas.getBoundingClientRect();
        mouseX = e.clientX - canvasBoundingRectangle.left;
        mouseY = e.clientY - canvasBoundingRectangle.top;
        images[currentImageIndex].x = mouseX - offsetX;
        images[currentImageIndex].y = mouseY - offsetY;
        renderCanvas();
    }
    if (scribbleEnabled && e.which === 1) {
        let canvasBoundingRectangle = canvas.getBoundingClientRect();
        mouseX = e.clientX - canvasBoundingRectangle.left;
        mouseY = e.clientY - canvasBoundingRectangle.top;
        scribbleCanvasCtx.beginPath();
        scribbleCanvasCtx.arc(mouseX, mouseY, radius, 0, Math.PI * 2);
        scribbleCanvasCtx.fill();
        scribbleCanvasCtx.closePath();
        renderCanvas();
    }
}

//---------scaling img
function mousewheelHandler(e) {
    if (currentImageIndex !== null) {
        let canvasBoundingRectangle = canvas.getBoundingClientRect();
        mouseX = e.clientX - canvasBoundingRectangle.left;
        mouseY = e.clientY - canvasBoundingRectangle.top;
        let oldWidth = images[currentImageIndex].width;
        let oldHeight = images[currentImageIndex].height;
        let scaleFactor = 1 - e.deltaY / 1200;
        let oldCentreX = images[currentImageIndex].x + oldWidth / 2;
        let oldCentreY = images[currentImageIndex].y + oldHeight / 2;
        images[currentImageIndex].width *= scaleFactor;
        images[currentImageIndex].height *= scaleFactor;
        let newWidth = images[currentImageIndex].width;
        let newHeight = images[currentImageIndex].height;
        images[currentImageIndex].x = oldCentreX - newWidth / 2;
        images[currentImageIndex].y = oldCentreY - newHeight / 2;
        renderCanvas();
        }
    }


//-------am i touching the img
function mouseIsInsideImage(imageTopLeftX, imageTopLeftY, imageWidth, imageHeight, x, y) {
    if ((x > imageTopLeftX) && (y > imageTopLeftY)) {
        if (x > imageTopLeftX) {
            if ((x - imageTopLeftX) > imageWidth) {
                return false;
            }
        }
        if (y > imageTopLeftY) {
            if ((y - imageTopLeftY) > imageHeight) {
                return false;
            }
        }
    } 
    else 
    {
        return false;
    }
    return true;
}

//-----pullout bar filters
    function setRotationDegrees(newRotationDegrees) {
        images[currentImageIndex].rotation = parseInt(newRotationDegrees);
        renderCanvas();
    }
    function setBrightness(newBrightness) {
        images[currentImageIndex].brightness = parseInt(newBrightness);
        renderCanvas();
    }
    function toggleGreyscale() {
            images[currentImageIndex].greyscale = !images[currentImageIndex].greyscale;
            renderCanvas();
    }
    function toggleSepia() {
        images[currentImageIndex].sepia = !images[currentImageIndex].sepia;
        renderCanvas();
    }
    function toggleInvert() {
        images[currentImageIndex].invert = !images[currentImageIndex].invert;
        renderCanvas();
    }
    function togglePosterise() {
        images[currentImageIndex].posterise = !images[currentImageIndex].posterise;
        renderCanvas();
    }
    function toggleThreshold() {
        images[currentImageIndex].threshold = !images[currentImageIndex].threshold;
        renderCanvas();
    }
    function setRGB(value, color) {
        images[currentImageIndex][color] = parseInt(value);
        renderCanvas();
}

function enableScribbling() {
    scribbleEnabled = true;
    eraseEnabled = false;
    canvas.style.cursor = "crosshair";
    drawBtn.style.backgroundColor = "#5c5c5c";
    eraserBtn.style.backgroundColor = ""; 
}

function enableErasing() {
    eraseEnabled = true;
    scribbleEnabled = false;
    canvas.style.cursor = "pointer";
    drawBtn.style.backgroundColor = "";
    eraserBtn.style.backgroundColor = "#474646";
}



function startDrawingOrErasing(e) {
    if (scribbleEnabled || eraseEnabled) {
        isDrawing = true;
        let canvasBoundingRectangle = canvas.getBoundingClientRect();
        lastX = e.clientX - canvasBoundingRectangle.left;
        lastY = e.clientY - canvasBoundingRectangle.top;
    }
}

// function startDrawingOrErasing(e) {
//     if (scribbleEnabled || eraseEnabled) {
//         isDrawing = true;
//         let canvasBoundingRectangle = canvas.getBoundingClientRect();
//         mouseX = e.clientX - canvasBoundingRectangle.left;
//         mouseY = e.clientY - canvasBoundingRectangle.top;
//         lastX = mouseX;
//         lastY = mouseY;
//     }
// }


function drawOrErase(e) {
    if ((scribbleEnabled || eraseEnabled) && isDrawing) {
        let canvasBoundingRectangle = canvas.getBoundingClientRect();
        mouseX = e.clientX - canvasBoundingRectangle.left;
        mouseY = e.clientY - canvasBoundingRectangle.top;
        if (scribbleEnabled) {
            scribbleCanvasCtx.strokeStyle = scribbleCanvasCtx.fillStyle;
            scribbleCanvasCtx.beginPath();
            scribbleCanvasCtx.moveTo(lastX, lastY);
            scribbleCanvasCtx.lineTo(mouseX, mouseY);
            scribbleCanvasCtx.stroke();
            scribbleCanvasCtx.closePath();
        } else if (eraseEnabled) {
            scribbleCanvasCtx.clearRect(mouseX - radius / 2, mouseY - radius / 2, radius, radius);
            renderCanvas();
        }
        lastX = mouseX;
        lastY = mouseY;
    }
}


    function stopDrawingOrErasing() {
        isDrawing = false;
    }


    function toggleScribbling() {
        scribbleEnabled = !scribbleEnabled;
        eraseEnabled = false; 
        updateButtonStyles();
    }
    
    function toggleErasing() {
        eraseEnabled = !eraseEnabled;
        scribbleEnabled = false; 
        updateButtonStyles();
    }

    function updateButtonStyles() {
        drawBtn.style.backgroundColor = scribbleEnabled ? "red" : "";
        eraserBtn.style.backgroundColor = eraseEnabled ? "red" : "";
    }

function color(newColor) {
    scribbleCanvasCtx.fillStyle = newColor;
    console.log(newColor)
    console.log("new color")
}
function radiusSize(newRadiusSize) {
    radius = newRadiusSize;
}
Math.radians = function (degrees) {
    return degrees * Math.PI / 180;
}

//-------text
function renderTexts() {
    texts.forEach((text) => {
        ctx.font = text.font;
        ctx.fillStyle = text.color;
        ctx.textAlign = text.align;
        ctx.textBaseline = text.baseline;
        ctx.fillText(text.content, text.x, text.y);
    });
}

function addText(content, font, color, align, baseline, x, y) {
    let newText = {
        content: content,
        font: font,
        color: color,
        align: align,
        baseline: baseline,
        x: x,
        y: y
    };
    texts.push(newText);
    renderCanvas();
}

function deleteText(index) {
    texts.splice(index, 1);
    renderCanvas();
}

function enterText() {
    let content = prompt("Enter text here");
    if (content) {
        let font = "30px Arial";
        let color = "black";
        let align = "center";
        let baseline = "middle";
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        addText(content, font, color, align, baseline, x, y);
    }
}

//---------save
function saveCanvas() {
    let dataURL = canvas.toDataURL();
    let link = document.createElement('a');
    link.href = dataURL;
    link.download = 'canvas_image.jpg';
    link.click();
}

//---------insert btn
function insertImage() {
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            let reader = new FileReader();
            reader.onload = function (e) {
                let img = new Image();
                img.onload = function () {
                    let initialX = (canvas.width - img.width) / 2;
                    let initialY = (canvas.height - img.height) / 2;
                    let newImage = {
                        src: img,
                        x: initialX,
                        y: initialY,
                        width: img.width,
                        height: img.height,
                        rotation: 0,
                        red: 0,
                        green: 0,
                        blue: 0,
                        threshold: false,
                        posterise: false,
                        invert: false,
                        sepia: false,
                        greyscale: false,
                        brightness: 0
                    };
                    images.push(newImage);
                    scribbleEnabled = false;
                    renderCanvas();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(this.files[0]);
        }
    });
    fileInput.click();
}

//------del
function deleteImage() {
    console.log('deleted')
    if (currentImageIndex !== null) {
        images.splice(currentImageIndex, 1);
        currentImageIndex = null;
        renderCanvas();
    }
}