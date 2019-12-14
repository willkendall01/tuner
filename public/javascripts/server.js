var fs = require('fs');
const http = require('http');
const alert1 = require('./https://cdn.bootcss.com/sweetalert/2.1.0/sweetalert.min.js');
const aubio1 = require('./aubio.js');
const tuner1 = require('./tuner.js');
const meter1 = require('./meter');
const freq_bar1 = require('./frequency-bars.js');
const notes1 = require('./notes.js');
const app1 = require('../app.js');




/*<script src="https://cdn.bootcss.com/sweetalert/2.1.0/sweetalert.min.js"></script>
<script src="aubio.js"></script>
<script src="tuner.js"></script>
<script src="meter.js"></script>
<script src="frequency-bars.js"></script>
<script src="notes.js"></script>
<!-- <script src="app.js"></script> -->*/

const hostname = '127.0.0.1';
const port = 3000;

fs.readFile('test_org/index.html', function (err, html) {

    if (err) throw err; 

    const server = http.createServer((req, res) => {
        res.writeHeader(200, {"Content-Type": "text/html"}); 
        res.write(html);  
        res.end();  
    });



    server.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
    });

});





/*
=============================

var http = require('http');
var fs = require('fs');

const PORT=8080; 

fs.readFile('./index.html', function (err, html) {

    if (err) throw err;    

    http.createServer(function(request, response) {  
        response.writeHeader(200, {"Content-Type": "text/html"});  
        response.write(html);  
        response.end();  
    }).listen(PORT);
});*/