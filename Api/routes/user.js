let express = require('express')
let router = express.Router()
const sendResponse = require("../services/sendResponse")
const log_fetch = require("../services/fetch")
const { log } = require("../services/logging")

/**
 * Route creating a new user object
 * @route {POST} /users/register
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware 
 */
router.post('/register', async function (req, res, next) {
    /* If: valid request */
    if (req.body.name && req.body.email && req.body.password) {
        try {
            /* pass name, email and password to User-Service to register */
            const response = await log_fetch('USER', process.env.USER_SERVICE_ADDRESS + "users", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                data: JSON.stringify(req.body)
            });
            /* If: response-status from User-Service is 201, pass response to client */
            if (response.status === 201) sendResponse(req, res, 201, {}, { message: "Successfully registered", userServiceResponse: { body: response.data } })
            
            /* If: User-Service is sending a response-status not specified in their swagger-file, notify client */
            else sendResponse(req, res, 500, {}, { message: "User-Service gave unspecified response", userServiceResponse: { status: response.status, body: response.data } })
        }
        catch (err) {
            /* create logging-data in console for debug purposes */
            log(err, 1)
            /* If: no response from User-Service after timeout */
            if (err.code === 'ECONNABORTED') sendResponse(req, res, 408, { message: "Fetching from User-Service timed out" })
            /* Else if: user-service responds with response-status 400, user already exists, notify client */
            else if (err.response.status === 400) sendResponse(req, res, 409, {}, { message: 'User with this email already exists', userServiceResponse: err.response.data })
            /* Else: unknown error */
            else sendResponse(req, res, 500, {}, { message: "Unidentified error", error: "" + err, userServiceResponse: err.response.data })
        }
    }
    /* Else: invalid request, req.body.name, req.body.email, req.body.password not provided */
    else {
        sendResponse(req, res, 400, {}, { message: 'Invalid request' })
    }
})

 /**
 * Route loggin in an user
 * @route {POST} /users/login
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware 
 */
router.post('/login', async function (req, res, next) {
    /* If: valid request */
    if (req.body.email && req.body.password) {
        try {
            /* pass name, email and password to User-Service to login */
            const response = await log_fetch('USER', process.env.USER_SERVICE_ADDRESS + "auth/login", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                data: JSON.stringify(req.body)
            })
            /* If: response-status from User-Service is 201, pass response to client and create cookie containing the authToken */
            if (response.status === 201) {
                res.cookie("authToken", response.data.access_token, { maxAge: 999999999, httpOnly: true })
                sendResponse(req, res, 200, {}, { message: "Successfully logged in" })
            }
            /* If: User-Service is sending a response-status not specified in their swagger-file, notify client */
            else sendResponse(req, res, 500, {}, { message: "User-Service gave unspecified response", userServiceResponse: { status: response.status, body: response.data } })
        }
        catch (err) {
            /* create logging-data in console for debug purposes */
            log(err, 1)
            /* If: no response from User-Service after timeout */
            if (err.code === 'ECONNABORTED') sendResponse(req, res, 408, { message: "Fetching from User-Service timed out" })
            /* Else if: user-service responds with response-status 401, wrong credentials, notify client */
            else if (err.response.status === 401) sendResponse(req, res, 401, {}, { message: 'Credentials invalid', userServiceResponse: err.response.data })
            /* Else: unknown error */
            else sendResponse(req, res, 500, {}, { message: "Unidentified error", error: "" + err, userServiceResponse: err.response.data })

        }
    }
    /* Else: invalid request, req.body.email, req.body.password not provided */
    else {
        sendResponse(req, res, 400, {}, { message: 'Invalid request' })
    }
})

 /**
 * Route logging out an user
 * @route {GET} /users/logout
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware 
 */
router.get('/logout', function (req, res, next) {
    /* If: client sends an existing cookie containing an authToken */
    if (req.cookies.authToken) {
        /* remove the cookie and notify the client */
        res.clearCookie("authToken")
        sendResponse(req, res, 200, {}, { message: "Successfully logged out" })
    }
    /* Else: client does not send a cookie containing an authToken */
    else {
        sendResponse(req, res, 401, {}, { message: "Not logged in" })
    }
})

/**
 * Route deleting an existing user object
 * @route {POST} /users/delete
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware 
 */
router.post('/delete', async function (req, res, next) {
    /* If: client does not send a cookie containing an authToken */
    if (!req.cookies.authToken) {
        sendResponse(req, res, 401, {}, { message: 'Not logged in' })
    }
    /* Else: Client sends cookie containing authToken => user is logged in */
    else {
        try {
            /* Pass the authToken to User-Service to delete the user */
            const response = await log_fetch('USER', process.env.USER_SERVICE_ADDRESS + "users", {
                method: "DELETE",
                headers: {
                    "Authorization": "bearer " + req.cookies.authToken
                }
            })
            /* If: response-status from User-Service is 200, pass response to client */
            if (response.status === 200) sendResponse(req, res, 200, {}, { message: "Successfully deleted", userServiceResponse: { body: response.data } })
            /* If: User-Service is sending a response-status not specified in their swagger-file, notify client */
            else sendResponse(req, res, 500, {}, { message: "User-Service gave unspecified response", userServiceResponse: { status: response.status, body: response.data } })

        }
        catch (err) {
            /* create logging-data in console for debug purposes */
            log(err, 1)
            /* If: no response from User-Service after timeout */
            if (err.code === 'ECONNABORTED') sendResponse(req, res, 408, { message: "Fetching from User-Service timed out" })
            /* Else if: user-service responds with response-status 401, unauthorized, notify client */
            else if (err.response.status === 401) sendResponse(req, res, 401, {}, { message: 'Unauthorized', userServiceResponse: err.response.data })
            /* Else: unknown error */
            else sendResponse(req, res, 500, {}, { message: "Unidentified error", error: "" + err, userServiceResponse: err.response.data })
        }
    }
})



