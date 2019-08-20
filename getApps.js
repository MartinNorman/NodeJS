const enigma = require('enigma.js');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const schema = require('enigma.js/schemas/12.20.0.json');
const serializeapp = require('serializeapp');

var deleteFiles = require('./deleteFiles');
var path_raw = "./DiffApps/Raw/";

//////////////////////////////
//Authentication
//////////////////////////////
const senseHost = 'clsemlmlab01.climber.eu';
const proxyPrefix = 'jwt';
const userDirectory = 'CLIMBER';
const userId = 'clman';

const token = {
	UserDirectory: userDirectory,
	UserId: userId,
};
const privateKeyPath = './keys/private.pem';
const key = fs.readFileSync(path.resolve(__dirname, privateKeyPath));
const signedToken = jwt.sign(token, key, { algorithm: 'RS256' });
const config = {
  schema,
  url: `wss://${senseHost}/${proxyPrefix}/app/engineData`,
  createSocket: url => new WebSocket(url, {
    headers: { Authorization: `Bearer ${signedToken}` },
  }),
};
const session = enigma.create(config);

console.log("Connection created");
//////////////////////////////
//End Authentication
//////////////////////////////




///////////////////////////////////////////////////////////////////////////////

var Apps = new Array();

function getapps() {
	console.log('Here we go');
	session.open()
//	console.log('Session open');
	.then(function(global) {
		console.log('Global');
		global.getDocList().then(function(docList) {
			session.close();
			console.log('Closing session');
			for (i = 0; i < docList.length; i++) {
				App = docList[i].qDocId;
				console.log(App);
				Apps.indexOf(App) === -1 ? Apps.push(App) : console.log("Item exists");	
			}
			fs.writeFile(path_raw + 'Apps.txt', Apps, function(err) { 
				if(err) {
					console.log(err + ' Error writing file');
				} else {
					console.log('File written with Apps' );
				}
			})	
		}, function(err) { console.log(err + 'Some sort of error it seems')});
	}, function(err) { console.log(err + 'It seems Sense is not responding')});
}	

getapps();

