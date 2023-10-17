const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const { createWorker } = require('tesseract.js');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/whatsapp', async (req, res) => {
  const twiml = new MessagingResponse();

  if (req.body.NumMedia > 0 && req.body.MediaContentType0.startsWith('image/')) {
    const imageUrl = req.body.MediaUrl0;

    // Local path to the downloaded image (replace with your file path).
    const localImagePath = 'image.jpg';

    // Use Tesseract.js to extract text from the local image.
    const worker = createWorker();
    try {
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');

      // Read the image from the local file.
      const imageBuffer = fs.readFileSync(localImagePath);
      const { data: { text } } = await worker.recognize(imageBuffer);
      await worker.terminate();

      // Process the extracted text or respond with it.
      twiml.message(`OCR Result: ${text}`);
    } catch (error) {
      console.error('Error processing image:', error);
      twiml.message('An error occurred while processing the image.');
    }
  } else {
    twiml.message("Please send an image for OCR.");
  }

  res.send(twiml.toString());
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
