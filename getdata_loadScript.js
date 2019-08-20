const enigma = require('enigma.js');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const schema = require('enigma.js/schemas/12.20.0.json');
const serializeapp = require('serializeapp');

var path_raw = "./DiffApps/Raw/";
var path_input = "./DiffApps/Input/";

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


module.exports = {
  loadScript: function (AppId, Type) {

//var getdata_loadScript = function (AppId, Type) {

	console.log(AppId);
	return new Promise(function (resolve, reject) {
		const AppSession = enigma.create({
			schema,
			url: `wss://${senseHost}/${proxyPrefix}/app/engineData/` + AppId, 
			createSocket: url => new WebSocket(url, {
				headers: { Authorization: `Bearer ${signedToken}` },
			})
		});

		console.log('Starting for App: ' + Type + ' & ' + AppId);
		AppSession.open()
		.then(global => global.openDoc(AppId), function(err) { 
			if(err) {
				console.log(JSON.stringify(err) + ' Error openDoc()');
			} else {
				console.log('App: ' + AppId +  ' opened');
			}
		 }) 

		.then(app => serializeapp(app), function(err) { 
			if(err) {
				console.log(JSON.stringify(err) + ' Serializeapp()' );
			}
		})

		.then(result => fs.writeFile(path_raw + 'loadScript/' + 'loadScript.' + Type + '.txt', result.loadScript, function(err) { 
			if(err) {
				console.log(JSON.stringify(err) + ' Error writing file for app ' + AppId);
			} else {
				console.log('File written (with stream) for loadScript@' + AppId);
				AppSession.close()
			}
		}))

	})

	.catch(error => { 
		console.log('This is catch saying: ' + error.message + ' for AppId: ' + AppId);
	});
	
}
 }
//};
