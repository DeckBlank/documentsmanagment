import mongoose from 'mongoose'
const personal = new mongoose.Schema({
  datosPersonales:{type:Map},
  email:{type:String , required:true},
},{
  versionKey:false
})

module.exports = mongoose.model('personal',personal,'personal' )
