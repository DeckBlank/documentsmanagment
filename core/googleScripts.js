// no soporta service account
// googleScripts.createAppsScript(auth)
// let idScript = '1_6kSr5yuHwSgChDk6g0vZJ_inAo7WUoRyg0hpkSwL4jN22CdcqMAqKrT'
// let funcionName = 'crearHP'
// googleScripts.callAppsScript(auth,idScript,funcionName)

const {google} = require('googleapis');
import fs from 'fs'
const  script = {
  scopes : ['https://www.googleapis.com/auth/script.projects','https://www.googleapis.com/auth/script.external_request'],
  createAppsScript : function (auth) {
  const script = google.script({version: 'v1', auth});
  script.projects.create({
    resource: {
      title: 'PorSiempre',
    },
  }, (err, res) => {
    if (err) return console.log(`The API create method returned an error: ${err}`);
    script.projects.updateContent({
      scriptId: res.data.scriptId,
      auth,
      resource: {
        files: [{
          name: 'hello',
          type: 'SERVER_JS',
          source: 'function helloWorld() {\n  console.log("Hello, world!");\n}',
        }, {
          name: 'appsscript',
          type: 'JSON',
          source: '{\"timeZone\":\"America/New_York\",\"exceptionLogging\":' +
           '\"CLOUD\"}',
        }],
      },
    }, {}, (err, res) => {
      if (err) return console.log(`The API updateContent method returned an error: ${err}`);
      console.log(`https://script.google.com/d/${res.data.scriptId}/edit`);
    });
  });
},
callAppsScript:function (auth,idScript,funcionName) { // eslint-disable-line no-unused-vars
  const scriptId = idScript;
  const script = google.script('v1');
  // Make the API request. The request object is included here as 'resource'.
  script.scripts.run({
    auth: auth,
    resource: {
      function: funcionName,
    },
    scriptId: scriptId,
  }, function(err, resp) {
    if (err) {
      // The API encountered a problem before the script started executing.
      console.log(resp);
      console.log('The API returned an error: ' + err);
      return;
    }
    if (resp.error) {
      // The API executed, but the script returned an error.

      // Extract the first (and only) set of error details. The values of this
      // object are the script's 'errorMessage' and 'errorType', and an array
      // of stack trace elements.
      const error = resp.error.details[0];
      console.log('Script error message: ' + error.errorMessage);
      console.log('Script error stacktrace:');

      if (error.scriptStackTraceElements) {
        // There may not be a stacktrace if the script didn't start executing.
        for (let i = 0; i < error.scriptStackTraceElements.length; i++) {
          const trace = error.scriptStackTraceElements[i];
          console.log('\t%s: %s', trace.function, trace.lineNumber);
        }
      }
    } else {
      // The structure of the result will depend upon what the Apps Script
      // function returns. Here, the function returns an Apps Script Object
      // with String keys and values, and so the result is treated as a
      // Node.js object (folderSet).
      const folderSet = resp.response.result;
      if (Object.keys(folderSet).length == 0) {
        console.log('No folders returned!');
      } else {
        console.log('Folders under your root folder:');
        Object.keys(folderSet).forEach(function(id) {
          console.log('\t%s (%s)', folderSet[id], id);
        });
      }
    }
  });
}
}

export default script;
