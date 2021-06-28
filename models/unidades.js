import mongoose from 'mongoose'
const unidades = new mongoose.Schema({
  nombre:{type:String , required:true},
  descripcion:{type:String , required:true},
},{
  versionKey:false
})

module.exports = mongoose.model('unidades',unidades,'unidades' )
