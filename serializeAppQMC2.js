const enigma = require('enigma.js');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const schema = require('enigma.js/schemas/12.20.0.json');
const serializeapp = require('serializeapp');

//var deleteFiles = require('./deleteFiles');
var path_raw = "./DiffApps/Raw/";
var PromisePool = require('es6-promise-pool')
var mincontentlength = 10;
var stringify2 = require('json-stringify-safe');


//////////////////////////////
//Delete files
//////////////////////////////

// var Types = ['bookmarks','dataconnections','dimensions','embeddedmedia','fields','loadScript','masterobjects','measures','properties','sheets','snapshots','stories','variables'];

// Types.forEach(function(element) {
  // console.log('Deleting files in ' + element);
  // deleteFiles.deleteFiles(path_raw + '/' + element + '/');
// });

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
const privateKeyPath = './Keys/private.pem';
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

//console.log("Connection created");
//////////////////////////////
//End Authentication
//////////////////////////////




///////////////////////////////////////////////////////////////////////////////

var getdata = function (count, AppId) {
	console.log(count, AppId);
	return new Promise(function (resolve, reject) {
		const AppSession = enigma.create({
			schema,
			url: `wss://${senseHost}/${proxyPrefix}/app/engineData/` + AppId, 
			createSocket: url => new WebSocket(url, {
				headers: { Authorization: `Bearer ${signedToken}` },
			})
		});
//		var DotIsAt = AppName.length -4; //Get the position of the first dot 
//		var FileName = AppName.substring(0, DotIsAt); //removes the .qvf part from the appname.
		console.log('Starting for App: ' + AppId);
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
		.then(result => fs.writeFile(path_raw + 'loadScript/' + AppId + '.txt', result.loadScript, function(err) { 
			if(err) {
				console.log(JSON.stringify(err) + ' Error writing file for app ' + AppId);
			} else {
				console.log('File written (with stream) for ' + AppId);
				AppSession.close()
			}
		}))
		
 		.then(result => AppSession.close(), function(err) { 
			if(err) {
				console.log(JSON.stringify(err) + ' Close session' );
			} else {
				console.log('Session closed for AppId: ' + AppId);
			}
		})
		setTimeout(function () {
			console.log('Resolving: ' + count + ' - ' + AppId)
			resolve(count);
		}, 10000)
	})

	.catch(error => { 
		console.log('This is catch saying: ' + error.message + ' for AppId: ' + AppId);
	});
}

var Apps = new Array();

function getapps() {
	console.log('Here we go');
	session.open()

	.then(function(global) {

		global.getDocList().then(function(docList) {

		session.close();
			for (i = 0; i < docList.length; i++) {
				App = docList[i].qDocId;
				Apps.indexOf(App) === -1 ? Apps.push(App) : console.log("Item exists");	
			}
			fs.writeFile(path_raw + 'Apps.txt', Apps, function(err) { 
				if(err) {
					console.log(err + ' Error writing file');
				} else {
					console.log('File written with Apps' );
				}
			})	

		}, function(err) { console.log(err)});

	}, function(err) { console.log(err + 'It seems Sense is not responding')});

}	

var count = -1;
var promiseProducer = function () {
	if (count < Apps.length -1) { 
		count++
		var AppId = Apps[count];
		console.log(AppId);
		return getdata(count, AppId)
	} else {
		return null
	}
}

var pool = new PromisePool(promiseProducer, 1)

getapps();


// var FileWithApps = fs.readFileSync(path_raw + 'Apps.txt', 'utf8', function(err, data) {
	// if (err) {
		// return console.log(err);
	// }
// })

// var Apps = new Array(); 
// var Apps = FileWithApps.split(",");
// console.log(Apps);

// pool.start()
// .then(function () {
	// console.log('Complete')
// })



