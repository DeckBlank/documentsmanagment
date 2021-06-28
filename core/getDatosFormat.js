let returnGetRecibe = [{
  "_id" : mongoose.Types.ObjectId("5f5805700f2f4375c619d14d"),
  "recibe" : {
      "nombre" : "Guzman Santiago Jose Luciano",
      "dni" : 455578549,
      "email" : "otidg10@igp.gob.pe",
      "cargo" : "Asistente de BNDG",
      "idCargo" : mongoose.Types.ObjectId("5f5806c50f2f4375c619d14f")
  },
  "responsable" : {
      "email" : "gbaila@igp.gob.pe",
      "nombre" : "Baila Gean",
      "dni" : 455570000,
      "cargo" : "Cordinador de la UIS"
  }
}]
import mongoose from 'mongoose'
import Personal from '../models/personal'
import Cargos from '../models/cargos'
import Proceso from '../models/proceso'
const getDatos = {
    getRecibeResponsable:async function(nombreCompleto='Guzman Santiago Jose Luciano',idProceso="5f595deee75179265b96b988"){
        idProceso = mongoose.Types.ObjectId(idProceso)
 /*        let aggregate = [{ $project: { _id: 1 , recibe: { nombre:{$concat: ["$datos.apellido"," ", "$datos.nombre"]} ,dni:'$datos.dni',email:'$email'}}} ,
        { $match:{'recibe.nombre':nombreCompleto}},
        {$lookup:{ from:'cargos',
                    foreignField:'idColaborador',
                    localField : '_id',
                    as : 'cargos'
                    }},
          {$addFields: {"recibe.cargo": "$cargos.nombreCargo"}},
          {$unwind:"$recibe.cargo"},
          {$project:{recibe:1}}] */
          let aggregate = [
            { $project: { _id: 1 , recibe: { nombre:{$concat: ["$datos.apellido"," ", "$datos.nombre"]} ,dni:'$datos.dni',email:'$email'}}} ,
            { $match:{'recibe.nombre':nombreCompleto}},
             {$lookup:{
                        from:'cargos',
                        foreignField:'idColaborador',
                        localField : '_id',
                        as : 'cargos'
                        }},
              {$unwind:"$cargos"},
              {$addFields: {"recibe.cargo": "$cargos.nombreCargo"}},
              {$addFields: {"recibe.idCargo": "$cargos._id"}},
              {$lookup:{
                        from:'cargos_unidades',
                        foreignField:'idCargos',
                        localField : 'cargos._id',
                        as : 'cargos_unidades'
                        }},
                 {$unwind:"$cargos_unidades"},
                {$lookup:{
                        from:'unidades_proceso',
                        foreignField:'idUnidad',
                        localField : 'cargos_unidades.idUnidad',
                        as : 'unidades_proceso'
                        }},
                        {$unwind:"$unidades_proceso"},
               {$match:{'unidades_proceso.idProceso':idProceso}},
              {$lookup:{
                        from:'unidades',
                        foreignField:'_id',
                        localField : 'unidades_proceso.idUnidad',
                        as : 'unidad'
                        }},
               {$lookup:{
                        from:'cargos',
                        foreignField:'_id',
                        localField : 'unidad.responsable',
                        as : 'cargos'
                        }},
               {$lookup:{
                        from:'personal',
                        foreignField:'_id',
                        localField : 'cargos.idColaborador',
                        as : 'responsable'
                        }},
                        {$unwind:"$cargos"},
                        {$unwind:"$responsable"},
               {$project:{recibe:1,responsable:{email:'$responsable.email',nombre:{$concat:['$responsable.datos.apellido',' ','$responsable.datos.nombre']},dni:'$responsable.datos.dni',cargo:'$cargos.nombreCargo'}}},
            ]
            let datos = await Personal.aggregate(aggregate)
          return datos[0]
    },
    getBodySheet:async function(idProceso="5f595deee75179265b96b988"){
        idProceso = mongoose.Types.ObjectId(idProceso)
        let datos = await Proceso.findOne({_id:idProceso},{googleSheet:1,crud:1})
        //console.log(datos,returnGetBodySheet)
         return  datos;
    },
    getAllFromCargos:async (arrayCargos)=>{
      let aggregate = [
        {$match:{_id:{$in:arrayCargos}}},
        {$lookup:{
                from:'personal',
                foreignField:'_id',
                localField : 'idColaborador',
                as : 'personal'
                }},
         {$unwind:'$personal'},
        // {$group:{_id:'$_id',email:{$first:'$personal.email'}}}
        { $project: { _id: 1 , nombre:{$concat: ["$personal.datos.apellido"," ", "$personal.datos.nombre"]} ,
            dni:'$personal.datos.dni',email:'$personal.email',nombreCargo:'$nombreCargo'}} ,
    ]
    try {
      let res = await Cargos.aggregate(aggregate)
      return res;
    } catch (error) {
      return []
    }
    },
    getEmailsFromArrayCargos:async (arrayCargos)=>{
      let res = await getDatos.getAllFromCargos(arrayCargos)
      let emails = []
      for (const email of res) {
        emails.push(email.email)
      }
      return emails;
    }
}

export default getDatos