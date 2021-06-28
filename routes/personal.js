import express from 'express';
const Route = express.Router();
import personal from '../core/utilidadesPersonal.js'
import {getAdicionales,passProcesoContent} from '../core/getAdicionales.js'
import getDatosFormat from '../core/getDatosFormat.js'

Route.post('/get-personal',async function (req,res){
  let parametros = req.body;
  let email = parametros.reqEmail;
  console.log(parametros);
  let ids = await personal.getDominioUnidad(email);
  let emails = await personal.getFullNamesUnidad(ids);
    res.json(emails)
})

Route.post('/get-all-personal',async function (req,res){
  let parametros = req.body;
  let fullNames = parametros.fullNames;
  let full = await personal.getAllFromFullnames(fullNames);
  res.json(full)
})

Route.post('/get-firmantes-area',async function (req,res){
  let parametros = req.body;
  let email = parametros.email;
  let idProceso = parametros.idProceso;
  console.log(27,parametros);
  let cuerpo = await getAdicionales(email,idProceso);
  console.log(cuerpo);
  let crud = [...cuerpo[0].proceso.crud];
  let claves = [];
  console.log(crud);
  for (const cargo of crud) {
    if (cargo.ordenFirma>0&&cargo.idCargo===""&&cargo.tagUnidad!="") {
      claves.push(cargo.tagUnidad);
    }
  }
  console.log(claves);
  let unidades = {...cuerpo[0].unidades};
  let cargos = [];
  for (const key of claves) {
    cargos = [...cargos, ...unidades[key]]
  }
  let allDatos = await getDatosFormat.getAllFromCargos(cargos);
  res.json(allDatos);
})

module.exports = Route;
