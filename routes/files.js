import express from 'express'
const route = express.Router();
const fs = require('fs');
const multer  = require('multer')
import cuenta from '../core/cuentaGoogleServer.js'
import googleDrive from '../core/googleDrive.js'
import pdfCreator from '../core/pdfCreator.js'
import auth from '../helpers/auth'
import Utilidades from '../helpers/utilidadesDocumentos'
import Notificador from '../core/notificador'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "output/")
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname+'.pdf')
  },
})
const uploadStorage = multer({ storage: storage })
route.get('/descargar/:fileName',(req,res)=>{
  var file = req.params.fileName;
    let src = fs.createReadStream(`./output/${file}`);
    src.on('error', function(err) {
        res.status(204);
    });
    res.setHeader('Content-disposition', 'inline; filename="' + file + '"');
    res.setHeader('Content-type', 'application/pdf');
    src.pipe(res);
})
route.post('/subida/:token',async (req,res,next)=>{
  let token = req.params.token
  let respuesta = auth.validarToken(token,process.env.JWT_SECRET)
  console.log(token,respuesta);
  /* res.json(respuesta); */
  if(respuesta!=null){
    respuesta = respuesta.data
    let email = respuesta.email
    let proceso = respuesta.proceso
    let id = respuesta.id
    let resp = await Utilidades.getFileToSign(id , email)
    
    if(resp.puedeFirmar){
      req.resp = resp;
      req.id = id;
      next();
    }else{
      res.status(403).json('No tienes permisos')
    }
  }else{
    res.status(403).json('No tienes permisos')
  }
  
},
uploadStorage.single('MyForm'),
async (req,res)=>{

    console.log('algo');
    let upload = req.file;
    const credencial = process.env.PATH_GOOGLE_CREDENTIALS
    let auth = cuenta.getAuth(credencial,googleDrive.scopes)
    let fileIdDrive = await pdfCreator.uploadDrive(auth, process.env.FOLDER_DRIVE,`./output/${upload.filename}`,upload.filename);
    if(fileIdDrive.id){
      let resp = req.resp;
      let id = req.id;
      let documento = {...resp.documento}
      delete resp.documento
      let updated = (await Utilidades.updateSignedLevel(id ,resp.nivelFirma+1))[0]
      documento.nivelFirma = resp.nivelFirma+1
      let body = await Utilidades.getEmailTofirma2(documento)
      let enviarEmail = await Notificador.sendNotificaccion(process.env.EMAIL_SERVICE,process.env.EMAIL_PASSWORD,body)
      res.json({...resp,siguienteNivel:resp.nivelFirma})
      //return res.send("Single file")
    }else{
      res.status(403).json('No tienes permisos') 
    }
    
  
})

module.exports = route
// [{"recibe":"Guzman Santiago Jose Luciano","motivo":2,
// "origen":"camacho","destino":"mayorasgo",
// "fechasalida":{"date":"2020-10-23 05:00:00.000000","timezone_type":2,"timezone":"Z"},
// "fecharetorno":{"date":"2020-10-22 05:00:00.000000","timezone_type":2,"timezone":"Z"},
// "codigo":"602200130120","id":"5f805b7217f14917ec90dc67",
// "idGoogleFile":"1Kva5xli5xvSWJl1ITXs4_U4zCEx0Rm76"},
// {"recibe":"Guzman Santiago Jose Luciano","motivo":2,"origen":"camacho","destino":"mayorasgo","fechasalida":{"date":"2020-10-22 05:00:00.000000","timezone_type":2,"timezone":"Z"},"fecharetorno":{"date":"2020-10-21 05:00:00.000000","timezone_type":2,"timezone":"Z"},"codigo":"602200130120","id":"5f805d0c17f14917ec90dc68","idGoogleFile":"1hdap3Kjw2-aqCTzVT_ze5MfFYw-xrkab"}]
