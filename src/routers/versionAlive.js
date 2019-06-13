const express = require('express')
const router = new express.Router()

router.get('/health', async (req, res) => {
    res.status(200).send('ok')
})

module.exports = router