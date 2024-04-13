let canvas = null;
let ctx = null;

let offscreenCanvas = null;
let offscreenCanvasCtx = null;

let imageWidth = 100;
let imageHeight = 100;
let imageX = 250;
let imageY = 250;

let img1 = new Image();
img1.src = "wony.jpg";
let img2 = new Image();
img2.src = "wony.jpg";
let img3 = new Image();
img3.src = "wony.jpg";
let images = [
    {src: img1, x: 100, y: 100, width: 100, height: 100, rotation: 0, red: 0, green: 0, blue: 0, threshold: false, posterise: false, invert: false, sepia: false, greyscale: false, brightness: 0},
    {src: img2, x: 200, y: 200, width: 100, height: 100, rotation: 0, red: 0, green: 0, blue: 0, threshold: false, posterise: false, invert: false, sepia: false, greyscale: false, brightness: 0},
    {src: img3, x: 300, y: 300, width: 100, height: 100, rotation: 0, red: 0, green: 0, blue: 0, threshold: false, posterise: false, invert: false, sepia: false, greyscale: false, brightness: 0}
];


let drawBtn = null;
let eraserBtn = null;
let currentImageIndex = 0;

let offsetX = 0;
let offsetY = 0;

let radius = 10;
let scribbleCanvas = null; 
let scribbleCanvasCtx = null; 

let eraserCanvas = null;
let eraserCanvasCtx = null;
let scribbleEnabled = false;
let eraseEnabled = false;

window.onload = onAllAssetsLoaded;
document.write("<div id='sf_loadingMessage'>Loading...</div>");
function onAllAssetsLoaded() {
    // hide the webpage loading message
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

    eraserCanvas = document.createElement("canvas");
    eraserCanvasCtx = eraserCanvas.getContext("2d");
    eraserCanvas.width = canvas.clientWidth;
    eraserCanvas.height = canvas.clientHeight;

    renderCanvas();
    drawBtn = document.getElementById('sf_drawing');
    // eraserBtn = document.getElementById('sf_erasing');
    drawBtn.addEventListener("click", enableScribble);
    // drawBtn.addEventListener("click", eraseScribble);

    canvas.addEventListener('mousedown', mousedownHandler);
    canvas.addEventListener('mousemove', moveHandler);
    window.onmousewheel = document.onmousewheel = mousewheelHandler;

    scribbleCanvasCtx.fillStyle = "black"
    // document.getElementById("colourpicker").value = "#000000"
}

function renderCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    images.forEach((image, index) => {
        offscreenCanvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        if (index === currentImageIndex) {
            offscreenCanvasCtx.fillStyle = "darkgrey";
            // Save the current canvas state before applying transformations
            offscreenCanvasCtx.save();
            offscreenCanvasCtx.translate((image.x + image.width / 2), (image.y + image.height / 2)); // Translate to the center of the image
            offscreenCanvasCtx.rotate(Math.radians(image.rotation)); // Rotate the canvas
            offscreenCanvasCtx.fillRect(-image.width / 2 - 2, -image.height / 2 - 2, image.width + 4, image.height + 4); // Draw the rotated border
            // Restore the saved canvas state to reset transformations
            offscreenCanvasCtx.restore();
        }
        // Apply filters directly to the image
        let filteredImage = applyFilters(image.src, image);

        // Draw the filtered image on the offscreen canvas
        offscreenCanvasCtx.save(); // Save the current canvas state
        offscreenCanvasCtx.translate((image.x + image.width / 2), (image.y + image.height / 2)); // Translate to the center of the image
        offscreenCanvasCtx.rotate(Math.radians(image.rotation)); // Rotate the canvas
        offscreenCanvasCtx.drawImage(filteredImage, -image.width / 2, -image.height / 2, image.width, image.height); // Draw the image at the translated and rotated position
        offscreenCanvasCtx.restore(); // Restore the saved canvas state

        // Draw the offscreen canvas on the main canvas
        ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(scribbleCanvas, 0, 0, canvas.width, canvas.height);
    });
}



