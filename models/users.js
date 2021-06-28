import mongoose from 'mongoose'

const usersSchema = new mongoose.Schema({
email:{type:String,required:true},
password:{type:String,required:true},
name:{type:"String",required:true},
avatar:{type:"String",required:false},
},{
  versionKey:false
})

module.exports = mongoose.model('users',usersSchema,'notificador_users')
