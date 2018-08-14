const _ = require('lodash');
const config = require('./config');
const winston = require('./logger')(__filename);
const prince    = require('prince-promise');

const binaryParser = require('superagent-binary-parser');

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

    let pdfOptions = {};
    
    let options = _.defaults({
          media     : 'screen',
          'page-margin': '0.5cm',
      }, req.query);
      
    if(options){
        _.each(Whitelist_PDFParams, function(param){
            if(options[param])
                pdfOptions[param] = options[param];
        });
    }
    
    let pageContent = req.body;
    
    winston.info('Render Prince PDF ..');

    if(config.PRINCE_PDF_LICENSE_FILE)
        pdfOptions['license-file'] = config.PRINCE_PDF_LICENSE_FILE;
        
    const pdf = await prince(pageContent, pdfOptions);

    if ((req.query||{}).attachmentName) {
        res.attachment(opts.attachmentName);
    }
    
    res.set('content-type', 'application/pdf');
    res.send(pdf);
      
}

module.exports = {    
    renderPdf,
}