function applyFilters(image, options) {
    let filteredImageCanvas = document.createElement('canvas');
    let filteredImageCtx = filteredImageCanvas.getContext('2d');
    filteredImageCanvas.width = options.width;
    filteredImageCanvas.height = options.height;

    filteredImageCtx.drawImage(image, 0, 0, options.width, options.height);

    let imageData = filteredImageCtx.getImageData(0, 0, options.width, options.height);

    // Apply filters
    for (let i = 0; i < imageData.data.length; i += 4) {
        // Adjust RGB values
        imageData.data[i + 0] += options.red; // Red
        imageData.data[i + 1] += options.green; // Green
        imageData.data[i + 2] += options.blue; // Blue

        // Threshold
        if (options.threshold) {
            let grayscale = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
            let threshold = grayscale < 128 ? 0 : 255;
            imageData.data[i] = threshold; // Red
            imageData.data[i + 1] = threshold; // Green
            imageData.data[i + 2] = threshold; // Blue
        }

        // Posterise
        if (options.posterise) {
            imageData.data[i + 0] -= imageData.data[i + 0] % 64; // Red
            imageData.data[i + 1] -= imageData.data[i + 1] % 64; // Green
            imageData.data[i + 2] -= imageData.data[i + 2] % 64; // Blue
        }

        // Invert
        if (options.invert) {
            imageData.data[i + 0] = 255 - imageData.data[i + 0]; // Red
            imageData.data[i + 1] = 255 - imageData.data[i + 1]; // Green
            imageData.data[i + 2] = 255 - imageData.data[i + 2]; // Blue
        }

        // Sepia
        if (options.sepia) {
            let red = imageData.data[i];
            let green = imageData.data[i + 1];
            let blue = imageData.data[i + 2];
            imageData.data[i] = (red * 0.393) + (green * 0.769) + (blue * 0.189); // Red
            imageData.data[i + 1] = (red * 0.349) + (green * 0.686) + (blue * 0.168); // Green
            imageData.data[i + 2] = (red * 0.272) + (green * 0.534) + (blue * 0.131); // Blue
        }

        // Greyscale
        if (options.greyscale) {
            let grayscale = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
            imageData.data[i] = grayscale; // Red
            imageData.data[i + 1] = grayscale; // Green
            imageData.data[i + 2] = grayscale; // Blue
        }

        // Adjust brightness
        imageData.data[i + 0] += options.brightness; // Red
        imageData.data[i + 1] += options.brightness; // Green
        imageData.data[i + 2] += options.brightness; // Blue
    }

    filteredImageCtx.putImageData(imageData, 0, 0);

    return filteredImageCanvas;
}


// function renderCanvas() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     images.map((image, index) => {
//         offscreenCanvasCtx.clearRect(0, 0, canvas.width, canvas.height);
//         if (index === currentImageIndex) {
//             offscreenCanvasCtx.fillStyle = "darkgrey";
//             offscreenCanvasCtx.fillRect(image.x - 2, image.y - 2, image.width + 4, image.height + 4);
//         }
//         offscreenCanvasCtx.drawImage(image.src, image.x, image.y, image.width, image.height);
//         imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height);

//         //Red, green, blue
//         for (let i = 0; i < imageData.data.length; i += 4) {
//             imageData.data[i + 0] = imageData.data[i + 0] + image.red;
//             imageData.data[i + 1] = imageData.data[i + 1] + image.green;
//             imageData.data[i + 2] = imageData.data[i + 2] + image.blue;
//         }
//         offscreenCanvasCtx.putImageData(imageData, image.x, image.y);

