# MemeIt! Frontend-Service ![security-checked](resources/security-checked.png "security-checked")

## Instructions

Environment variables to be set:

* FRONTEND_SERVICE_HOST - Name of the desired host.
* FRONTEND_SERVICE_PORT - Number of the desired port.
* STORAGE_SERVICE_ADDRESS - Basic endpoint address for storage server API.
* HEALTH_SERVICE_ADDRESS - Basic endpoint address for health server API.
* USER_SERVICE_ADDRESS - Basic endpoint address for user server API.
* LOGS - Yes or No

## Dependencies

* User-Service v1.3.0
* Health-Service v1.5.3
* Storage-Service v2.6.0

## Useful links
* Related Repository: https://gitlab.beuth-hochschule.de/s73017/swagger-validator
* Docker-Hub: https://hub.docker.com/r/yb1997/frontend-docker-image

## Changelog
* v3.0.1:
    * Increased time until timeout to 10s
* v3.0.0:
    * GET /health/logs is now POST and requires a body with page and limit
    * New route GET /users/favorites
    * New route POST /users/favorites
    * New route DELETE /users/favorites
    * In code comments
* v2.1.0:
    * New route /health/logs which gets logs from the Health-Service
* v2.0.4:
    * Logging on the console now has a maximum size, so the console does not become unreadable
* v2.0.3:
    * Fetch-module changed from nodeFetch to axios
    * Every single service call now can timeout and many routes give the timeout response back to the caller
    * All routes now log to the Health-Service
* v2.0.2:
    * Fixed Login-Route by using correct parameters


* v2.0.0:
    * Added route: /latest
    * Added route: /health/status
    * Added route: /health/data
    * Added route /health/meta
    * Edited the /search routes response.
    * Edited the /users/register to take in "name" instead of "username"
    * /health is now the route for the Health-Service
    * /health/meta is now the route for the Health-Service
    * /health/status is the route for the client
    * /health/data is the route for the client
    * Implemented all the routes


* v1.1.2:
    * Specified routes are working.
    * Currently the service only fetches from the User-Service (Storage and Health is dummy data).
    * Logging can be activated, by setting the the env LOGS to Yes.
    * LogIn does not contact User-Service.
    * Delete does not contact User-Service.

* v1.1.1:
    * First implementation of the routes with dummy-data


![dummyImage](resources/dummyImage.png "dummyImage")
