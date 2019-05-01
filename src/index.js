const cors = require('cors')
const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const collectionRouter = require('./routers/collection')
const prospectRouter = require('./routers/prospect')

const app = express() // will be used to create routes and start listening port
const port = process.env.PORT // prod vs local port for server

app.use(cors())
app.options('*', cors())
app.use(express.json())
app.use(userRouter)
app.use(collectionRouter)
app.use(prospectRouter)


app.listen(port, () => {
    console.log('Obioma SERVER is live on ', port)
})

