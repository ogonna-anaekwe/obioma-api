const express = require('express')
const Prospect = require('../models/prospect')
const router = new express.Router()
const sg = require('sendgrid')(process.env.SENDGRID_APIKEY)
const twilio = require('twilio')
const accountSid = process.env.TWILIO_SID
const authToken = process.env.TWILIO_TOKEN
const client = twilio(accountSid, authToken)
const auth = require('../middleware/auth')

// create new prospect endpoint w/ async await
router.post('/prospects', async (req, res) => {
    const prospect = new Prospect(req.body)
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
      const textMessageBody = req.body.customerName + ' just completed your contact form and can be reached on ' + req.body.customerPhone + ' or ' + req.body.customerEmail
    try {
        await prospect.save()
        res.status(201).send(prospect)
        // text message logic
        client.messages.create({
     body: textMessageBody,
     from: '+16475573003',
     to: '+2348173025603'
   })
  .then(message => {
    console.log('user info successfully texted to SANKS: ', message)
  }).catch(e => console.log(e));
  // email logic
        sg.API(request)
  .then(function (response) {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
  })
  .catch(function (error) {
    console.log(error.response.statusCode);
  });
    } catch (e) {
        res.status(400).send(e)
    }
})

// need to add auth middleware to this route
router.get('/prospects', auth, async (req, res) => {
    try {
        const prospects = await Prospect.find({})
        res.status(200).send(prospects)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router