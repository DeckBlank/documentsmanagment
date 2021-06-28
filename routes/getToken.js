import express from 'express'
const route = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
import auth from '../helpers/auth'
import {returnXY} from '../helpers/getxy'

route.post('/', async (req,res)=>{
    let id = req.body.id;
    let ubicacion = await returnXY(id)
    let data  = req.body;
    console.log('token',data);
    let token = auth.createToken(data,process.env.JWT_SECRET,10*60)
    console.log(token);
    res.json({token,ubicacion});
})

module.exports = route;