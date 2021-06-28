import dotenv from 'dotenv'
dotenv.config({path:'.env'})
import cors from 'cors'

var whitelist = process.env.PERMITIDOS.split(' ')
var corsOptions = {
  origin: function (origin, callback) {
    console.log(origin);
        if (whitelist.indexOf(origin) !== -1||typeof origin =='undefined') {
          callback(null, true)
        } else {
          callback(new Error('No permitido por CORS'))
          // res.status(403).json('No permitido por CORS');
        }
    },
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
module.exports = whitelist;
module.exports = corsOptions
