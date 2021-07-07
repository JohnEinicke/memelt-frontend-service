let express = require('express')
let router = express.Router()
const sendResponse = require("../services/sendResponse")
const log_fetch = require("../services/fetch")
const { log, getN } = require("../services/logging")

/**
 * Route serving object containing {status: "ONLINE"}
 * @route {GET} /health
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware 
 */
router.get('/', async function (req, res, next) {
    /* Send response containing status "ONLINE" */
    sendResponse(req, res, 200, {}, { status: "ONLINE" })
})

/**
* Route providing meta-information about this service
* @route {GET} /health/meta
* @param {string} path - Express path
* @param {callback} middleware - Express middleware 
*/
router.get('/meta', async function (req, res, next) {
    /* Send response containing the local variable n, which increments after answering a request */
    sendResponse(req, res, 200, {}, { "numberOfRequests": getN(), message: "Got n requests" })
})

/**
* Route providing status-information about every service
* @route {GET} /health/status
* @param {string} path - Express path
* @param {callback} middleware - Express middleware 
*/
router.get('/status', async function (req, res, next) {
    try {
        /* Fetching status data from every service from the health service */
        const response = await log_fetch('HEALTH', process.env.HEALTH_SERVICE_ADDRESS + "v1/health/services", {
            method: "GET"
        })
        /* If: response-status from Health-Service is 200, pass response to client */
        if (response.status === 200) sendResponse(req, res, 200, {}, response.data)
        /* If: Health-Service is sending a response-status not specified in their swagger-file, notify client */
        else sendResponse(req, res, 500, {}, { message: "Health-Service gave unspecified response", healthServiceResponse: { status: response.status, body: response.data } })

    } catch (err) {
        /* create logging-data in console for debug purposes */
        log(err, 1)
        /* If: no response from Health-Service after timeout*/
        if (err.code === 'ECONNABORTED') sendResponse(req, res, 408, { message: "Fetching from Health-Service timed out" })
        /* Else: unknown error */
        else sendResponse(req, res, 500, {}, { message: "Unidentified error", error: "" + err, healthServiceResponse: err.response.data })
    }
})

/**
 * Route providing all data that was collected by Health-Service
 * @route {GET} /health/data
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware 
 */
router.get('/data', async function (req, res, next) {
    try {
        /* Fetching data from health service */
        const response = await log_fetch('HEALTH', process.env.HEALTH_SERVICE_ADDRESS + "v1/health/data", {
            method: "GET"
        });
        /* If: response-status from Health-Service is 200, pass response to client */
        if (response.status === 200) sendResponse(req, res, 200, {}, response.data)
        /* If: Health-Service is sending a response-status not specified in their swagger-file, notify client */
        else sendResponse(req, res, 500, {}, { message: "Health-Service gave unspecified response", healthServiceResponse: { status: response.status, body: response.data } })

    } catch (err) {
        /* create logging-data in console for debug purposes */
        log(err, 1)
        /* If: no response from Health-Service after timeout*/
        if (err.code === 'ECONNABORTED') sendResponse(req, res, 408, { message: "Fetching from Health-Service timed out" })
        /* Else: unknown error */
        else sendResponse(req, res, 500, {}, { message: "Unidentified error", error: "" + err, healthServiceResponse: err })
    }
})

/**
 * Route serving array of logs
 * @route {POST} /health/logs
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware 
 */
router.post('/logs', async function (req, res, next) {
    /* if page and limit attribute inside of body are provided */
    if (req.body.page && req.body.limit) {
        try {
            /* log_fetch: logging request to Health-Service and making request to Storage-Service */
            const response = await log_fetch('HEALTH', process.env.HEALTH_SERVICE_ADDRESS + `v1/health/logs?page=${req.body.page}&limit=${req.body.limit}`, {
                method: "GET",
            })
            /* If: request was successful */
            if (response.status === 200) sendResponse(req, res, 200, {}, response.data)
            /* Else: Storage-Service returned unspecified response */
            else sendResponse(req, res, 500, {}, { message: "Health-Service gave unspecified response", healthServiceResponse: { status: response.status, body: response.data } })

        } catch (err) {
            /* Log error to the console */
            log(err, 1)
            /* If: no response from Storage-Service after timeout*/
            if (err.code === 'ECONNABORTED') sendResponse(req, res, 408, { message: "Fetching from Health-Service timed out" })
            /* Else: unknown error */
            else sendResponse(req, res, 500, {}, { message: "Unidentified error", error: "" + err, healthServiceResponse: err })
        }
    }
    /* if page and limit weren*t provided inside the body */
    else {
        sendResponse(req, res, 400, {}, { message: 'Invalid request' })
    }
})

module.exports = router
