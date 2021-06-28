let campos_prueba = [
  {
      "range": 'Doc!C8',
      "values": [
          ['Maria Rosa Luna Guzman'],
        ]
  },
  {
    "range": 'Doc!B32',
    "values": [
        ['JEFA DE OTIDG'],
      ]
},
{
    "range": 'Doc!K32',
    "values": [
        ['Personal'],
      ]
},
  {
      "range": 'Doc!F8:F9',
      "majorDimension": 'COLUMNS',
      "values": [
          ['00000000', '45578549'],
        ]
  },
  {
      "range": 'Doc!H8:H9',
      "majorDimension": 'COLUMNS',
      "values": [
          ['OTIDG', 'OTIDG'],
        ]
  },
  {
    "range": 'Doc!C9:C11',
    "majorDimension": 'COLUMNS',
    "values": [
        [ 'Jose Luciano Guzmán Santiago','Camacho','Prestamo por pandemia'],
      ]
},
{
  "range": 'Doc!H10',
  "values": [
      ['Av. San Felipe 521'],
    ]
},
  {
      "range": 'Doc!A20',
      "values": [
          ['Cable cordon'],
        ]
  },
  {
      "range": 'Doc!A23',
      "values": [
          ['-Todo nuevo\n-Todo bueno'],
        ]
  },
  {
      "range": 'Doc!E26:E29',
      "majorDimension": 'COLUMNS',
      "values": [
          ['Si retorna','Si','','28/12/2020'],
        ]
  },
]

let tabla_prueba = [["1","YGHFHG54","HJGJHG211","Computadora DELL","Dell","HD6850","423EWREW","Negra","Usada","Si","545SDS"],
["2","YGHFHG54","HJGJHG211","Computadora DELL","Dell","HD6850","423EWREW","Negra","Usada","Si","545SDS"],
["3","YGHFHG54","HJGJHG211","Computadora DELL","Dell","HD6850","423EWREW","Negra","Usada","Si","545SDS"],
["4","YGHFHG54","HJGJHG211","Computadora DELL","Dell","HD6850","423EWREW","Negra","Usada","Si","545SDS"]];


const {google} = require('googleapis');
import path, { resolve } from 'path'
import fs from 'fs'



const spread = {
    downloadPDF:async function (auth,access_token,id,fileName,path){
        var sheets = google.sheets({version : 'v4', auth});
        let response = await sheets.spreadsheets.get({
          "spreadsheetId": id//TO-DO
        })
        /* .then(response=> {
                return new Promise((resolve,reject)=>{
                 
                })
        })
        .catch(err=> {
            console.error("Execute error", err);
        }); */

        var url = response.data.spreadsheetUrl;
        
        let gid = response.data.sheets[0].properties.sheetId
        console.log(98,JSON.stringify(response,gid))
        url = url.replace(/edit$/, '');
        var url_ext = 'export?exportFormat=pdf&format=pdf&gid='+ gid//&portrait=false
        url = url + url_ext;
        var file = fs.createWriteStream(`${path}/${fileName}.pdf`);
        var request = require('request');
        var headers = {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + access_token,
                'Content-Type': 'text/pdf'
            }
        }
          let guardado  = request(url, headers)
              .on('error', (e) => {
                console.error(e);
              }).pipe(file)

            return new Promise((resolve , reject )=>{
              guardado.on("finish", () => {
                resolve(true)
              });
            }) 
    },
    edit:async function(auth,access_token,id,campos=campos_prueba,tabla=tabla_prueba){
/*         var sheets = google.sheets({version : 'v4', auth});
        let objSheet = await sheets.spreadsheets.get({
          "spreadsheetId": id//TO-DO
        }) */
        let request = {
            spreadsheetId: id,
              resource: {
              valueInputOption: 'USER_ENTERED', 
              data:campos,  // TODO: Update placeholder value.
            },
            auth: auth,
          };
          let response = null;
        try {
            response = (await google.sheets('v4').spreadsheets.values.batchUpdate(request)).data;
          } catch (err) {
            console.error(err);
          }
          request = {
            spreadsheetId: id,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            range: tabla.range,
            resource: {
                "values": tabla.datos,
              },
            auth: auth,
          };
        try {
            response = (await google.sheets('v4').spreadsheets.values.append(request)).data;
          
          } catch (err) {
            console.error(err);
          }
        return response
    },
    edit2:async function(auth,access_token,id,campos=campos_prueba,tabla=tabla_prueba){
      console.log(campos,typeof campos, JSON.stringify(campos))
        let request = {
            spreadsheetId: id,
              resource: {
              valueInputOption: 'USER_ENTERED', 
              data:{
                "range" : `mapa!A1:A${campos.length}`,
                "majorDimension" : "COLUMNS",
                "values" : [campos]
              },  // TODO: Update placeholder value.
            },
            auth: auth,
          };
          let response = null;
        try {
            response = (await google.sheets('v4').spreadsheets.values.batchUpdate(request)).data;
          } catch (err) {
            console.error(err);
          }
          request = {
            spreadsheetId: id,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            range: tabla.range,
            resource: {
                "values": tabla.datos,
              },
            auth: auth,
          };
        try {
            response = (await google.sheets('v4').spreadsheets.values.append(request)).data;
          
          } catch (err) {
            console.error(err);
          }
        return response
    },
    scopes: ['https://www.googleapis.com/auth/drive']
}

export default spread