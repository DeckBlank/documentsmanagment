import nodemailer from 'nodemailer'
// const key = require('../credentials/notificador-289122-2cd4e5fdf680.json')
const mailer = {
  sendMail:async function (){
    // Autorizar(TOKEN_PATH,enviarEmail)
    console.log(key.client_id);
    var transporter = nodemailer.createTransport({
       // service: 'Gmail',
       host:'smtp.gmail.com',
       port:465,
       secure:true,
       auth: {
           user: 'otidg10@igp.gob.pe',
           pass: 'America2018',
            type:'OAuth2',
           // user: 'otidg10@igp.gob.pe',
           serviceClient:key.client_id,
           privateKey: key.private_key
       }
   });


// Definimos el email
var mailOptions = {
   from: 'otidg10@igp.gob.pe',
   to: 'otidg10@igp.gob.pe',
   subject: 'Asunto',
   text: 'Contenido del email',
   textEncoding: "base64"
};
// Enviamos el email
try {
  let a = await transporter.verify()
  await transporter.sendMail(mailOptions, function(error, info){
     if (error){
         console.log(error);
         // console.log(500, err.message);
     } else {
         console.log("Email sent");
         // res.status(200).jsonp(req.body);
     }
  });
} catch (e) {
  console.log(e);
}

}
}
const enviarEmail = function (auth){
  var Mail = require('./createMail.js');
 var obj = new Mail(auth, "otidg10@igp.gob.pe", 'Subject', 'Body', 'mail',null);
  obj.makeBody();
}
module.exports = mailer.sendMail;
