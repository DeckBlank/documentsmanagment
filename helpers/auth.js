const User = require('../models/users');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const auth = {
  verificarLogin:async function (usuario,secret,expiresIn){
    if(usuario.email&&usuario.password){
      try {
        let existe = await User.find({email:usuario.email})
        if (existe.length===1) {
          existe = existe[0]
          if (await bcrypt.compareSync(usuario.password, existe.password)){
            const token = jwt.sign(
                {
                    data: {
                        name:existe.name,
                        userId: existe._id
                    }
                },
              secret,{ expiresIn });
            return { code:200,mensaje:{token,name:existe.name,email:existe.email,avatar:existe.avatar}}
          }else{
              return {code:403,mensaje:'Credenciales incorrectas'}
          }
        }else{
          return {code:403,mensaje:'Usuario no existe'}
        }
      } catch (e) {
        return {code:500,mensaje:e.message}
      }
    }else{
      return {code:403,mensaje:'Credenciales incorrectas'}
    }

  },
  verificacionCreacion:async function (usuario,dominio){
    if(usuario.email.includes(dominio)){
      try {
        let existe = await User.find({email:usuario.email})
        if (existe.length) {
          return {code:409,mensaje:'Usuario ya existe'}
        }else{
          let saltRounds = 10;
          let salt = bcrypt.genSaltSync(saltRounds);
          let hash = bcrypt.hashSync(usuario.password, salt);
          let userCreated = new User({...usuario,...{password:hash},name:usuario.email});
          let resultado =await  userCreated.save();
          return {code:200,mensaje:'Usuario creado'}
        }
      } catch (e) {
        return {code:500,mensaje:e.message}
      }
    }else{
      return {code:500,mensaje:'No puedes crearte una cuenta'}
    }
    return
  },
  createToken: (data,secret,expiresIn)=>{
    const token = jwt.sign(
      {
          data
      },
    secret,{ expiresIn });
    return token;
  },
  validarToken:(token,secret) =>{
    try {
          let decoded = jwt.verify(token, secret)
          return decoded;
      } catch (e) {
         return null
      }
    //next()
  }
  

}
export default auth
