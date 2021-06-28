var pdf = require("pdf-creator-node");
var fs = require('fs');
import cuenta from './cuentaGoogleServer.js'
import googleSpreadSheet from './googleSpreadSheet.js'
import drive from './googleDrive.js'
import getDatosFormat from './getDatosFormat.js'
const path = require("path");
// import googleDrive from './core/googleDrive.js'
const {google} = require('googleapis');
const pdfCreator = {
  crearPDF:async function(save,modelo,data){
    var options = {
        format: "A4",
        orientation: "landscape",
        border: "10mm",
        header: {
            height: "0mm",
            contents: ''
        },
        footer: {
            "height": "0mm",
            "contents": ''
        }
	};
	let html = fs.readFileSync(path.resolve(__dirname,`../modelo/${modelo}`), 'utf8');
    let document = {
    html, //: this.contenido(data),
    data,
    path:save,
};
let resultado = await pdf.create(document, options)
    .then(res => {
        console.log(res)
    })
    .catch(error => {
        console.error(error)
    });
    return resultado;
  },
  uploadDrive:async function(auth, idFolder, path, name,tipo='application/pdf'){
    const drive = google.drive({ version: "v3", auth });
    const res = await drive.files.create({
      resource:{name: name,parents : [idFolder] },//carpeta otidg10 '1j9mYFDRK1WjKIqWk5xtK-ziaFUl8ScV3' // carpeta deckblank '16zkSXU28bFDqB01-eKR8CIiGK-wikLv-'
      media: {mimeType: tipo,body: fs.createReadStream(path)},//'Hello World'},
      fields: 'id'
    });
    return res.data;
  },
  googlePDF:async function(datos,recibeResponsable,googleSheet,idSheetProceso,fileName,pathPDF){
    delete datos['recibe']
    datos = {...datos, ...recibeResponsable}
    let campos = [...googleSheet.campos]
    let row = 0;
    for (const item of campos) {
      let agregar = [];
      for (const losKeys of item.values[0]) {
        let keys = losKeys.split('.');
        let dato = null;
        let i = 0;
        for (const key of keys) {
          if(i>0){
            dato = dato[key]?dato[key]:'falta'
          }else{
            dato = datos[key]?datos[key]:'falta';
          }
          i++
        }
        agregar.push(dato)
      }
      campos[row].values[0] = agregar; 
      row++
    }
    let tabla = {datos:datos[googleSheet.tabla.key],range:googleSheet.tabla.range}
    const credencial = process.env.PATH_GOOGLE_CREDENTIALS
    let key  = credencial.private_key;
    let email = credencial.client_email;
    let scopes = googleSpreadSheet.scopes
    let access_token = await cuenta.getAuthJWT(credencial, email,key,scopes)
    let auth = cuenta.getAuth(credencial,scopes)
    let newSheet = await drive.copyFile(auth,idSheetProceso,fileName);
    let idNewSheet = newSheet.data.id
    let llenado = await googleSpreadSheet.edit(auth,access_token,idNewSheet,campos,tabla)
    let res = await googleSpreadSheet.downloadPDF(auth,access_token.access_token,idNewSheet,fileName,pathPDF); 
    return res;
  },
  googlePDF2:async function(idDocumento,data,googleSheet,idSheetProceso,fileName,pathPDF){
    let campos = [...data.campos,idDocumento];
    let tabla = {datos:data[googleSheet.tabla.key],range:googleSheet.tabla.range}
    const credencial = process.env.PATH_GOOGLE_CREDENTIALS
    let key  = credencial.private_key;
    let email = credencial.client_email;
    let scopes = googleSpreadSheet.scopes
    let access_token = await cuenta.getAuthJWT(credencial, email,key,scopes)
    let auth = cuenta.getAuth(credencial,scopes)
    let newSheet = await drive.copyFile(auth,idSheetProceso,fileName);
    let idNewSheet = newSheet.data.id
    let llenado = await googleSpreadSheet.edit2(auth,access_token,idNewSheet,campos,tabla)
    let res = await googleSpreadSheet.downloadPDF(auth,access_token.access_token,idNewSheet,fileName,pathPDF); 
    return res;
  }
}


module.exports =  pdfCreator ;
