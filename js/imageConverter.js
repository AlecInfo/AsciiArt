const canvas = document.getElementById('preview');
const fileInput = document.querySelector('input[type="file"');
const asciiImage = document.getElementById('ascii');
const btnRefresh = document.getElementById('btnRefresh');

const context = canvas.getContext('2d');

const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;

const getFontRatio = () => {
    const pre = document.createElement('pre');
    pre.style.display = 'inline';
    pre.textContent = ' ';

    document.body.appendChild(pre);
    const { width, height } = pre.getBoundingClientRect();
    document.body.removeChild(pre);

    return height / width;
};

const fontRatio = getFontRatio();

const convertToGrayScales = (context, width, height) => {
    const imageData = context.getImageData(0, 0, width, height);

    const grayScales = [];

    for (let i = 0 ; i < imageData.data.length ; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        const grayScale = toGrayScale(r, g, b);
        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = grayScale;

        grayScales.push(grayScale);
    }

    context.putImageData(imageData, 0, 0);

    return grayScales;
};


var w = window.innerWidth;

var width_max = 85;
var height_max = 85;

if (w <= 480) {
    width_max = 23;
    height_max = 23;
}else if(w <= 768){
    width_max = 40;
    height_max = 40;
}



const clampDimensions = (width, height) => {
    const rectifiedWidth = Math.floor(getFontRatio() * width);

    if (height > height_max) {
        const reducedWidth = Math.floor(rectifiedWidth * height_max / height);
        return [reducedWidth, height_max];
    }

    if (width > width_max) {
        const reducedHeight = Math.floor(height * width_max / rectifiedWidth);
        return [width_max, reducedHeight];
    }

    return [rectifiedWidth, height];
};

fileInput.onchange = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
        const image = new Image();
        image.onload = () => {
            const [width, height] = clampDimensions(image.width, image.height);

            canvas.width = width;
            canvas.height = height;

            context.drawImage(image, 0, 0, width, height);
            const grayScales = convertToGrayScales(context, width, height);

            fileInput.style.display = 'none';
            btnRefresh.style.display = "inline";
            
            drawAscii(grayScales, width);
        }

        image.src = event.target.result;
    };

    reader.readAsDataURL(file);
};

//const grayRamp = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
const grayRamp = '@%#*+=-:. ';
const rampLength = grayRamp.length;

const getCharacterForGrayScale = grayScale => grayRamp[Math.ceil((rampLength - 1) * grayScale / 255)];

const drawAscii = (grayScales, width) => {
    const ascii = grayScales.reduce((asciiImage, grayScale, index) => {
        let nextChars = getCharacterForGrayScale(grayScale);
        if ((index + 1) % width === 0) {
            nextChars += '\n';
        }

        return asciiImage + nextChars;
    }, '');

    asciiImage.textContent = ascii;
};