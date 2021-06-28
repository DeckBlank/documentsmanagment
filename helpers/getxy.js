import Documento from '../models/documento'
import mongoose from 'mongoose'
export const returnXY = async (id)=>{
    let xy = await Documento.findOne({
        _id:mongoose.Types.ObjectId(id)
    },{firmantes:1,nivelFirma:1})
    let respuesta = {}
    for (const firmante of xy.firmantes) {
        if(firmante.ordenFirma===xy.nivelFirma+1){
            respuesta = {...firmante.ubicacionFirma}
        }
    }
    return respuesta
}