const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
require('./db/mongoose')
const userRouter = require('./routers/user')
const collectionRouter = require('./routers/collection')
const prospectRouter = require('./routers/prospect')
const versionAlive = require('./routers/versionAlive')

const app = express() // will be used to create routes and start listening port
const port = process.env.PORT // prod vs local port for server

const multer = require('multer')

app.use(cors())
// app.use(express.static(__dirname + '/public'));
// app.options('*', cors())
app.use(express.json())
app.use(userRouter)
app.use(collectionRouter)
app.use(prospectRouter)
app.use(versionAlive)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded( { extended: false }))

app.listen(port, () => {
    console.log('Obioma SERVER is live on ', port)
})

