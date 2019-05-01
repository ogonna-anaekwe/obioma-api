const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        // get user token
        const token =  req.header('Authorization').replace('Bearer ', '')
        // verify user token using jwt secret
        // decoded gives the user ID tied to the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // use user ID in the decoded token to find user
        // this is the user object that defines 'owner' in the rest of the code
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if(!user) {
            throw new Error()
        }

        // add the token to the req object
        req.token = token
        // add the user ID to the req object
        req.user = user

        // the above two lines add the token and user found above to the request object
        // and so we can eventually reference the user and/or token when we send our request (i.e. after auth) in our routes
        next()
    } catch (e) {
        res.status(401).send({ error: 'You need to authenticate to perform this operation.' })
    }
}

module.exports = auth

