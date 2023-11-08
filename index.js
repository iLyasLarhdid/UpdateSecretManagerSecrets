const SecretsManager = require('./SecretsManager.js');

exports.handler = async (event) => {
    // TODO implement
    let response;
    var secretName = "quickbookToken";
    var region = "me-south-1";
    var apiValue = await SecretsManager.getSecret(secretName, region);
    var value = JSON.parse(apiValue);
    console.log("---------------------------------"); 
    console.log(value.refresh_token); 
    console.log("---------------------------------"); 
    var newToken = JSON.parse(await SecretsManager.getNewAccessToken(value.refresh_token));
    console.log("new token ",newToken)
    if(newToken.error !== undefined){
      throw new Error(newToken.error)
    }
    console.log("---------------update secret manager------------------"); 
    newToken = {
        access_token:newToken.access_token,
        refresh_token:newToken.refresh_token
    }
    await SecretsManager.updateSecret(secretName, region, JSON.stringify(newToken));
    console.log("---------------done------------------"); 
    response = {
        statusCode: 200,
        body: JSON.stringify(newToken),
    };
    return response;
};
