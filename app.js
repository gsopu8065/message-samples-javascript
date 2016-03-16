var express = require('express')
, app = express()
, http = require('http');

app.set('port', 3000);

app.configure(function(){
    app.use(express.static(__dirname + '/../'));
});

http.createServer(app).listen(app.get('port'), function(){
    console.info("server running on port %d", app.get('port'));
});
