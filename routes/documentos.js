import express from 'express'
import mongoose from 'mongoose'
import Utilidades from '../helpers/utilidadesDocumentos'
import Notificador from '../core/notificador'
import cuenta from '../core/cuentaGoogleServer.js'
import googleDrive from '../core/googleDrive.js'
import pdfCreator from '../core/pdfCreator.js'
import getDatosFormat from '../core/getDatosFormat.js'


const route = express.Router();

route.post('/get-ordenes',async (req,res)=>{
  // let data = {
  //     "hola": "muno",
  //     "email": "otidg7@igp.gob.pe",
  //     "proceso": "5f595deee75179265b96b988"
  // }
  let data = req.body;
  console.log(data);
  // let estructuraProceso = await Utilidades.estructuraProceso(mongoose.Types.ObjectId(data.idProceso));
  let visiblePara = await Utilidades.getVisibles2(data.email,data.proceso)
  console.log(visiblePara);
  res.json(visiblePara);
})
route.post('/get-ordenes/:id',async (req,res)=>{
  let id = req.params.id;
  let data = req.body;
  let visiblePara = await Utilidades.getVisibles2(data.email,data.proceso,id)
  res.json(visiblePara);
})

route.post('/guardar',async(req,res)=>{
   let data = req.body;
  // let data  = {
  //   email:'otidg10@igp.gob.pe',
  //   proceso:'5f595deee75179265b96b988',
  //   data:{
  //     codigo: ["xtspREch", "xtC8ZUfZ"],
  //     destino: "camacho",
  //     fecharetorno: "2020-09-13T05:00:00.000Z",
  //     fechasalida: "2020-09-07T05:00:00.000Z",
  //     motivo: 1,
  //     origen: "camacho",
  //     recibe: "jose",
  //   }
  // }
  let estructuraProceso = await Utilidades.estructuraProceso2(data.email, mongoose.Types.ObjectId(data.proceso));
  let mapaSheet = estructuraProceso.proceso;//await getDatosFormat.getBodySheet(data.proceso);
let crud = [...mapaSheet.crud];
let arrayTag = [];
let firmasTotales = new Array();
let recibeResponsable = await getDatosFormat.getRecibeResponsable(data.data.recibe,data.proceso);
let visibleParaCargos = []
for (const firmante of crud) {
  if(firmante.ordenFirma>0){
    if(firmante.idCargo!=''){
      firmasTotales[firmante.ordenFirma-1] = {
        idCargo:firmante.idCargo,
        ubicacionFirma:firmante.ubicacionFirma,
        nivelFirma:firmante.ordenFirma-1}
      visibleParaCargos.push(firmante.idCargo)
    }else if(firmante.tagUnidad!=''){
      firmasTotales[firmante.ordenFirma-1] = {
        idCargo:estructuraProceso.unidad[firmante.tagUnidad],
        ubicacionFirma:firmante.ubicacionFirma,
        nivelFirma:firmante.ordenFirma-1};
      visibleParaCargos= [...visibleParaCargos,...estructuraProceso.unidad[firmante.tagUnidad]]
    }else{
      firmasTotales[firmante.ordenFirma-1] = {
        idCargo:recibeResponsable.recibe.idCargo,
        ubicacionFirma:firmante.ubicacionFirma,
        nivelFirma:firmante.ordenFirma-1}
    }
  }
/*   if(firmante.crear){
    idCargoCreador = estructuraProceso.unidad[firmante.tagUnidad];
  } */
  
}
let todosEmailQuePuedenVer = await getDatosFormat.getEmailsFromArrayCargos(visibleParaCargos)
todosEmailQuePuedenVer.push(data.email,recibeResponsable.recibe.email)
let idCargoCreador = estructuraProceso.cargos._id;
  if(true){//Object.keys(estructuraCreador)
    let nuevoDocumento = await Utilidades.crearDocumento2(idCargoCreador,data,firmasTotales,todosEmailQuePuedenVer)
     // antiguo let saved = await pdfCreator.crearPDF(`./output/${nuevoDocumento._id}.pdf`,'modeloMovimientos.html',data);
    let idSheetProceso = '17owJ5a5nvxdp76ubdluh-Hx8okWrvHJH9UcOmSQ9ozY';
    let pathPDF = './output';
    let saved = await pdfCreator.googlePDF(data.data,recibeResponsable,mapaSheet.googleSheet,idSheetProceso,nuevoDocumento._id,pathPDF);
     const credencial = process.env.PATH_GOOGLE_CREDENTIALS
     let auth = cuenta.getAuth(credencial,googleDrive.scopes)
     let fileIdDrive = await pdfCreator.uploadDrive(auth, process.env.FOLDER_DRIVE,`./output/${nuevoDocumento._id}.pdf`,nuevoDocumento._id);
     if(fileIdDrive.id){ //fileIdDrive.id&&
       let actualizacion = await Utilidades.actualizarIdFile(nuevoDocumento._id,fileIdDrive.id)
       let body = await Utilidades.getEmailTofirma2(actualizacion)
       let enviarEmail = await Notificador.sendNotificaccion(process.env.EMAIL_SERVICE,process.env.EMAIL_PASSWORD,body)
     }else{
       // manejar la negativa del drive
     }
    // console.log(res);
  }

  res.json({mensaje:'Documento ingresado correctamente.'})
})

route.post('/do-firma',async (req,res)=>{
  let body = req.body
  let id = body.id;
  let email = body.email;
  let idProceso = body.proceso;
  let resp = await Utilidades.getFileToSign(id , email)
  let documento = {...resp.documento}
  delete resp.documento
  if(resp.puedeFirmar){
    let updated = (await Utilidades.updateSignedLevel(id ,resp.nivelFirma+1))[0]
    documento.nivelFirma = resp.nivelFirma+1
    let body = await Utilidades.getEmailTofirma2(documento)
    let enviarEmail = await Notificador.sendNotificaccion(process.env.EMAIL_SERVICE,process.env.EMAIL_PASSWORD,body)
    res.json({...resp,siguienteNivel:resp.nivelFirma})
  }else{
    res.json(resp)
  }
})
route.post('/check-can-sign',async (req,res)=>{
  let body = req.body
  console.log(body);
  let id = body.id;
  let email = body.email;
  let idProceso = body.proceso;
  let resp = await Utilidades.getFileToSign(id , email)
  console.log(resp);
  delete resp.documento
  res.json(resp)
})

module.exports = route
