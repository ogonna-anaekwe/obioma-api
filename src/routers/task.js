const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const auth = require('../middleware/auth')

// create new task endpoint w/ async await
router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
        // add owner to body
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// fetch tasks endpoint w/o async await
// router.get('/tasks', (req, res) => {
//     Task.find({}).then((tasks) => {
//         res.send(tasks)
//     }).catch((e) => {
//         res.status(500).send(e)
//     })
// })

// fetch tasks endpoint w/ async await
router.get('/tasks', auth, async (req, res) => {
    try {
        // const tasks = await Task.find({ owner: req.user_id })
        await req.user.populate('tasks').execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
    // try {
    //     const tasks = await Task.find({})
    //     res.status(200).send(tasks)
    // } catch (e) {
    //     res.status(500).send()
    // }
})

// fetch specific task endpoint w/o async await
// router.get('/tasks/:id', (req, res) => {
//     const _id = req.params.id
//     Task.findById(_id).then((task) => {
//         if (!task) {
//             return res.status(404).send()
//         }
//         res.send(task)
//     }).catch((e) => {
//         res.status(500).send()
//     })
// })

// fetch specific task enpoint w/ async await
router.get('/tasks/:id', auth, async (req, res) => {
    // this will be passed as an argument to findOne
    // note id: _id wouldn't work here, hence the object deconstruction being applied
    const _id = req.params.id
    
    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({_id, owner: req.user._id })
        if (!task) {
        return res.status(404).send()
    }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

// update specific task endpoint w/ async await
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!'})
    }

    const _id = req.params.id
    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        //     new: true, runValidators: true
        // })
        const task = await Task.findOne({_id, owner: req.user._id })
        // const task = await Task.findById(req.params.id)

        if (!task) {
            res.status(404).send()
        }
        console.log(task)

        updates.forEach((update) => {
            task[update] = req.body[update]
        })

        await task.save()
        res.send(task)

    } catch (e) {
        res.status(500).send()
    }
})

// delete specific task
router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        // const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id})
        
        if (!task) {
            return res.status(404).send()
        }
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router