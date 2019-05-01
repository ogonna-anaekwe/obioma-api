// note here collection refers to the gallery created by the client
// collection here is used differently from a database name as defined in by mongodb
// this file defines the collection model
const mongoose = require('mongoose')

// define the collection schema
const collectionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        price: {
            type: Number,
            default: 0
        },
        category: {
            type: String,
            // required: true,
            trim: true,
            lowercase: true
        },
        description: {
            type: String,
            // required: true,
            trim: true,
            lowercase: true
        },
        image: {
            type: Buffer
        },
        favorite: {
            type: String,
            // required: true,
            trim: true,
            lowercase: true
        },
        colour: {
            type: String,
            // required: true,
            trim: true,
            lowercase: true
        },
        availability: {
            type: String,
            // required: true,
            trim: true,
            lowercase: true
        },
        location: {
            type: String,
            // required: true,
            trim: true,
            lowercase: true
        },
        // no longer necessary since we can leverage mongoose's inbuilt timestamp function
        // dateAdded: {
        //     type: Date,
        //     default: new Date()
        // },
        // stores the id of who created the collection
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User' // this helps link the User and Collection models
            // User is the name of the module exported from the User model
        }
    }, { 
        timestamps: true 
    }
)

// specify the middleware. this tells the schema what to do before creating the model
collectionSchema.pre('save', async function (next) {
    const collection = this
    if (collection.isModified('description')) {
        collection.description = await collection.description
    }

    next()
})

// collections collection model and schema
const Collection = mongoose.model('Collection', collectionSchema)

module.exports = Collection