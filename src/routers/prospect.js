const express = require('express')
const Prospect = require('../models/prospect')
const router = new express.Router()
const sg = require('sendgrid')(process.env.SENDGRID_APIKEY);
// we don't need auth for any endpoint in this router

// create new prospect endpoint w/ async await
router.post('/prospects', async (req, res) => {
    const prospect = new Prospect(req.body)
    // console.log(req.body)
    const request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
          personalizations: [
            {
              to: [
                {
                  email: 'sanks.bs@gmail.com'
                }
              ],
              subject: 'New Prospect Captured'
            }
          ],
          from: {
            email: 'ogoo.anaekwe@gmail.com'
          },
          content: [
            {
              type: 'text/plain',
              value: 'Hello there, ' +
              req.body.customerName.toUpperCase() +
              ' completed the form on your website. '
              + req.body.customerName.toUpperCase() +
              ' can be reached on phone: ' +
              req.body.customerPhone +
              ' or via email: ' +
              req.body.customerEmail +'.'
            }
          ]
        }
      });
    try {
        await prospect.save()
        res.status(201).send(prospect)
        sg.API(request)
  .then(function (response) {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
  })
  .catch(function (error) {
    // error is an instance of SendGridError
    // The full response is attached to error.response
    console.log(error.response.statusCode);
  });
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/prospects', async (req, res) => {
    try {
        const prospects = await Prospect.find({})
        res.status(200).send(prospects)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router