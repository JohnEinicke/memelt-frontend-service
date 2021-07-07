let express = require('express')
let router = express.Router()
const dummyImage = '/resources/dummyImage.bmp'
const sendResponse = require("../services/sendResponse")
const { log, logToHealthservice } = require("../services/logging")
const log_fetch = require("../services/fetch")

/**
 * Route serving object containing memes based on query string
 * @route {GET} /search
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
router.post('/search', function (req, res, next) {
    /* If: valid request */
    if (req.body.query) {
        /* split whole query string into smaller tags */
        const arrayOfTags = req.body.query.trim().split(" ")
        /* get memes from Storage-Service for each tag */
        Promise.all(arrayOfTags.map(tag => {
            return log_fetch('STORAGE', process.env.STORAGE_SERVICE_ADDRESS + "meta/tag", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                data: JSON.stringify({ tag })
            })
        }))
            /* If: no memes found for tag -> return {}, Else: return memes */
            .then(results => {
                Promise.all(results.map(result => {
                    if (result.status === 404) return {}
                    else if (result.status === 200) return result.data
                }))
                    /* filter out redundant memes with the same id */
                    .then(data => {
                        const memes = {}
                        data.forEach(memesByTag => {
                            for (const key of Object.keys(memesByTag))
                                memes[key] = memesByTag[key]
                        })
                        sendResponse(req, res, 200, {}, memes)
                    })
                    .catch(err => log(err, 1))
            })
            .catch(err => {
                /* If: no response from Storage-Service after timeout*/
                if (err.code === 'ECONNABORTED') sendResponse(req, res, 408, { message: "Fetching from Storage-Service timed out" })
                /* Else: unknown error */
                else sendResponse(req, res, 500, {}, { message: "Unidentified error", error: "" + err, storageServiceResponse: err.response.data })
            })
    }
    /* Else: invalid request, req.body.query not provided */
    else {
        sendResponse(req, res, 400, {}, { message: 'Invalid request' })
    }
})

/**
 * Route serving binary of an image belonging to meme with given memeid
 * @route {GET} /meme/:memeid
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware 
 */
router.get("/meme/:memeid", async function (req, res, next) {
    try {
        /* log_fetch: logging request to Health-Service and making request to Storage-Service */
        const response = await log_fetch('STORAGE', process.env.STORAGE_SERVICE_ADDRESS + "memes/" + req.params.memeid, {
            method: 'GET'
        })
        /* IF: request was successful */
        if (response.status === 200) {
            //Special case
            /* log: log string to the console */
            log("Response: " + 200 + " [IMAGE_BINARY]")
            /* logToHealthService: now logging Response to Health-Service */
            logToHealthservice('Response', {
                "info": {
                    "selfServiceName": "FRONTEND",
                    "statusCode": 200,
                    "requestedUrl": process.env.FRONTEND_SERVICE_HOST + req.url,
                    "timestamp": new Date()
                }
            })
            res.status(200).send(response.data.meme);
        }
        /* Else: Storage-Service returned unspecified response */
        else sendResponse(req, res, 500, {}, { message: "Storage-Service gave unspecified response", storageServiceResponse: { status: response.status, body: response.data } })

    }
    catch (err) {
        /* Log error to the console */
        log(err, 1)
        /* If: no response from Storage-Service after timeout*/
        if (err.code === 'ECONNABORTED') sendResponse(req, res, 408, { message: "Fetching from Storage-Service timed out" })
        /* Else if: invalid request */
        else if (err.response.status === 400) sendResponse(req, res, 400, {}, { message: "Invalid Request", storageServiceResponse: err.response.data })
        /* Else if: meme not found */
        else if (err.response.status === 404) sendResponse(req, res, 404, {}, { message: "Meme not found", storageServiceResponse: err.response.data })
        /* Else: unknown error */
        else sendResponse(req, res, 500, {}, { message: "Unidentified error", error: "" + err, storageServiceResponse: err.response.data })
    }
})

/**
 * Route serving object containing latest 50 memes
 * @route {GET} /latest
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware 
 */
router.get('/latest', async function (req, res, next) {
    try {
        /* log_fetch: logging request to Health-Service and making request to Storage-Service*/
        const response = await log_fetch('STORAGE', process.env.STORAGE_SERVICE_ADDRESS + "meta/latest", {
            method: 'GET'
        })
        /* IF: request was successful */
        if (response.status === 200) sendResponse(req, res, 200, {}, response.data)
        /* Else: Storage-Service returned unspecified response */
        else sendResponse(req, res, 500, {}, { message: "Storage-Service gave unspecified response", storageServiceResponse: { status: response.status, body: response.data } })
    }
    catch (err) {
        /* Log error to the console */
        log(err, 1)
        /* If: no response from Storage-Service after timeout*/
        if (err.code === 'ECONNABORTED') sendResponse(req, res, 408, { message: "Fetching from Storage-Service timed out" })
        /* Else: unknown error */
        else sendResponse(req, res, 500, {}, { message: "Unidentified error", error: "" + err, storageServiceResponse: err.response.data })
    }
})

module.exports = router
