import mongoose from 'mongoose'
const cargos = new mongoose.Schema({
  nombreCargo:{type:String , required:true},
  idColaborador:{type:mongoose.Schema.Types.ObjectId , required:true},
  idUnidad:{type:mongoose.Schema.Types.ObjectId , required:true},
},{
  versionKey:false
})

module.exports = mongoose.model('cargos',cargos,'cargos' )
