import express from 'express'
import Utilidades from '../helpers/utilidadesDocumentos'
import mongoose from 'mongoose'
import cuenta from '../core/cuentaGoogleServer.js'
import googleDrive from '../core/googleDrive.js'
import pdfCreator from '../core/pdfCreator.js'
import getDatosFormat from '../core/getDatosFormat.js'
import Notificador from '../core/notificador'
const route = express.Router();

route.post('/guardar',async (req,res)=>{
 /*    {"email":"otidg10@igp.gob.pe",
    "proceso":"5f595deee75179265b96b988",
    "data":{
        "id":"5fa439bb69d9550b20a59829",
        "codigo":[
            [1,602200130033,"006267","ACELEROGRAFO","KINEMETRICS","SWA-1",1273,"NEG","M","Si-falta","Codigo faltante"],
            [2,602200250055,"002831","ACELEROMETRO","GURALP SYST","CMG-5T",0,"PLO","R","Si-falta","Codigo faltante"]
        ],
        "observacion":"asdasd",
        "recibe":"Luciano Guzman Jose Santiago"}
    } */
    let data = req.body;
    let firmantesDinamicos = data.data.firmantesDinamicos;
    let documentoPrecedente = data.documentoPrecedente;
    let estructuraProceso = await Utilidades.estructuraProceso2(data.email, mongoose.Types.ObjectId(data.proceso));
    // console.log(estructuraProceso)
    let mapaSheet = estructuraProceso.proceso;//await getDatosFormat.getBodySheet(data.proceso);
    let idDocumento = estructuraProceso.proceso.prefijoProceso+(new Date()).toLocaleString().replace(/[:\/ ]/g,'');
    let crud = [...mapaSheet.crud];
    let firmasTotales = new Array();
    let visibleParaCargos = []
    //let recibeResponsable = await getDatosFormat.getRecibeResponsable(data.data.recibe,data.proceso);
    let idCargoCreador = null;
    for (const firmante of crud) {
        if(firmante.ordenFirma){
          if(firmante.idCargo!=''){
            firmasTotales[firmante.ordenFirma-1] = {
              idCargo:firmante.idCargo,
              ubicacionFirma:firmante.ubicacionFirma,
              nivelFirma:firmante.ordenFirma}
            visibleParaCargos.push(firmante.idCargo)
          }else if(firmante.tagUnidad!=''){
            firmasTotales[firmante.ordenFirma-1] = {
              idCargo:estructuraProceso.unidad[firmante.tagUnidad],
              ubicacionFirma:firmante.ubicacionFirma,
              nivelFirma:firmante.ordenFirma};
            visibleParaCargos= [...visibleParaCargos,...estructuraProceso.unidad[firmante.tagUnidad]]
          }else{
            firmasTotales[firmante.ordenFirma-1] = {
              idCargo:mongoose.Types.ObjectId(firmantesDinamicos[firmante.ordenFirma-1].idCargo),
              firmantesDinamicos,
              ubicacionFirma:firmante.ubicacionFirma,
              nivelFirma:firmante.ordenFirma}
          }
        }
/*         if(firmante.crear){
          console.log(57,estructuraProceso.unidad,firmante.tagUnidad);
          idCargoCreador = estructuraProceso.unidad[firmante.tagUnidad];
          console.log(58,visibleParaCargos);
          visibleParaCargos =  [...visibleParaCargos,...idCargoCreador];
            console.log(60,visibleParaCargos);
        } */
        
      }
      let visibleToCargos = await getDatosFormat.getEmailsFromArrayCargos(visibleParaCargos)
      console.log(65,visibleToCargos);
    for (const firmant of firmantesDinamicos) {
        visibleToCargos.push(firmant.email)
    }
    visibleToCargos = [...visibleToCargos,data.email]
    console.log(70,visibleToCargos);
    let nuevoDocumento = await Utilidades.crearDocumento2(idCargoCreador,data,firmasTotales,visibleToCargos,documentoPrecedente,idDocumento)
    let idSheetProceso = mapaSheet.googleSheet.idSheet; //'1RuoUHuU28CEP9z_0HAfr55E5QKgfbHdP0ozFh5DK0EI';
    let pathPDF = './output';
   
    let saved = await pdfCreator.googlePDF2(idDocumento,data.data,mapaSheet.googleSheet,idSheetProceso,nuevoDocumento._id,pathPDF);
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
    res.json(nuevoDocumento);


});

module.exports = route