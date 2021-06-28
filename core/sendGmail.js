// https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send
// https://stackoverflow.com/questions/37243862/send-mail-via-google-apps-gmail-using-service-account-domain-wide-delegation-in
const {google} = require('googleapis');
const key = require('./credentials/notificador-289122-2cd4e5fdf680.json')
const jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, ['https://mail.google.com','https://www.googleapis.com/auth/gmail.send'], 'otidg10@igp.gob.pe');
// import mail from './helpers/gmail.js'
// mail(jwtClient)
jwtClient.authorize((err, tokens) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Google auth success')
  var gmail = google.gmail({version: 'v1', auth: jwtClient})
  var raw = 'b3RpZGcxMEBpZ3AuZ29iLnBl'

  var sendMessage = gmail.users.messages.send({
    auth: jwtClient,
    userId: 'otidg10@igp.gob.pe',
    message: {
      raw: raw
    }
  }, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      console.log(res);
    }
});
})
