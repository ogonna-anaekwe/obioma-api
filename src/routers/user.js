const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

const upload = multer({
    // dest: 'avatar',
    limits: {
        fileSize: 1000000 // bytes
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
            return cb(new Error('Please upload a JPEG or PNG file'))
        } 
        cb(undefined, true)
        // cb(undefined, false)
    }
})

// create new user endpoint w/o async await
// router.post('/users', (req, res) => {
//     const user = new User(req.body)
//     user.save().then(() => {
//         res.status(201).send(user)
//     }).catch((e) => {
//         res.status(400).send(e)
//     })
// })

// create new user endpoint w/ async await. this represents sign up
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    // console.log(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user: user, token: token})
        // res.status(201).send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// fetch users endpoint w/o async await
// router.get('/users', (req, res) => {
//     User.find({}).then((users) => {
//         res.send(users)
//     }).catch((e) => {
//         res.status(500).send(e)
//     })
// })

// sign in users endpoint w/ async await
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        // res.send(user)
        // res.send({ user: user, token: token})
        res.send({ user: user, token: token })
    } catch (e) {
        res.status(400).send()
    }
})

// logout of single session/device endpoint 
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// logout of all sessions/devices endpoint
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
} )

// fetch users endpoint w/ async await
router.get('/users/me', auth ,async (req, res) => {
    res.send(req.user)
    // try {
    //     const users = await User.find({})
    //     res.send(users)
    // } catch (e) {
    //     res.status(500).send()
    // }
})

// fetch specific user endpoint w/o async await
// router.get('/users/:id', (req, res) => {
//     const _id = req.params.id
//     User.findById(_id).then((user) => {
//         if (!user) {
//             return res.status(404).send()
//         }
//         res.send(user)
//     }).catch((e) => {
//         res.status(500).send()
//     })
// })

// fetch specific user endpoint w/ async await
// router.get('/users/:id', async (req, res) => {
//     // console.log(req.body)
//     const _id = req.params.id
//     const user = await User.findById(_id)

//     try {

//     if (!user) {
//         return res.status(404).send()
//     }
//         res.send(user)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

// update user record
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']

    // check that every field that's being updated actually exists
    // in the already defined schema
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!'})
    }

    try {
        // const user = await User.findById(req.params.id)
        // const user = await User.findById(req.user._id)
        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })
        await req.user.save()
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        //     new: true, runValidators: true
        // })

        if (!req.user) {
            return res.status(404).send()
        }
        res.send(req.user)

    } catch (e) {
        res.status(400).send()
    }
})

// delete user endpoint
router.delete('/users/me', auth, async (req, res) => {
    try {
        // we have access to the user object in the req because of the authentication middleware
        const user = await User.findByIdAndDelete(req.user._id)
        // if (!user) {
        //     return res.status(404).send()
        // }
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

// create new task endpoint w/o async await
// router.post('/tasks', (req, res) => {
//     const task = new Task(req.body)
//     task.save().then(() => {
//         res.status(201).send(task)
//     }).catch((e) => {
//         res.status(400).send(e)
//     })
// })

// endpoint for creating user avatar
router.post('/users/me/avatar', auth, upload.single('userAvatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
})

// endpoint for deleting user avatar
router.delete('/users/me/avatar', auth, upload.single('userAvatar'), async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

// endpoint to get user avatar

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})
module.exports = router