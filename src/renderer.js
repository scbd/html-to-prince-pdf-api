const _ = require('lodash');
const config = require('./config');
const winston = require('./logger')(__filename);
const prince    = require('prince-promise');
const AWS = require('aws-sdk');
const fs        = require('fs');

let configFile = process.env.CONFIG_FILE || '/run/secrets/config.json';
let awsConfig = {};

if(configFile && fs.existsSync(configFile)){
    awsConfig = require(configFile).awsAccessKeys.global;
}
let S3 = new AWS.S3({
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
    region: 'us-east-1',
    apiVersion: '2006-03-01'
});

const Whitelist_PDFParams = [
    'baseurl'     ,
    'page-margin' ,
    'pdf-title'   ,
    'pdf-subject' ,
    'pdf-author'  ,
    'pdf-keywords',
    'pdf-creator' ,
];

async function renderPdf(req, res) {

    try{
        let pdfOptions = {};
        
        let options = _.defaults({
            'media'         : 'screen',
            'page-margin'   : '0.5cm',
        }, req.query);
        
        if(options){
            _.each(Whitelist_PDFParams, function(param){
                if(options[param])
                    pdfOptions[param] = options[param];
            });
        }
        
        let pageContent = req.body;
        
        winston.info(`Render Prince PDF for HTML length ${pageContent.length}`);

        if(config.PRINCE_PDF_LICENSE_FILE)
            pdfOptions['license-file'] = config.PRINCE_PDF_LICENSE_FILE;
            
        const pdf = await prince(pageContent, pdfOptions);

        winston.info('Prince PDF generated..');
        
        if(!req.query.link || req.query.link == 'false'){
            if ((req.query||{})["attachment-name"]) {
                res.attachment(req.query["attachment-name"]);
            }
            res.status(200);
            res.set('content-type', 'application/pdf');
            res.send(pdf);
        }
        else{
            let bucket =  (req.query||{}).bucket|| 'pdf-cache-prod/drafts';

            let key = `${((req.query||{})["attachment-name"]||'')}-${guid()}.pdf`
            let s3Options =  {
                Bucket      : bucket, 
                Key         : key,
                ContentType : 'application/pdf', 
                Body        : pdf, 
                ACL         : 'public-read'
            };

            let s3File = await S3.putObject(s3Options).promise();
            
            res.status(200);
            res.send({url:`https://s3.amazonaws.com/pdf-cache-prod/drafts/${s3Options.Key}`});

        }

        
    }
    catch(err){
        winston.error(`Error rendering pdf: ${err}`);
        winston.error(err.stack);
        res.status(400).send('Error rendering pdf');
    }
      
}
function guid(sep) {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    if (sep === undefined)
        sep = '-';

    return s4() + s4() + sep + s4() + sep + s4() + sep + s4() + sep + s4() + s4() + s4();
}

module.exports = {    
    renderPdf,
}
