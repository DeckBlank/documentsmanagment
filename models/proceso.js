import mongoose from 'mongoose'

const procesoSchema = new mongoose.Schema({
  idGoogleFolder: {type:String,required:true},
  prefijoProceso:{type:String,required:true},
  nombreProceso: {type:String,required:true},
  cargosFirmasRequeridas:[
    {
      idCargo:{type:mongoose.Schema.Types.ObjectId,required:true},
      nombreCargo:{type:String,required:true},
      ordenFirma:{type:Number,required:true},
    }
  ],
  ordenFirmaFirmantes:{type:Number,required:false},
  notificarResuelto:[
    {
      idCargo:{type:mongoose.Schema.Types.ObjectId,required:true},
      nombreCargo:{type:String,required:true},
      ordenFirma:{type:Number,required:false},
    },
  ],
  creadores : [
       {
           idCargo : {type:mongoose.Schema.Types.ObjectId,required:true},
           nombreCargo : {type:String,required:true},
       },
   ],
   crud:[{type:Object}],
   googleSheet:{type:Object}
},{
  versionKey:false
})
module.exports = mongoose.model('proceso',procesoSchema,'proceso')