/**
 * Route fetching array of favorites from current user
 * @route {GET} /users/favorites
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware 
 */
router.get('/favorites', async function (req, res, next) {
    try {
        /* fetch favorites from user service */
        const response = await log_fetch('USER', process.env.USER_SERVICE_ADDRESS + "users/favorites", {
            method: "GET",
            headers: {
                "Authorization": "bearer " + req.cookies.authToken
            }
        });
        /* If: response-status from User-Service is 200, pass response to client */
        if (response.status === 200) sendResponse(req, res, 200, {}, response.data )        
        /* If: User-Service is sending a response-status not specified in their swagger-file, notify client */
        else sendResponse(req, res, 500, {}, { message: "User-Service gave unspecified response", userServiceResponse: { status: response.status, body: response.data } })
    }
    catch (err) {
        /* create logging-data in console for debug purposes */
        log(err, 1)
        /* If: no response from User-Service after timeout */
        if (err.code === 'ECONNABORTED') sendResponse(req, res, 408, { message: "Fetching from User-Service timed out" })
        /* Else if: user-service responds with response-status 401, unauthorized, notify client */
        else if (err.response.status === 401) sendResponse(req, res, 401, {}, { message: 'Unauthorized', userServiceResponse: err.response.data })
        /* Else: unknown error */
        else sendResponse(req, res, 500, {}, { message: "Unidentified error", error: "" + err, userServiceResponse: err.response.data })
    }
})

/**
 * Route adding a favorite to the current user
 * @route {POST} /users/favorites/:memeId
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware 
 */
router.post('/favorites', async function (req, res, next) {
    /* If: valid request */
    if (req.body.memeId) {
    try {
        /* add favorite to current user */
        const response = await log_fetch('USER', process.env.USER_SERVICE_ADDRESS + "users/favorites", {
            method: "POST",
            headers: {
                "Authorization": "bearer " + req.cookies.authToken,
                "content-type": "application/json"
            },
            data: JSON.stringify(req.body)
        });
        /* If: response-status from User-Service is 201, pass response to client */
        if (response.status === 201) sendResponse(req, res, 201, {}, response.data )        
        /* If: User-Service is sending a response-status not specified in their swagger-file, notify client */
        else sendResponse(req, res, 500, {}, { message: "User-Service gave unspecified response", userServiceResponse: { status: response.status, body: response.data } })
    }
    catch (err) {
        /* create logging-data in console for debug purposes */
        log(err, 1)
        /* If: no response from User-Service after timeout */
        if (err.code === 'ECONNABORTED') sendResponse(req, res, 408, { message: "Fetching from User-Service timed out" })
        /* Else if: user-service responds with response-status 401, unauthorized, notify client */
        else if (err.response.status === 401) sendResponse(req, res, 401, {}, { message: 'Unauthorized', userServiceResponse: err.response.data })
        /* Else: unknown error */
        else sendResponse(req, res, 500, {}, { message: "Unidentified error", error: "" + err, userServiceResponse: err.response.data })
    }
}
/* Else: invalid request, req.body.memeId not provided */
else {
    sendResponse(req, res, 400, {}, { message: 'Invalid request' })
}
})

/**
 * Route removing a favorite to the current user
 * @route {DELETE} /users/favorites/:memeId
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware 
 */
router.delete('/favorites/:memeId', async function (req, res, next) {
    try {
        /* remove favorite from the current user */
        const response = await log_fetch('USER', process.env.USER_SERVICE_ADDRESS + "users/favorites/" + req.params.memeId, {
            method: "DELETE",
            headers: {
                "Authorization": "bearer " + req.cookies.authToken
            }
        });
        /* If: response-status from User-Service is 200, pass response to client */
        if (response.status === 200) sendResponse(req, res, 200, {}, response.data )        
        /* If: User-Service is sending a response-status not specified in their swagger-file, notify client */
        else sendResponse(req, res, 500, {}, { message: "User-Service gave unspecified response", userServiceResponse: { status: response.status, body: response.data } })
    }
    catch (err) {
        /* create logging-data in console for debug purposes */
        log(err, 1)
        /* If: no response from User-Service after timeout */
        if (err.code === 'ECONNABORTED') sendResponse(req, res, 408, { message: "Fetching from User-Service timed out" })
        /* Else if: user-service responds with response-status 401, unauthorized, notify client */
        else if (err.response.status === 401) sendResponse(req, res, 401, {}, { message: 'Unauthorized', userServiceResponse: err.response.data })
        /* Else: unknown error */
        else sendResponse(req, res, 500, {}, { message: "Unidentified error", error: "" + err, userServiceResponse: err.response.data })
    }
})


module.exports = router