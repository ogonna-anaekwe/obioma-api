const express = require('express')
const Collection = require('../models/collection')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

const upload = multer({
    limits: {
        fileSize: 1000000 // bytes
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
            return cb(new Error('Please upload a JPEG or PNG file'))
        } 
        cb(undefined, true)
    }
})
// create new collection endpoint w/ async await
router.post('/collections', auth, upload.single('collectionImage'), async (req, res) => {
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

// add picture to each collection based on id
// collectionImage is the key of the req in postman
router.post('/collections/:id', auth, upload.single('collectionImage'), async (req, res) => {
    // const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    const buffer = await sharp(req.file.buffer).png().toBuffer()
    // get ID of collection to be updated
    const _id = req.params.id
    // find full data corresponding to the collection based on supplied ID
    const collection = await Collection.findOne({_id, owner: req.user._id })

    // add image to the collection
    collection.image = buffer
    
    // save updated collection with image
    await collection.save()
    res.send()
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

module.exports = router