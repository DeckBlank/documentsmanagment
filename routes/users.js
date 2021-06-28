import express from 'express'
const router = express.Router();
const User = require('../models/users');
import auth from '../helpers/auth'
const multer = require('multer');
var form = multer()

router.post('/login',form.none(),async function (req , res){
  let usuario = req.body;
  let secret = process.env.JWT_SECRET;
  let expiraEn = 60*60;
  let resultado = await auth.verificarLogin(usuario,secret,expiraEn);
  res.status(resultado.code).json({mensaje:resultado.mensaje})
})


router.post('/create',async function (req , res){
  let usuario = req.body;
  let resultado = await auth.verificacionCreacion(usuario,'@');
  res.status(resultado.code).json({mensaje:resultado.mensaje})
})

module.exports = router
