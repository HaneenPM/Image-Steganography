// Function to encode a message into the image using the LSB method
function encodeMessage() {
  const imageInput = document.getElementById('inputImage');
  const message = document.getElementById('message').value;
  
  if (!imageInput.files.length || !message) {
    alert("Please upload an image and enter a message.");
    return;
  }

  const file = imageInput.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const binaryMessage = stringToBinary(message) + '1111111111111110'; // Adding delimiter
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let pixelIndex = 0;

      // Embed message into the image pixels (LSB method)
      for (let i = 0; i < binaryMessage.length; i++) {
        const pixel = pixels.data[pixelIndex];
        const newPixel = setLeastSignificantBit(pixel, binaryMessage[i]);
        pixels.data[pixelIndex] = newPixel;
        pixelIndex++;
      }

      ctx.putImageData(pixels, 0, 0);

      // Create a downloadable image
      const outputImage = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = outputImage;
      link.download = 'encoded_image.png';
      link.click();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// Function to decode the hidden message from the image using LSB method
function decodeMessage() {
  const decodeImageInput = document.getElementById('decodeImage');

  if (!decodeImageInput.files.length) {
    alert("Please upload an image to decode.");
    return;
  }

  const file = decodeImageInput.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let binaryMessage = '';
      let pixelIndex = 0;

      // Retrieve message from the image pixels (LSB method)
      while (pixelIndex < pixels.data.length) {
        const pixel = pixels.data[pixelIndex];
        binaryMessage += getLeastSignificantBit(pixel);
        pixelIndex++;
      }

      // Find the message delimiter and extract the hidden message
      const messageEndIndex = binaryMessage.indexOf('1111111111111110');
      if (messageEndIndex !== -1) {
        binaryMessage = binaryMessage.slice(0, messageEndIndex);
      }

      const message = binaryToString(binaryMessage);
      document.getElementById('decodedMessage').textContent = `Decoded Message: ${message}`;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// Utility function to convert a string to binary
function stringToBinary(str) {
  return str.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
}

// Utility function to convert binary to string
function binaryToString(binary) {
  const output = [];
  for (let i = 0; i < binary.length; i += 8) {
    output.push(String.fromCharCode(parseInt(binary.slice(i, i + 8), 2)));
  }
  return output.join('');
}

// Function to get the least significant bit of a number
function getLeastSignificantBit(pixel) {
  return (pixel & 1).toString();
}

// Function to set the least significant bit of a number
function setLeastSignificantBit(pixel, bit) {
  return (pixel & ~1) | (bit === '1' ? 1 : 0);
}
