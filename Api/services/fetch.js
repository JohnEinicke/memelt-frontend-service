const axios = require('./axiosInstance')
const { logToHealthservice } = require('./logging')

/**
 * Function that makes a request to a Service and logs it to the Health-Service
 * @param {string} otherServiceName - name of Service that request was sent to
 * @param {string} url - url of a service which we send a request to
 * @param {object} config - body, headers, etc.
 * @return {axios.AxiosResponse} - AxiosResponse-Object: {data, status, statusText, headers, config, request}
 */
async function log_fetch(otherServiceName, url, config) {
    let body = {
        "info": {
            "selfServiceName": "FRONTEND",
            "otherServiceName": otherServiceName,
            "httpMethod": config.method,
            "requestedUrl": url,
            "timestamp": new Date()
        }
    }
    /* log outgoing request to Health-Service */
    logToHealthservice('Request', body)
    /* Return: AxiosResponse-Object */
    return axios(url, config)
}

module.exports = log_fetch