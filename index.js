const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
var request = require('request')
var fs = require('fs')
var filename = 'pic.png'
var Tesseract = require('tesseract.js')

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/webhook', async (req, res) => {
    const twiml = new MessagingResponse();
    const message = twiml.message();

    if (req.body.NumMedia > 0) {
        const url = req.body.MediaUrl0;
        Tesseract.recognize(url)
            .then(function (result) {
                console.log(result.text);
            });
    } else {
        message.body('No image found.');
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
