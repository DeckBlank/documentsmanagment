const {google} = require('googleapis');
import fs from 'fs'
const  folderDrive = {
  downloadFile:async function (auth,fileId,saveFilePath,){
      const drive = google.drive({ version: "v3", auth });
      const rep  = drive.files
      .get({fileId, alt: 'media'}, {responseType: 'stream'})
      .then(res => {
        return new Promise((resolve, reject) => {
          console.log(`writing to ${saveFilePath}`);
          const dest = fs.createWriteStream(saveFilePath);
          let progress = 0;
          res.data
            .on('end', () => {
              console.log('Done downloading file.');
              resolve(saveFilePath);
            })
            .on('error', err => {
              console.error('Error downloading file.');
              reject(err);
            })
            .on('data', d => {
              progress += d.length;
              if (process.stdout.isTTY) {
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write(`Downloaded ${progress} bytes`);
              }
            })
            .pipe(dest);
        });
      })
      .catch(x=>{
        console.log('ss',x);
      })

      return await rep;
  },
  getFiles : async function (auth,query){
    const drive = google.drive({ version: "v3", auth });
    const res = await drive.files.list(query);
    const files = res.data.files;
    console.log(res.data.files);
    if (files.length === 0) {
      return []
    } else {
      // for (const file of files) {
      //   console.log(`${file.webViewLink} -${file.name} (${file.id})`);
      // }
      return files
    }
  },
  copyFile:async function(auth,fileId='17owJ5a5nvxdp76ubdluh-Hx8okWrvHJH9UcOmSQ9ozY',fileName){
    const drive = google.drive({ version: "v3", auth });
    let requestBody = {name:fileName}
    const res = await drive.files.copy({fileId,requestBody});
    return res;
  },
  scopes: ['https://www.googleapis.com/auth/drive.metadata.readonly',
              'https://www.googleapis.com/auth/drive.file',
              'https://www.googleapis.com/auth/drive',
              'https://www.googleapis.com/auth/drive.appdata',
              'https://www.googleapis.com/auth/drive.file',
              'https://www.googleapis.com/auth/drive.metadata',
              'https://www.googleapis.com/auth/drive.metadata.readonly',
              'https://www.googleapis.com/auth/drive.photos.readonly',
              'https://www.googleapis.com/auth/drive.readonly',],
}

export default folderDrive;
