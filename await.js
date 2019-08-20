const enigma = require('enigma.js');
const WebSocket = require('ws');
const serializeapp = require('serializeapp');
const schema = require('enigma.js/schemas/12.20.0.json');
//var deleteFiles = require('./deleteFiles');

var fs = require('fs');
var path = "./DiffApps/Raw/";
var PromisePool = require('es6-promise-pool')
//var NumberOfApps = 0;

const session = enigma.create({
	schema,
	url: 'ws://localhost:9076/app/engineData',
	createSocket: url => new WebSocket(url)
});



///////////////////////////////////////////////////////////////////////////////

var getdata = function (AppName, time) {
	return new Promise(function (resolve, reject) {
		console.log('Resolving ' + AppName + ' in ' + time + ' ms')
		const AppSession = enigma.create({
			schema,
			url: 'ws://localhost:9076/app/engineData/' + encodeURIComponent([AppName]),
			createSocket: url => new WebSocket(url)
		});
		var DotIsAt = AppName.length -4; //Get the position of the first dot 
		var FileName = AppName.substring(0, DotIsAt); //removes the .qvf part from the appname.
		AppSession.open()
		.then((global) => global.openDoc(AppName)) 
		.then((app) => serializeapp(app))
		.then((result) => fs.writeFile(path + '/loadScript/' + FileName + '.txt', result.loadScript, function(err) { console.log(err)}))
	
		.then((close) => AppSession.close())

		setTimeout(function () {
			console.log('Resolving: ' + AppName)
			resolve(AppName)
		}, time)
	})
}


function GetAppNames() {
	var AppNames = new Array();
	session.open()
	.then(function(global) {
		global.getDocList().then(function(docList) {
			session.close();

			for (i = 0; i < docList.length; i++) {
				var App = docList[i].qDocId;
				//var DotIsAt = App.indexOf('.');
				//var AppName = App.substring(0, DotIsAt);				
				getdata(App, 1000);
			//	AppNames.indexOf(App) === -1 ? AppNames.push(App) : console.log("Item exists");	
			}
			//console.log(AppNames);
		//	callback(null, AppNames); 
		}, function(err) { console.log('5')});
	}, function(err) { console.log('It seems Sense is not responding')});
}


GetAppNames();

// var count = 0;
// var promiseProducer = function () {
	// if (count < 7) {	
		// count++
		// var AppName =  docList[count].qDocName;	
		// console.log(AppName);
		// return getdata(AppName, 1000)
	// } else {
		// return null
	// }
// }


 
// var pool = new PromisePool(promiseProducer, 1)

// //var NumberOfApps = 

// //console.log(NumberOfApps + 'Arne');
// pool.start()
  // .then(function () {
    // console.log('Complete')
// })