// ////////////////////////////////
// //Functions
// ////////////////////////////////
// function getdata(AppId, AppName) {
	// const AppConfig = {
		// schema,
		// url: `wss://${senseHost}/${proxyPrefix}/app/engineData/` + AppId, 
		// createSocket: url => new WebSocket(url, {
			// headers: { Authorization: `Bearer ${signedToken}` },
		// })
	// };
	// const AppSession = enigma.create(AppConfig);

	
	// AppSession.open()
	// .then(global => global.openDoc(AppId))
	// .then(app => serializeapp(app))
	// .then(result => { 
		// if(JSON.stringify(result.properties).length > mincontentlength && result.properties.stream.id != null) {
			// fs.writeFile(path_raw + '/' + 'properties' + '/' + result.properties.qTitle + '_' + result.properties.stream.id  + '.txt', JSON.stringify(result.properties), function(err) { 
				// if(err) {
					// console.log(err + ' Error properties for app ' + AppId);
					// return 1;
				// } else {
					// console.log('File written (with stream) for ' + AppName);
					// return 1;			
				// }
			// }) 
		// } else if (JSON.stringify(result.properties).length > mincontentlength) {
			// fs.writeFile(path_raw + '/' + 'properties' + '/' + result.properties.qTitle + '_streamless.txt', JSON.stringify(result.properties), function(err) { 
				// if(err) {
					// console.log(err + ' Error properties for app ' + AppId + '  - no stream');
					// return 1;
				// } else {
					// console.log('File written (without stream) for ' + AppName );
					// return 1;
				// }
			// }) 
		// }
	// })
	
// //	.then(close => AppSession.session.close())
		

	// .catch(error => { 
		// console.log('This is catch saying: ' + error.message + ' for AppName: ' + AppName);
		
	// });
// }


// ////////////////////////
// //Main
// ////////////////////////

 // session.open()
	// .then(function(global) {
		// global.getDocList().then(function(docList) {
			// session.close();
			// for (i = 0; i < docList.length; i++) {
				// var AppId = docList[i].qDocId;
				// var AppName = docList[i].qDocName;	
				// getdata(AppId, AppName);
			// }
			
		// }, function(err) { console.log(JSON.stringify(err))});
	// }, function(err) { console.log('It seems Sense is not responding')});

			
