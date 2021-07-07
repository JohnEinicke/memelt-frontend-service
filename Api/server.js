/* importing required modules */
const express = require('express')
const app = express()
require("dotenv").config()
const cors = require('cors')
const searchRoute = require('./routes/search.js')
const userRoute = require('./routes/user.js')
const healthRoute = require("./routes/health.js")
const cookieParser = require("cookie-parser")
const { requestLogger } = require("./services/logging")
const sendResponse = require('./services/sendResponse.js')

/* importing port and host from environment variables */
const port = process.env.FRONTEND_SERVICE_PORT
const host = process.env.FRONTEND_SERVICE_HOST

/* implementing cookieparser for cookie usage */
app.use(cookieParser())

/* deprecated */
app.use(cors({
    exposedHeaders: ['jwt_token']
}))

/* standard header for responses */
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, ContentType, Accept")
    next()
})

/* to parse json */
app.use(express.json())
/* log requests to the console */
app.use(requestLogger)
/* setting up the server on specified port and host */
app.listen(port, host, () => {
    console.log(`Server up on ${host} and ready on port ${port}!`)
})

/* add routes */
app.use("/", searchRoute)
app.use('/users', userRoute)
app.use("/health", healthRoute)
/* default response route */
app.use(async function (req, res, err) {
    try {
        sendResponse(req, res, 404, {}, { message: "Hello from Frontend-Service" })
    } catch (err) {
        console.log(err)
    }
})
