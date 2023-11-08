'use strict'

const AWS = require('aws-sdk'); 
const https = require('https');
const querystring = require('querystring');

class SecretsManager {

    /**
     * Uses AWS Secrets Manager to retrieve a secret
     */
    static async getSecret (secretName, region){
        const config = { region : region }
        let secretsManager = new AWS.SecretsManager(config);
        try {
            let secretValue = await secretsManager.getSecretValue({SecretId: secretName}).promise();
            if ('SecretString' in secretValue) {
                return secret = secretValue.SecretString;
            } else {
                let buff = new Buffer(secretValue.SecretBinary, 'base64');
                return decodedBinarySecret = buff.toString('ascii');
            }
        } catch (err) {
                throw err;
        }
    } 
    
    /**
     * Uses HTTPS to get the new access token from refresh token
     */
    static getNewAccessToken(token) {
        return new Promise((resolve, reject) => {
            const { postData, options } = preparePostDataAndOptions(token);
            let req = https.request(options, (res) => {
                handleResponse(res, resolve);
            });
            req.on('error', (err) => {
                handleError(err, reject);
            });
            req.write(postData);
            req.end();
        });
    }
    
    static async updateSecret (secretName, region, newSecretValue){
        const config = { region : region }
        let secretsManager = new AWS.SecretsManager(config);
        const params = {
            SecretId: secretName,
            SecretString: newSecretValue
        };
    
        try {
            const result = await secretsManager.updateSecret(params).promise();
            console.log(`Secret ${secretName} updated. ARN: ${result.ARN}`);
            return result.ARN;
        } catch (error) {
            console.log(`Error updating secret ${secretName}: ${error}`);
            throw error;
        }
    } 
    
}



// functions 

function preparePostDataAndOptions(refreshToken) {
    let postData = querystring.stringify({
            'grant_type': 'refresh_token',
            'refresh_token': refreshToken,
            'client_id':process.env.CLIENT_ID,
            'client_secret':process.env.CLIENT_SECRET
        });
        
    let options = {
        hostname: 'oauth.platform.intuit.com',
        path: '/oauth2/v1/tokens/bearer',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'Accept' : "application/json",
        }
    };

    return { postData, options };
}
function handleResponse(res, resolve) {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        if (res.headers['content-type'] === 'application/json') {
            body = JSON.parse(body);
        }
        resolve(body);
    });
}

function handleError(err, reject) {
    console.error('Error during HTTPS request', err);
    reject(err);
}


module.exports = SecretsManager;