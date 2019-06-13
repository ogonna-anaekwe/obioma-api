const express = require('express')
const Collection = require('../models/collection')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const path = require('path')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // without the path.join, multer/express will not know that the uploads folder exists
      cb(null, path.join(__dirname,'./public/uploads/'))
    },
    filename: function(req, file, cb) {
      console.log(file)
      cb(null, file.originalname)
    }
  })

// create new collection endpoint w/ async await
router.post('/collections', auth, async (req, res) => {
    const collection = new Collection({
        // add owner to body
        ...req.body,
        owner: req.user._id // this value comes from the user const defined in the auth middleware
    })
    try {
        await collection.save()
        res.status(201).send(collection)
        //console.log(req.body)
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

// get all created collections. Doesn't require authentication as this 
// should be visible and accessible by everyone
router.get('/collections', async (req, res) => {
    try {
        const collections = await Collection.find({})
        res.status(200).send(collections)
    } catch (e) {
        res.status(500).send()
    }
})


// get specific collection. Unlike the route above,
// this doesn't require auth, so that means the req.user._id would be undefined
// this is because req.user is undefined
// hence why we use findById(_id)
router.get('/collections/:id', async (req, res) => {
    // this will be passed as an argument to findOne
    // note id: _id wouldn't work here, hence the object deconstruction being applied
    const _id = req.params.id
    try {
        const collection = await Collection.findById(_id)
        if (!collection) {
        return res.status(404).send()
    }
        res.send(collection)
    } catch (e) {
        res.status(500).send()
    }
})

// update specific collection endpoint w/ async await
router.patch('/collections/:id', auth, async (req, res) => {
    // const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'price', 'category', 'description', 'image', 'colour', 'availability', 'location', 'email', 'phone_number']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!'})
    }

    const _id = req.params.id
    try {
        const collection = await Collection.findOne({_id, owner: req.user._id })

        if (!collection) {
            res.status(404).send()
        }

        updates.forEach((update) => {
            collection[update] = req.body[update]
        })
        await collection.save()
        res.send(collection)

    } catch (e) {
        res.status(500).send()
        console.log(e)
    }
})

// delete specific collection
router.delete('/collections/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        // const collection = await Collection.findByIdAndDelete(req.params.id)
        const collection = await Collection.findOneAndDelete({ _id, owner: req.user._id})
        
        if (!collection) {
            return res.status(404).send()
        }
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/collections/:id', auth, async (req, res, next) => {
    try {
    const _id = req.params.id
    // console.log(_id)
    const collection = await Collection.findOne({_id, owner: req.user._id })
    // console.log(collection)
    const upload = multer({ storage }).single('image')
    upload(req, res, function(err) {
      if (err) {
        return res.send(err)
      }
      console.log('file uploaded to server')
      console.log(req.file)
  
      // SEND FILE TO CLOUDINARY
      const cloudinary = require('cloudinary').v2
      cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET
      })
      
      const path = req.file.path
      const uniqueFilename = new Date().toISOString()
  
      cloudinary.uploader.upload(
        path,
        { public_id: `blog/${uniqueFilename}`, tags: `blog` }, // directory and tags are optional
        function(err, image) {
          if (err) return res.send(err)
          console.log('file uploaded to Cloudinary')
          console.log(image)
          // remove file from server
          const fs = require('fs')
          fs.unlinkSync(path)
          // return image details
          res.json(image.secure_url)
          console.log(image.secure_url)
          collection.image = image.secure_url
          collection.save()
          res.status(201).send()
        }
      )
    })} catch (e) {
        console.log(e)
    }
    // await collection.save()
    // res.send()
  })

module.exports = router