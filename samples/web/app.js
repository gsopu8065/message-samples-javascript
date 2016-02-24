var express = require('express')
, app = express()
, http = require('http');

app.set('port', 3001);

app.configure(function(){
    app.use(express.static(__dirname + '/../web'));
});

http.createServer(app).listen(app.get('port'), function(){
    console.info("server running on port %d", app.get('port'));
});
