const enigma = require('enigma.js');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const schema = require('enigma.js/schemas/12.20.0.json');
const serializeapp = require('serializeapp');

var deleteFiles = require('./deleteFiles');
var path_raw = "./DiffApps/Raw/";
var path_input = "./DiffApps/Input/";
var PromisePool = require('es6-promise-pool')
var mincontentlength = 10;


//////////////////////////////
//Delete files
//////////////////////////////

//var Types = ['bookmarks','dataconnections','dimensions','embeddedmedia','fields','loadScript','masterobjects','measures','properties','sheets','snapshots','stories','variables'];
//Types.forEach(function(element) {
//		console.log('Deleting files in ' + element);
//		deleteFiles.deleteFiles(path_raw + '/' + element + '/');
//});

//////////////////////////////
//End delete files
//////////////////////////////

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

//////////////////////////////
//End Authentication
//////////////////////////////



var getdata = function (AppId, Type) {

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
				console.log(JSON.stringify(err) + ' Serializeapp()');
			}
			else {
				console.log('App: ' + AppId +  ' Serialized');
			}
		})
		
		.then(result => fs.writeFile(path_raw + 'raw/' + Type + '.txt', JSON.stringify(result), function(err) { 
			if(err) {
				console.log(JSON.stringify(err) + ' Error writing file for app ' + AppId);
			} else {
				console.log('File written (with stream) for raw@' + AppId);
				AppSession.close()
			}
		}))
	})
	.catch(error => { 
		console.log('This is catch saying: ' + error.message + ' for AppId: ' + AppId);
		AppSession.close()
	});
	
}


var getdata_loadScript = function (AppId, Type) {

	return new Promise(function (resolve, reject) {
		const AppSession = enigma.create({
			schema,
			url: `wss://${senseHost}/${proxyPrefix}/app/engineData/` + AppId, 
			createSocket: url => new WebSocket(url, {
				headers: { Authorization: `Bearer ${signedToken}` },
			})
		});

		console.log('Starting loadScript for App: ' + Type + ' & ' + AppId);
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

		.then(result => fs.writeFile(path_raw + 'loadScript/' + 'loadScript.' + Type + '.txt', result, function(err) { 
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
		AppSession.close()
	});
	
}


var Type = ['Original','Contender'];

Type.forEach(function(element) {
	var AppId = fs.readFileSync(path_input + element + '.txt', 'utf8', function(err, data) {
		if (err) {
			return console.log(err);
		}
		
	})
	getdata(AppId, element);
	//getdata_loadScript(AppId, element);
	
});

