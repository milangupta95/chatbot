const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const { createWorker } = require('tesseract.js');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize the Twilio client
const accountSid = 'ACbc78c90f0241b895f9a24da9c662db20';
const authToken = '3346c54df3d3b84b3e1e5a5e1e010e81';
const client = require('twilio')(accountSid, authToken);

app.post('/webhook', async (req, res) => {
  const twiml = new MessagingResponse();

  if (req.body.NumMedia > 0 && req.body.MediaContentType0.startsWith('image/')) {
    const imageUrl = req.body.MediaUrl0;

    // Use Tesseract.js to extract text from the image.
    const worker = createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(imageUrl);
    await worker.terminate();

    // Send the extracted text as a WhatsApp response.
    const responseMessage = `OCR Result: ${text}`;
    twiml.message(responseMessage);

    // Send the response via WhatsApp
    client.messages.create({
      to: req.body.From,
      from: req.body.To,
      body: responseMessage,
    });
  } else {
    twiml.message("Please send an image for OCR.");
  }

  res.send(twiml.toString());
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
