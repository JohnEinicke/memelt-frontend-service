const axios = require('./axiosInstance')

/* Variable n counts the incoming requests */
let n = 0

/**
 * A function creating logging data from the provided text
 * @param {string} text - Text to convert
 * @param {number} [level = 0] - Amount of blank spaces before the text
 * @return {void} - Nothing
 */
function log(text, level = 0) {
    /* If: Logging is enabled with environment-variable*/
    if (process.env.LOG === "Yes") {
        /* Initial blank space before text */
        let tabs = ""
        /* Create blank spaces before text depending on the varaible level */
        for (let i = 0; i < level; i++)
            tabs += "  "
        /* send logging-data to console for debug purposes */
        console.log(tabs + text)
    }
}

/**
 * A function sending logging data to the health service
 * @param {string} type - The type of the sent body, Request or Response
 * @param {number} body - Body from the request/response
 * @return {void} - Nothing
 */
async function logToHealthservice(type, body) {
    /* If: Logging is enabled with environment-variable*/
    if (process.env.LOG === "Yes") {
        try {
            /* send logging-data to console for debug purposes */
            log(type + ': To Health: ' + JSON.stringify(body), 1)
            /* Send body to log as a string to the Health-Service */
            const response = await axios(process.env.HEALTH_SERVICE_ADDRESS + "v1/health/log", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                data: JSON.stringify(body)
            })
            /* If: response-status from Health-Service is 201, send logging data to console */
            if (response.status === 201) log("Successfully logged to Health-Service", 1)
            /* Else: Health-Service is sending a response-status not specified in their swagger-file, log information in the console */
            else log("Health-Service gave unspecified response: " + response.status, 1)
        } catch (err) {
            /* If: no response from Health-Service after timeout */
            if (err.code === 'ECONNABORTED') log("Fetch from Health-Service timed out")
            /* Else if: Health-Service responds with status-code 400, log information in console */
            else if (err.response.status === 400) {
                log("Somehow there is a bad requst", 1)
                log(JSON.stringify(err.response.data))
            }
            /* Else: unknown error */
            else log("Unidentified error: " + err)
        }
    }

}
/**
 * A function giving the number of requests to this service
 * @return {number} - Amount of requests to this service
 */
function getN() {
    return n
}

/**
* A function extracting notable information from a request for logging purposes
* @param {callback} middleware - Express middleware 
* @return {void} - Nothing
*/
let requestLogger = (req, res, next) => {
    /* Log important information from a request to the console */
    log("Request: " + req.method + " " + req.originalUrl + " " + JSON.stringify(req.body))
    /* Increment n to count the amount of requests */
    n++
    next();
}

module.exports = { log, logToHealthservice, requestLogger, getN }