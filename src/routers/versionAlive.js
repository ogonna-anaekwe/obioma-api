const express = require('express')
const router = new express.Router()

// need to add auth middleware to this route
router.get('/health', async (req, res) => {
    res.status(200).send('ok')
})

module.exports = router