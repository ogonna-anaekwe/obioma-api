// this file defines the user model
const mongoose = require('mongoose')
const validator = require('validator')

const prospectSchema = new mongoose.Schema({
    customerName: { // represents the company's name
        type: String,
        required: true,
        trim: true, 
        lowercase: true
    },
    customerEmail: {
        type: String,
        // unique: true, // guarantees no two users have the same email
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            } 
        }
    },
    customerRequest: {
        type: String,
        trim: true,
        lowercase: true
    },
    customerPhone: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: "+2348173028603"
    },
    customerContactTime: {
        type: String,
        trim: true,
        lowercase: true
    }
}, { timestamps: true })


// prospects collection model and schema
const Prospect = mongoose.model('Prospect', prospectSchema)

module.exports = Prospect