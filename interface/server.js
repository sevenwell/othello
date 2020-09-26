const http = require('http');
const fs = require('fs');
const path = require('path');
const gc_compute = require('@google-cloud/compute');

const compute = new gc_compute();
const zone = compute.zone('asia-east1-b');
const vm = zone.vm('othello-engine');

const port = process.env.PORT || 3000;

const server = http.createServer(function (request, response) {

    console.log('request ', request.url);

    var filePath = '.' + request.url;
    if (filePath == './') {
        filePath = './index.html';
    }

    if (filePath == './index.html') {

        vm.get(function(err, vm, apiResponse) {
        
            console.log(vm.metadata.status);
            
            if (vm.metadata.status == 'TERMINATED') {
                vm.start((err, operation, apiResponse) => {
                    console.log(operation);
                });
            }
    
        });
    
    }

    var extname = String(path.extname(filePath)).toLowerCase();
    var mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml'
    };

    var contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT') {
                fs.readFile('./404.html', function(error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                response.end();
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });

});

server.listen(port, () => {
    console.log(`Server running.`);
});
  