// ////////////////////////////////
// //End main
// /////////////////////////////////
		
	// // AppSession.open()
	// // .then(global => global.openDoc(AppId))
	// // .then(app => serializeapp(app))
	// // .then((result) => { if(JSON.stringify(result.bookmarks).length > mincontentlength)  {
		// // fs.writeFile(path_raw + '/' + 'bookmarks' + '/' + result.properties.qTitle + '_' + result.properties.stream.id  + '.txt', JSON.stringify(result.bookmarks), function(error) { console.log(error + ' Error bookmarks for app ' + AppId)});
		// // } else {
		// // console.log('Only ' + JSON.stringify(result.bookmarks).length + ' characters for bookmarks');
		// // }
	// // })
	
	// // AppSession.open()
	// // .then(global => global.openDoc(AppId))
	// // .then(app => serializeapp(app))
	// // .then((result) => { if(JSON.stringify(result.dataconnections).length > mincontentlength)  {
		// // fs.writeFile(path_raw + '/' + 'dataconnections' + '/' + result.properties.qTitle + '_' + result.properties.stream.id  + '.txt', JSON.stringify(result.dataconnections), function(err) { console.log(err + ' Error dataconnections for app ' + AppId)});
		// // } else {
		// // console.log('Only ' + JSON.stringify(result.dataconnections).length + ' characters for dataconnections');
		// // }
	// // })
	
	// // AppSession.open()
	// // .then(global => global.openDoc(AppId))
	// // .then(app => serializeapp(app))
	// // .then((result) => { if(JSON.stringify(result.dimensions).length > mincontentlength)  {
		// // fs.writeFile(path_raw + '/' + 'dimensions' + '/' + result.properties.qTitle + '_' + result.properties.stream.id  + '.txt', JSON.stringify(result.dimensions), function(err) { console.log(err + ' Error dimensions for app ' + AppId)});
		// // } else {
		// // console.log('Only ' + JSON.stringify(result.dimensions).length + ' characters for dimensions');
		// // }
	// // })

	// // AppSession.open()
	// // .then(global => global.openDoc(AppId))
	// // .then(app => serializeapp(app))
	// // .then((result) => { if(JSON.stringify(result.embeddedmedia).length > mincontentlength)  {
		// // fs.writeFile(path_raw + '/' + 'embeddedmedia' + '/' + result.properties.qTitle + '_' + result.properties.stream.id  + '.txt', JSON.stringify(result.embeddedmedia), function(err) { console.log(err + ' Error embeddedmedia for app ' + AppId)});
		// // } else {
		// // console.log('Only ' + JSON.stringify(result.embeddedmedia).length + ' characters for embeddedmedia');
		// // }
	// // })
	
	// // AppSession.open()
	// // .then(global => global.openDoc(AppId))
	// // .then(app => serializeapp(app))
	// // .then((result) => { if(JSON.stringify(result.fields).length > mincontentlength)  {
		// // fs.writeFile(path_raw + '/' + 'fields' + '/' + result.properties.qTitle + '_' + result.properties.stream.id  + '.txt', JSON.stringify(result.fields), function(error) { console.log(error + ' Error fields for app ' + AppId)});
		// // } else {
		// // console.log('Only ' + JSON.stringify(result.fields).length + ' characters for fields');
		// // }
	// // })
	
	// // AppSession.open()
	// // .then(global => global.openDoc(AppId))
	// // .then(app => serializeapp(app))
	// // .then(result => { if(JSON.stringify(result.loadScript).length > mincontentlength)  {
		// // fs.writeFile(path_raw + '/' + 'loadScript' + '/' + result.properties.qTitle + '_' + result.properties.stream.id  + '.txt', result.loadScript, function(err) { console.log(err + ' Error loadScript for app ' + AppId)});
		// // } else {
		
		// // console.log('Only ' + JSON.stringify(result.loadScript).length + ' characters for loadScript');
		// // }
	// // })

	// // AppSession.open()
	// // .then(global => global.openDoc(AppId))
	// // .then(app => serializeapp(app))
	// // .then((result) => { if(JSON.stringify(result.masterobjects).length > mincontentlength)  {
		// // fs.writeFile(path_raw + '/' + 'masterobjects' + '/' + result.properties.qTitle + '_' + result.properties.stream.id  + '.txt', JSON.stringify(result.masterobjects), function(err) { console.log(err + ' Error masterobjects for app ' + AppId)});
		// // } else {
		// // console.log('Only ' + JSON.stringify(result.masterobjects).length + ' characters for masterobjects');
		// // }
	// // })

	// // AppSession.open()
	// // .then(global => global.openDoc(AppId))
	// // .then(app => serializeapp(app))
	// // .then((result) => { if(JSON.stringify(result.measures).length > mincontentlength)  {
		// // fs.writeFile(path_raw + '/' + 'measures' + '/' + result.properties.qTitle + '_' + result.properties.stream.id  + '.txt', JSON.stringify(result.measures), function(err) { console.log(err + ' Error measures for app ' + AppId)});
		// // } else {
		// // console.log('Only ' + JSON.stringify(result.measures).length + ' characters for measures');
		// // }
	// // })

	
	

	// // AppSession.open()
	// // .then(global => global.openDoc(AppId))
	// // .then(app => serializeapp(app))
	// // .then(result => {
		// // if(JSON.stringify(result.properties).length > mincontentlength && JSON.stringify(result.properties.stream.id).length > 0)  {
		// // //true
			// // fs.writeFile(path_raw + '/' + 'properties' + '/' + result.properties.qTitle + '_' + result.properties.stream.id  + '.txt', JSON.stringify(result.properties), function(err) { 
				// // if(err) {
					// // console.log(err + ' Error properties for app ' + AppId);
				// // } else {
					// // console.log('File written');
				// // }
			// // }); 
			// // else {
	// // //false
			// // fs.writeFile(path_raw + '/' + 'properties' + '/' + result.properties.qTitle + '_unpublished' + '.txt', JSON.stringify(result.properties), function(err) { 
				// // if(err) {
					// // console.log(err + ' Error properties for app ' + AppId);
				// // } else {
					// // console.log('File written');
				// // }
			// // })
		// // }
	// // }) 

	
	
	
	// // AppSession.open()
	// // .then(global => global.openDoc(AppId))
	// // .then(app => serializeapp(app))
	// // .then((result) => { if(JSON.stringify(result.properties).length > mincontentlength)  {
		// // fs.writeFile(path_raw + '/' + 'properties' + '/' + result.properties.qTitle + '_' + result.properties.stream.id  + '.txt', JSON.stringify(result.properties), function(err) { console.log(err + ' Error properties for app ' + AppName)});
		// // } else {
		// // console.log('Only ' + JSON.stringify(result.properties).length + ' characters for properties');
		// // }
	// // })
	
	
	// // AppSession.open()
	// // .then(global => global.openDoc(AppId))
	// // .then(app => serializeapp(app))
	// // .then((result) => { if(JSON.stringify(result.sheets).length > mincontentlength)  {
		// // fs.writeFile(path_raw + '/' + 'sheets' + '/' + result.properties.qTitle + '_' + result.properties.stream.id  + '.txt', JSON.stringify(result.sheets), function(err) { console.log(err + ' Error sheets for app ' + AppId)});
		// // } else {
		// // console.log('Only ' + JSON.stringify(result.sheets).length + ' characters for sheets');
		// // }
	// // })

	// // AppSession.open()
	// // .then(global => global.openDoc(AppId))
	// // .then(app => serializeapp(app))
	// // .then((result) => { if(JSON.stringify(result.snapshots).length > mincontentlength)  {
		// // fs.writeFile(path_raw + '/' + 'snapshots' + '/' + result.properties.qTitle + '_' + result.properties.stream.id  + '.txt', JSON.stringify(result.snapshots), function(err) { console.log(err + ' Error snapshots for app ' + AppId)});
		// // } else {
		// // console.log('Only ' + JSON.stringify(result.snapshots).length + ' characters for snapshots');
		// // }
	// // })

	// // AppSession.open()
	// // .then(global => global.openDoc(AppId))
	// // .then(app => serializeapp(app))
	// // .then((result) => { if(JSON.stringify(result.stories).length > mincontentlength)  {
		// // fs.writeFile(path_raw + '/' + 'stories' + '/' + result.properties.qTitle + '_' + result.properties.stream.id  + '.txt', JSON.stringify(result.stories), function(err) { console.log(err + ' Error stories for app ' + AppId)});
		// // } else {
		// // console.log('Only ' + JSON.stringify(result.stories).length + ' characters for stories');
		// // }
	// // })

	// // AppSession.open()
	// // .then(global => global.openDoc(AppId))
	// // .then(app => serializeapp(app))
	// // .then((result) => { if(JSON.stringify(result.variables).length > mincontentlength)  {
		// // fs.writeFile(path_raw + '/' + 'variables' + '/' + result.properties.qTitle + '_' + result.properties.stream.id  + '.txt', JSON.stringify(result.variables), function(err) { console.log(err + ' Error variables for app ' + AppId)});
		// // AppSession.close();
		// // } else {
		// // console.log('Only ' + JSON.stringify(result.variables).length + ' characters for variables');
		// // AppSession.close();
		// // }
	// // })

// //////////////////////////////////////
// //End Functions
// //////////////////////////////////////

// //    session.open().then((global) => {
// //     console.log('session was opened successfully');
// //     return global.getDocList().then((list) => {
// //      const apps = list.map(app => `${app.qDocId} (${app.qTitle || 'no title'})`).join(', ');
// //      console.log(`apps on this engine that the configured user can open: ${apps}`);
// //       session.close();
// //      });
// //     }).catch((error) => {
// //      console.log('failed to open session and/or retrieve the app list:', error);
// //      process.exit(1);
// //     });

