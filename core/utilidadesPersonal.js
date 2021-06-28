import Personal from '../models/personal'
import Cargos from '../models/cargos'
const personal = {
  getDominioUnidad:async function (email){
    let query = [
        {$match:{email:email}},
        {$lookup:{
            from:'cargos',
            foreignField:'idColaborador',
            localField : '_id',
            as : 'cargos'
            }},
         {$unwind:'$cargos'},
         {$match:{'cargos.leerPersonal':{$exists:true}}},
          {$group:{_id: "$_id",assets:{$push: {$concatArrays:"$cargos.leerPersonal"}}}},
          { $project: {
            _id: 0,
            areasId: {
              $reduce: {
                input: "$assets",
                initialValue: [],
                in: { "$concatArrays": ["$$this", "$$value"] }
              }
            }
          }}
    ]
    let idsAreas = await Personal.aggregate(query);
    let ids  = idsAreas[0].areasId;
    return ids;
  },
  getDominioUnidad2:async function (email,proceso){
   /*  db.getCollection('personal').aggregate([
      {$match:{email:'otidg10@igp.gob.pe'}},
      {$lookup:{
                  from:'cargos',
                  foreignField:'idColaborador',
                  localField : '_id',
                  as : 'cargos'
                  }},
      {$unwind:'$cargos'},
      {$addFields:{idProceso:ObjectId('5fac1498e0ad7ea46d58d9ff')}},
      {$lookup:{
                  from:'unidades_proceso',
                  foreignField:'idProceso',
                  localField : 'idProceso',
                  as : 'unidades_proceso'
                  }},
      {$unwind:'$unidades_proceso'},
      {$lookup:{
                  from:'unidades',
                  foreignField:'_id',
                  localField : 'unidades_proceso.idUnidad',
                  as : 'unidades'
                  }},
      {$unwind:'$unidades'},
      ]) */
    let query = [
        {$match:{email:email}},
        {$lookup:{
            from:'cargos',
            foreignField:'idColaborador',
            localField : '_id',
            as : 'cargos'
            }},
         {$unwind:'$cargos'},
         {$match:{'cargos.leerPersonal':{$exists:true}}},
          {$group:{_id: "$_id",assets:{$push: {$concatArrays:"$cargos.leerPersonal"}}}},
          { $project: {
            _id: 0,
            areasId: {
              $reduce: {
                input: "$assets",
                initialValue: [],
                in: { "$concatArrays": ["$$this", "$$value"] }
              }
            }
          }}
    ]
    let idsAreas = await Personal.aggregate(query);
    let ids  = idsAreas[0].areasId;
    return ids;
  },

  getEmailsUnidad:async function (ids){
    let query = [
          {$match:{idUnidad:{$in:ids}}},
          {$lookup:{
              from:'personal',
              foreignField:'_id',
              localField : 'idColaborador',
              as : 'personal'
           }},
           {$unwind:'$personal'},
           {$group:{_id: "$_id",assets:{$push: "$personal.email"}}},
           {$unwind:'$assets'},
           {$group: { _id:null, emails:{$addToSet: "$assets"}}},
      ];
    let emails = await Cargos.aggregate(query);
    return emails[0].emails
  },
  getFullNamesUnidad:async (ids)=>{
    let query = [
          {$match:{idUnidad:{$in:ids}}},
          {$lookup:{
              from:'personal',
              foreignField:'_id',
              localField : 'idColaborador',
              as : 'personal'
           }},
           {$unwind:'$personal'},
           { $replaceRoot: { newRoot: "$personal.datos" } },
           { $project: {  fullname: { $concat: [ "$apellido", " ", "$nombre" ] } } },
           {$group: { _id:null, fullname:{$addToSet: "$fullname"}}},
      ];
      let fullname = await Cargos.aggregate(query);
      return fullname[0].fullname
  },
  getAllFromFullnames:async (fullNames)=>{
    let query = [
      { $project: { _id: 1 , personal: { nombre:{$concat: ["$datos.apellido"," ", "$datos.nombre"]} ,
                                         dni:'$datos.dni',email:'$email'}}} ,
       {$match:{'personal.nombre':{$in:fullNames}}},
       {$lookup:{
            from:'cargos',
            foreignField:'idColaborador',
            localField : '_id',
            as : 'cargos'
            }},
        {$unwind:'$cargos'},
        {$lookup:{
            from:'unidades',
            foreignField:'_id',
            localField : 'cargos.idUnidad',
            as : 'unidades'
            }},
         {$unwind:'$unidades'},
         //{$addFields: {"personal.nombreCargo": '$cargos.nombreCargo',"personal.nombreUnidad":"$unidades.nombre"}},
         {$addFields: {"personal.nombreCargo": '$cargos.nombreCargo',"personal.nombreUnidad":"$unidades.nombre","personal.idCargo":"$cargos._id","personal.idPersonal":"$_id"}},
         {$project:{personal:1}},
         {$replaceRoot:{newRoot:"$personal"}}
       ]
    let fullDatos = await Personal.aggregate(query);
    return fullDatos
  },
  
}

export default personal;
