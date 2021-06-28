import mongoose from 'mongoose'

const documentoSchema  = new mongoose.Schema({
  idCargoCreador:{type:mongoose.Schema.Types.ObjectId,required:false},
  visibleToCargos:[{type:String}],
  idProceso:{type:mongoose.Schema.Types.ObjectId,required:true},
  nivelFirma:{type:Number,required:true},
  cargoFirmando:{type:mongoose.Schema.Types.ObjectId},
  idGoogleFile:{type:String,required:true},
  idDocumento:{type:String,required:true},
  cerrado:{type:Boolean,required:true},
  siging:{type:Boolean,required:false,default:true},
  dispatching:{type:Boolean,required:false,default:false},
  documentoPrecedente:[{type:String}],
  datos:{type:Map,required:true},
  //emailFirmantes:{type:[String],required:false},
  firmantes:[{type:Object}],
  },{
    versionKey:false
})

module.exports = mongoose.model('documento',documentoSchema,'documento')
