import nodemailer from 'nodemailer'
const notificador = {
  sendNotificaccion:async function (emailServer,passServer,body){
    var transporter = nodemailer.createTransport({
       // service: 'Gmail',
       host:'smtp.gmail.com',
       port:465,
       secure:true,
       auth: {
           user: emailServer,
           pass: passServer,
            // type:'OAuth2',
           // user: 'otidg10@igp.gob.pe',
           // serviceClient:key.client_id,
           // privateKey: key.private_key
              }
        });

        var mailOptions = {
           from: emailServer,
           to: body.toSend,
           subject: body.subject,
           text: body.content,
           textEncoding: "base64"
        };

        // Enviamos el email
        try {
          let estado = await transporter.verify()
          await transporter.sendMail(mailOptions, function(error, info){
             if (error){
                 console.log(error);
                 return false;
             } else {
                 console.log("Email sent");
                 return true;
             }
          });

        } catch (e) {
          console.log(e);
          return false
        }
  },
  createBody:async function(){

    return {
      toSend:'',
      subject:'Documento requiere su firma digital',
      text:'Link para su firma ${"Link"}'
    }
  }
}

module.exports = notificador
