import mongoose from 'mongoose'
import Personal from '../models/personal'
import Proceso from '../models/proceso'
export const getAdicionales = async (email,idProcesoString)=>{
    let idProceso = mongoose.Types.ObjectId(idProcesoString);
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
                    from:'cargos_unidades',
                    foreignField:'idCargos',
                        localField:'cargos._id',
                        as:'cargos_unidades',
                    }},
        {$unwind:'$cargos_unidades'},
        {$lookup:{
                    from:'unidades_proceso',
                    foreignField:'idUnidad',
                        localField:'cargos_unidades.idUnidad',
                        as:'unidades_proceso',
                    }},
        {$unwind:'$unidades_proceso'},
        {$match:{'unidades_proceso.idProceso':idProceso}},
        {$lookup:{
                    from:'unidades',
                    foreignField:'_id',
                        localField:'unidades_proceso.idUnidad',
                        as:'unidades',
                    }},
        {$unwind:'$unidades'},
        {$lookup:{
                    from:'proceso',
                    foreignField:'_id',
                        localField:'unidades_proceso.idProceso',
                        as:'proceso',
                    }},
        {$unwind:'$proceso'},             
        {$project:{unidades:1,proceso:1}}
    ]
    let respuesta = null;
    try {
        respuesta = await Personal.aggregate(query)
        return respuesta
    } catch (error) {
        return [];
    }
}

export const passProcesoContent = async (idProcesoString)=>{
    let respuesta = null;
    let query = {_id:mongoose.Types.ObjectId(idProcesoString)}
    try {
        let respuesta = await Documento.findOne(query);
        return respuesta;
    } catch (error) {
        return {};
    }
}