//         // THRESHOLD
//         if (image.threshold) {
//             imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height);
//             for (let i = 0; i < imageData.data.length; i += 4) {
//                 for (let rgb = 0; rgb < 3; rgb++) {
//                     if (imageData.data[i + rgb] < 128) {
//                         imageData.data[i + rgb] = 0;
//                     } else {
//                         imageData.data[i + rgb] = 255;
//                     }
//                 }
//                 imageData.data[i + 3] = 255;
//             }
//             offscreenCanvasCtx.putImageData(imageData, image.x, image.y);
//         }

//         // POSTERISE
//         if (image.posterise) {
//             imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height);
//             for (let i = 0; i < imageData.data.length; i += 4) {
//                 imageData.data[i + 0] = imageData.data[i + 0] - imageData.data[i + 0] % 64;
//                 imageData.data[i + 1] = imageData.data[i + 1] - imageData.data[i + 1] % 64;
//                 imageData.data[i + 2] = imageData.data[i + 2] - imageData.data[i + 2] % 64;
//                 imageData.data[i + 3] = 255;
//             }
//             offscreenCanvasCtx.putImageData(imageData, image.x, image.y);
//         }
//         // INVERT
//         if (image.invert) {
//             imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height);

//             for (let i = 0; i < imageData.data.length; i += 4) {
//                 imageData.data[i + 0] = 255 - imageData.data[i + 0];
//                 imageData.data[i + 1] = 255 - imageData.data[i + 1];
//                 imageData.data[i + 2] = 255 - imageData.data[i + 2];
//             }
//             offscreenCanvasCtx.putImageData(imageData, image.x, image.y);
//         }
//         // SEPIA
//         if (image.sepia) {
//             imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height);
//             for (let i = 0; i < imageData.data.length; i += 4) {
//                 red = imageData.data[i];
//                 green = imageData.data[i + 1];
//                 blue = imageData.data[i + 2];
//                 imageData.data[i] = (red * 0.393) + (green * 0.769) + (blue * 0.189);
//                 imageData.data[i + 1] = (red * 0.349) + (green * 0.686) + (blue * 0.168);
//                 imageData.data[i + 2] = (red * 0.272) + (green * 0.534) + (blue * 0.131);
//             }
//             offscreenCanvasCtx.putImageData(imageData, image.x, image.y);
//         }

//         // GREYSCALE
//         if (image.greyscale)
//         {
//             imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height);
//             for (let i = 0; i < imageData.data.length; i += 4) {
//                 let grayscale = (imageData.data[i + 0] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
//                 imageData.data[i + 0] = grayscale;
//                 imageData.data[i + 1] = grayscale;
//                 imageData.data[i + 2] = grayscale;
//                 imageData.data[i + 3] = 255;
//             }
//             offscreenCanvasCtx.putImageData(imageData, image.x, image.y);
//         }

//         // BRIGHTNESS
//         imageData = offscreenCanvasCtx.getImageData(image.x, image.y, image.width, image.height);
//         for (let i = 0; i < imageData.data.length; i += 4) {
//             imageData.data[i + 0] = imageData.data[i + 0] + image.brightness;
//             imageData.data[i + 1] = imageData.data[i + 1] + image.brightness;
//             imageData.data[i + 2] = imageData.data[i + 2] + image.brightness;
//             imageData.data[i + 3] = 255;
//         }
//         offscreenCanvasCtx.putImageData(imageData, image.x, image.y);

//         // ROTATE IMAGE
//         ctx.save();
//         ctx.translate((image.x + image.width / 2), (image.y + image.height / 2));
//         ctx.rotate(Math.radians(image.rotation));
//         ctx.translate(-(image.x + image.width / 2), -(image.y + image.height / 2));
//         ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
//         ctx.drawImage(scribbleCanvas, 0, 0, canvas.width, canvas.height);
//         ctx.restore();
//     });
// }

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
                canvas.style.cursor = "pointer"
                offsetX = mouseX - images[i].x;
                offsetY = mouseY - images[i].y;
                currentImageIndex = i;
                clickedInsideImage = true;
                renderCanvas();
                break;
            }
        }
        if (!clickedInsideImage) {
            canvas.style.cursor = "default";
            currentImageIndex = null;
            renderCanvas();
        }
    }
}


