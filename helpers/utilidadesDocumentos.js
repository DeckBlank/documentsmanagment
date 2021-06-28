import Documento from '../models/documento'
import Cargos from '../models/cargos'
import Personal from '../models/personal'
import Proceso from '../models/proceso'
import mongoose from 'mongoose'

const utilidades = {
  estructuraProceso:async function (ObjectIdProceso){
    let res = null;
    try {
      // res = await Personal.aggregate([
      //     {$match:{email:data.email}},
      //     {$lookup:{
      //         from:'cargos',
      //         localField:'_id',
      //         foreignField:'idColaborador',
      //         as :'workers'
      //       }},
      //     { $unwind: "$workers" }
          res = await Proceso.aggregate([
                {$match:{_id:ObjectIdProceso}},
                {$unwind:'$creadores'},
                {$lookup:{
                         from:'cargos',
                         foreignField:'_id',
                         localField:'creadores.idCargo' ,
                         as:'cargo'
                            }},
                {$unwind:'$cargo'},
                {$lookup:{
                         from:'personal',
                         foreignField:'_id',
                         localField:'cargo.idColaborador' ,
                         as:'colaborador'
                            }},
                 {$unwind:'$colaborador'},
                            ])
          return res;
    } catch (e) {
      return 'error'
    }

    // try {
    //   let documentoCreated = new Documento(data);
    //   let resultado = await  documentoCreated.save();
    //   return resultado;
    // } catch (e) {
    //   return {code:500,mensaje:e.message}
    // }
  },
  estructuraCreador: function (email,estructuraProceso){
    // if(email===)
    for (var item of estructuraProceso) {
      if(item.colaborador.email===email){
        return item;
      }
    }
    return {};
  },
  crearFirmantes:async function(creador,firmantes){
    // let objetoFirma =
    let nuevosFirmantes = [creador,...firmantes]
    let query = [
      {$match:{email:{$in:nuevosFirmantes}}},
      {$lookup:{
        from:'cargos',
        foreignField:'idColaborador',
          localField:'_id',
          as:'cargos',
        }}
    ]
    let losFirmantes= await Personal.aggregate(query);
    return losFirmantes;
  },
  crearDocumento:async function (data,estructuraCreador){
    let cargosVisibles = [];
    let nuevo = [...estructuraCreador.cargosFirmasRequeridas]
    for (var cargos of nuevo) {
       cargosVisibles.push(cargos.idCargo)
    }
    cargosVisibles.push(estructuraCreador.creadores.idCargo)
    let coleccion = {
    idCargoCreador:estructuraCreador.creadores.idCargo,
    visibleToCargos:cargosVisibles,
    idProceso:estructuraCreador._id,
    nivelFirma:0,
    //cargoFirmando:,
    idGoogleFile:'ss',
    cerrado:false,
    datos:data.data,
    firmantes:data.firmantes,
    }
    try {
      let documento = new Documento(coleccion)
      let res = await documento.save();
      return res;
    } catch (e) {
      return e
    }
  },
  crearDocumento2:async (idCargoCreador,data,firmantes,visibleToCargos,documentoPrecedente,idDocumento)=>{
    console.log(102,documentoPrecedente);
    let coleccion = {
      idDocumento,
      idCargoCreador,
      //procesoUnidadFinalesNotificar:[],
      visibleToCargos,
      firmantes,
      idProceso:mongoose.Types.ObjectId(data.proceso),
      nivelFirma:1,
      idGoogleFile:'=)',
      cerrado:false,
      documentoPrecedente:[mongoose.Types.ObjectId(documentoPrecedente)],
      datos:data.data
      }
    try {
      let documento = new Documento(coleccion)
      let res = await documento.save();
      return res;
    } catch (e) {
      return e
    }
    },
    actualizarIdFile:async function(idDocumento,idFile){
    let busqueda = {_id:mongoose.Types.ObjectId(idDocumento)};
    let parseado = {idGoogleFile:idFile}
    let existeDocumento = await Documento.findOne(busqueda);
    if (true) { // aqui debe ir una regla para ver si aún se puede modificar
      let update = {$set:parseado}
      let options  = { upsert: true }
      try {
        function resuelto (err,respuesta){
          if(err){
            res.json(err)
              return err
          }else{
            // res.json(respuesta)
            // res.json('todo bien')
            // return respuesta
          }
        }
        let resp = await Documento.updateOne(busqueda,update, options, resuelto)
        return existeDocumento
      } catch (e) {
          return false
      }
    }

  },
  getEmailTofirma: async function(documento,estructuraCreador){
    let toNotificar = estructuraCreador.cargosFirmasRequeridas[documento.nivelFirma];
    if(toNotificar.ordenFirma==documento.nivelFirma){
      let idCargo = toNotificar.idCargo;
      let query = [
        {$match:{_id:idCargo}},
        {$lookup:{
          from:'personal',
          foreignField:'_id',
          localField:'idColaborador',
          as:'colaborador',
        }},
        {$unwind:'$colaborador'},
        {$project:{'nombreCargo':1,'colaborador':1}}
      ]
      let colaborador = await Cargos.aggregate(query)
      return colaborador[0];
    }
    return {email:null}
  },
  getEmailTofirma2: async function(documento,idCargoFirmando=null){
    let nivelFirma = documento.nivelFirma;
    let firmantes = [...documento.firmantes];
    let firmanteNotificar = firmantes[nivelFirma];
    let colaborador = null;
    if(firmanteNotificar.idCargo){
      let idCargo = null
      if(Array.isArray(firmanteNotificar.idCargo)){
        //aqui se hace la validadion de quin esta de vaciones, porque un array significa que hay mas de una persona quien puede aprobar
        idCargo = firmanteNotificar.idCargo[0]; // por ahora solo tomamos al primero
      }else{
        idCargo = firmanteNotificar.idCargo
      }
      let query = [
        {$match:{_id:idCargo}},
        {$lookup:{
          from:'personal',
          foreignField:'_id',
          localField:'idColaborador',
          as:'colaborador',
        }},
        {$unwind:'$colaborador'},
        {$project:{'nombreCargo':1,'colaborador':1}}
      ]
      colaborador = await Cargos.aggregate(query)
    }else if(firmanteNotificar.email){
      let email = firmanteNotificar.email;
      let query = [
        {$match:{email}},
        {$lookup:{
          from:'cargos',
          foreignField:'idColaborador',
          localField:'_id',
          as:'cargo',
        }},
        {$unwind:'$cargo'},
        {$group:{_id:'$_id',nombreCargo:{$first:'$cargo.nombreCargo'},colaborador:{$first:'$$ROOT'}}}
      ]
      colaborador = await Personal.aggregate(query)
    }
    let colaboradorToNotificar  =colaborador[0]
    let body = {
      toSend:colaboradorToNotificar.colaborador.email,
      subject:`Documento requiere su aprobación`,
      content:`Estimad@ ${colaboradorToNotificar.nombreCargo} el documento
             requiere su firma digital, link para su firma ${process.env.APP_LINK_FIRMA}`
    }
    return body;
  },
  getVisibles:async function (email,stringProceso){
    let objectProceso = mongoose.Types.ObjectId(stringProceso);
    let query = [
      {$match:{email:email}},
      {$lookup:{
        from:'cargos',
        foreignField:'idColaborador',
        localField:'_id',
        as:'cargos',
      }},
      {$unwind:'$cargos'},
      {$group:{_id:'$_id',cargo:{$push:'$cargos._id'},email:{$first:'$email'}}}
    ]
    let cargos  = await Personal.aggregate(query)
    console.log(JSON.stringify(cargos[0].cargo[0]));
    query = [
      {$match:{idProceso:objectProceso}},
      // {$match:{visibleToCargos:{$all:cargos[0].cargo}}},
      {$match:{$or:[
        {firmantes:{$all:[email]}},
        {visibleToCargos:{$all:cargos[0].cargo}}
        ]}},
      // {$group:{_id:'$_id',idGoogleFile:{$first:'$idGoogleFile'},datos:{$first:'$datos'},cerrado:{$first:'$cerrado'}}}
      // {$project:{_id:1,datos:1}}
      {$addFields: {"datos.id": '$_id',"datos.idGoogleFile":"$idGoogleFile"}},
      {$replaceRoot:{newRoot:"$datos"}}
    ]
    let visible = await Documento.aggregate(query)
    return visible
  },
  getVisibles2:async (email,stringProceso,id=null)=>{
    let query = [
      {$match:{idProceso:mongoose.Types.ObjectId(stringProceso)}},
      {$match:{
        visibleToCargos:{$all:[email]}
        }},
        {$addFields: {"datos.id": '$_id',"datos.idGoogleFile":"$idGoogleFile"}},
        {$replaceRoot:{newRoot:"$datos"}}
    ]
    if(id){
      query[0] = {$match:{_id:mongoose.Types.ObjectId(id)}};
    }
    
    let visible = await Documento.aggregate(query)
    return visible
  },
  getOperadoresUnidad:async()=>{
    busqueda = {$or:campos}
    /* {_id:unidad} */
    let operadores = await Documento.find(busqueda);
  },
  estructuraProceso2:async(email,idproceso)=>{
    let idProceso = mongoose.Types.ObjectId(idproceso)
    let query = [
      {$match:{email}},
      {$lookup:{
              from:'cargos',
              foreignField:'idColaborador',
                localField:'_id',
                as:'cargos',
              }},
              {$unwind:'$cargos'},
      {$lookup:{
              from:'unidades',
              foreignField:'_id',
                localField:'cargos.idUnidad',
                as:'unidad',
              }},
              {$unwind:'$unidad'},
              {$addFields:{idProceso}},
      {$lookup:{
              from:'proceso',
              foreignField:'_id',
                localField:'idProceso',
                as:'proceso',
              }},
              {$unwind:'$proceso'}
      ]
      try {
        let estructura = await Personal.aggregate(query);    
        return estructura[0];
      } catch (error) {
        return {menssage:'error'}
      } 
  },
  getFileToSign:async (idDocument,email)=>{
    let _id = mongoose.Types.ObjectId(idDocument);
    let aggregate = [
      {$match:{_id}},
      {$group:{_id:'$_id',documento:{'$first':'$$ROOT'}}},
      {$addFields:{email}},
      {$lookup:{
          from:'personal',
          foreignField:'email',
          localField:'email',
          as:'personal'
          }},
      {$unwind:'$personal'},
      {$lookup:{
        from:'cargos',
        foreignField:'idColaborador',
        localField:'personal._id',
        as:'cargo'
        }},
     {$unwind:'$cargo'},
    ]
    let compress = (await Documento.aggregate(aggregate))[0];
    //script validacion si debe firmar o no 
    console.log(compress)
    let nivelFirma = compress.documento.nivelFirma;
    let documento = {...compress.documento};
    let personal = {...compress.personal};
    let cargo = {...compress.cargo};
    let puedeFirmar = false
    let suNivel = -1;
    for (const firmante of documento.firmantes) {
      console.log(firmante,cargo._id)
     // if(JSON.stringify(cargo._id)===JSON.stringify(firmante.idCargo)){
        suNivel = firmante.nivelFirma
        if(nivelFirma+1===firmante.nivelFirma){
          //console.log(cargo._id,firmante.idCargo,JSON.stringify(firmante.idCargo))
          puedeFirmar = true
        }
      //}
     
    }
    let resp = {
      message:puedeFirmar,
      nivelFirma,
      puedeFirmar ,
      documento
    }
    console.log(resp);
    return resp;
  },
  updateSignedLevel:async (idDocument,nivelFirma)=>{
    let _id = mongoose.Types.ObjectId(idDocument);
    let res = await Documento.updateOne({_id}, { $set: { nivelFirma:nivelFirma } });
    return res;
  }
}

module.exports = utilidades;
