//  const credentials = require('./credentials/notificador-4148c16323e5.json');
// const scopes = [
//   'https://www.googleapis.com/auth/gmail.readonly',
//  // 'https://www.googleapis.com/auth/drive'
// ];
//  auth = new google.auth.JWT(
//  credentials.client_email, null,
//  credentials.private_key, scopes,'deckblank@gmail.com'
// );
const {google} = require('googleapis');
const cuentaServer = {
  getAuth:function(pathCredentials,scopes){
    const auth = new google.auth.GoogleAuth({
      keyFile: pathCredentials,
      scopes,
    });
    return auth;
  },
  getAuthJWT:async function(pathCredentials,email,key,scopes){
    let jwtClient = new google.auth.JWT({keyFile: pathCredentials,email,key,scopes})
    let res = await jwtClient.authorize();
    /* const url = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${email}:generateAccessToken?alt=json`;
    const res = await jwtClient.request({url});
    console.log(res) */
    /* var request = require('request');
    let url = `https://iamcredentials.googleapis.com/v1/name=notificator@notificador-1599016082983.iam.gserviceaccount.com:generateAccess`
    request
      .get(url)
      .on('response', function(response) {
        console.log(response.body) // 200
        
      }) */
      console.log(res);
    return res;
  }
}

export default cuentaServer
