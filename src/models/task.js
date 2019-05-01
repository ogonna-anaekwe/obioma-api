// this file defines the task model
const mongoose = require('mongoose')

// define the task schema
const taskSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            trim: true,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        // stores the id of who created the task
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User' // this helps link the User and Task models
            // User is the name of the module exported from the User model
        }
    }
)

// specify the middleware. this tells the schema what to do before creating the model
taskSchema.pre('save', async function (next) {
    const task = this
    if (task.isModified('description')) {
        task.description = await task.description
    }

    next()
})

// tasks collection model and schema
const Task = mongoose.model('Task', taskSchema)

module.exports = Task