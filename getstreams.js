var https = require('https');
var fs = require('fs');
var os = require('os');
var path_raw = "./DiffApps/Streams";

////////////////////////
//Authentication
////////////////////////
var session = {
   hostname: 'clsestolab01',
   port: 4242,
   path: '/qrs/stream/full?xrfkey=abcdefghijklmnop',
   method: 'GET',
   headers: {
      'x-qlik-xrfkey' : 'abcdefghijklmnop',
      'X-Qlik-User' : 'UserDirectory= Internal; UserId= sa_repository '
   },
   key: fs.readFileSync("C:\\Users\\clman\\Documents\\Cert\\client_key.pem"),
   cert: fs.readFileSync("C:\\Users\\clman\\Documents\\Cert\\client.pem"),
   ca: fs.readFileSync("C:\\Users\\clman\\Documents\\Cert\\root.pem")
};
////////////////////////
//End Authentication
////////////////////////


https.get(session, function(res) {
   console.log("Got response: " + res.statusCode);
   res.on("data", function(chunk) {
      console.log('Pelle ' + chunk);
	  fs.writeFile(path_raw + '/' +  os.hostname() + '_' + 'Streams.txt', chunk, function(err) { console.log(err)});	
   });
   }).on('error', function(e) {
      console.log("Got error: " + e.message);
});