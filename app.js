require('dotenv').config({ path: '.env' })
var express = require('express');
import mongoose from 'mongoose'
import helmet from 'helmet'
const jwt = require('jsonwebtoken');
import cors from 'cors'
import corsOptions from './config/cors.js'
import morgan from 'morgan'

var app = express();
app.use(morgan('tiny'));
app.use(helmet());
/* app.use(helmet({
    frameguard: {
      action: 'allow-from',
      domain: 'http://localhost:8000'
    }
  })) */
app.use(express.json());
app.use(cors(corsOptions));

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('connected to database'))


const users = require('./routes/users');
app.use('/user',users);

// const mailer = require('./routes/mailer');
// app.use('/mail',mailer);

const documentos = require('./routes/documentos');
app.use('/documentos',documentos);

const retorno = require('./routes/retorno');
app.use('/retorno',retorno);

function removeFrameguard (req, res, next) {
    res.removeHeader('X-Frame-Options')
    next()
  }

const files = require('./routes/files');
app.use('/files',removeFrameguard,files);

const personal = require('./routes/personal');
app.use('/personal',personal);

const getToken = require('./routes/getToken');
app.use('/getToken',getToken);




import Utilidades from './helpers/utilidadesDocumentos.js'
import pdfCreator from './core/pdfCreator.js'
import cuenta from './core/cuentaGoogleServer.js'
import googleSpreadSheet from './core/googleSpreadSheet.js'
import drive from './core/googleDrive.js'
import getDatosFormat from './core/getDatosFormat.js'



module.exports = app;

/* let a = (new Date());
console.log(a.toLocaleString().replace(/[:\/ ]/g,'')) */