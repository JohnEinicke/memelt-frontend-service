const { log, logToHealthservice } = require('./logging')

/**
 * Function that makes Response-Object ready to be sent back and logs response to the Health-Service
 * @param {express.Request} req - Incoming Request-Object
 * @param {express.Response} res - Outgoing Response-Object
 * @param {number} statusCode - Status code of the response
 * @param {object} header - Optional headers of the response
 * @param {object} body - Body of the response
 * @return {void} - Nothing
 */
function sendResponse(req, res, statusCode, header, body) {
    str = ""
    /* Only log body to the console, if its stringified object is shorter than or equals 1000 characters */
    if (body)
        if (JSON.stringify(body).length <= 1000)
            str = JSON.stringify(body)
    /* log status code and the body to the console */
    log("Response: " + statusCode + " " + str)
    /* log  Response to Health-Service */
    logToHealthservice('Response', {
        "info": {
            "selfServiceName": "FRONTEND",
            "statusCode": statusCode,
            "requestedUrl": process.env.FRONTEND_SERVICE_HOST + req.url,
            "timestamp": new Date()
        }
    })
    /* Set attributes of the Response-Object */
    res.statusCode = statusCode
    res.header = header
    res.json(body)
}

module.exports = sendResponse