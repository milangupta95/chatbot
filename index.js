const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const { createWorker } = require('tesseract.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/webhook', async (req, res) => {
  const twiml = new MessagingResponse();
  const message = twiml.message();

  if (req.body.NumMedia > 0) {
    const mediaUrl = req.body.MediaUrl0;
    const worker = createWorker();

    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(mediaUrl);
    await worker.terminate();

    message.body(`Extracted Text: ${text}`);
  } else {
    message.body('No image found.');
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