function moveHandler(e) {
    if (!scribbleEnabled && currentImageIndex !== null && e.which === 1) {
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


function mousewheelHandler(e) {
    if (currentImageIndex !== null) {
        let canvasBoundingRectangle = canvas.getBoundingClientRect();
        mouseX = e.clientX - canvasBoundingRectangle.left;
        mouseY = e.clientY - canvasBoundingRectangle.top;
        {
            let oldCentreX = images[currentImageIndex].x + (images[currentImageIndex].width / 2);
            let oldCentreY = images[currentImageIndex].y + (images[currentImageIndex].height / 2);
            images[currentImageIndex].width += e.wheelDelta / 120;
            images[currentImageIndex].height += e.wheelDelta / 120;
            images[currentImageIndex].x = oldCentreX - (images[currentImageIndex].width / 2);
            images[currentImageIndex].y = oldCentreY - (images[currentImageIndex].height / 2);
            renderCanvas();
        }
    }
}

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
    } else {
        return false;
    }
    return true;
}

//pullout bar functions
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

    function deleteIMG(){
        console.log('delete img')
        ctx.clearRect(images[currentImageIndex].x,images[currentImageIndex].y,images[currentImageIndex].x + images[currentImageIndex].width ,images[currentImageIndex].y +images[currentImageIndex].height );
        renderCanvas();
    }
}

function enableScribble() {
    // if (eraseEnabled) 
    // {
    //     eraseScribble();
    //     enableScribble = !enableScribble;
    // }
    scribbleEnabled = !scribbleEnabled;
    if(scribbleEnabled)
    {
    canvas.style.cursor = "crosshair"
    drawBtn.style.backgroundColor = "#5c5c5c";
    console.log('true')
    }   
    else
    {
    canvas.style.cursor = "default"
    drawBtn.style.backgroundColor = "#a5a5a5cd";
    console.log('drawing')
    }
}

// function eraseScribble() {
//     // if (scribbleEnabled) 
//     // {
//     //     enableScribble()
//     //     eraseScribble = !eraseScribble;
//     // }
//     scribbleEnabled = !scribbleEnabled;
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     renderCanvas();
//     if (eraseEnabled) {
//         console.log('eraser')
//         canvas.style.cursor = "pointer";
//         eraserBtn.style.backgroundColor = "#474646";
//     } else {
//         canvas.style.cursor = "default";
//         eraserBtn.style.backgroundColor = "";
//     }
// }

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

//Add text function
function enterText()
{
let text = prompt("Enter text here");

}

//Save PNG
function saveCanvas() {
    let dataURL = canvas.toDataURL();
    let link = document.createElement('a');
    link.href = dataURL;
    link.download = 'canvas_image.jpg';
    link.click();
}

//upload
// img.src = URL.createObjectURL(this.files[0]);
function insertImage() {
    // uploadImgBtn.classList.remove('hidden');
    // let fileInput = document.createElement('input');
    // let removeButton = document.createElement('button');

    // fileInput.type = 'file';
//     fileInput.addEventListener('change', function () {
//         if (this.files ?. [0]) {
//             let img = new Image();
//             img.onload = function () {
//                 offscreenCanvasCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
//                 offscreenCanvasCtx.drawImage(img, 0, 0, offscreenCanvas.width, offscreenCanvas.height);

//                 renderCanvas;
//                 // removeButton.textContent = 'Remove Image';
//                 // removeButton.addEventListener('click', function () {
//                 //     ctx.clearRect(0, 0, canvas.width, canvas.height);
//                 //     offscreenCanvasCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
//                 //     removeButton.remove();
//                 // });

//                 // insertImage.appendChild(removeButton);
//             };
//             img.src = URL.createObjectURL(this.files[0]);
//         }
//     });
//     fileInput.click();
}