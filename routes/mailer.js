
import express from 'express'
import mailer from '../helpers/mailer.js'
const router = express.Router();

router.post('/send',(req,res)=>{
  mailer.sendMail();
  res.json({hola:"mundo"});
})

module.exports = router;
