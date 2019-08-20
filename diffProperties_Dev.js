var jsdiff = require('diff');
var path = require('path');
var fs = require('fs');
var deleteFiles = require('./deleteFiles');


var FileTypes = ['bookmarks','dataconnections','dimensions','embeddedmedia','fields','masterobjects','measures','properties','sheets','snapshots','stories'];
FileTypes.forEach(function(element){
	var pathRead = './DiffApps/Raw/' + element + '/';
	var pathWriteResultMatch = './DiffApps/Results/' + element + '/match/';
	var pathWriteResultNoMatch = './DiffApps/Results/' + element + '/nomatch/';
	
	deleteFiles.deleteFiles(pathWriteResultMatch);
	deleteFiles.deleteFiles(pathWriteResultNoMatch);

	fs.readdir(pathRead, function (err, files) {
		if (err) {
			throw err;
		}
		
		var appnames = new Array();

		for (i = 0; i < files.length; i++) {
			var dotisat = files[i].indexOf('.');
			var appname = files[i].substring(0, dotisat);
			appnames.indexOf(appname) === -1 ? appnames.push(appname) : console.log("Item exists for " + appnames );		
		}

		for (i = 0; i < appnames.length; i++) {
			
			var originalexists = fs.existsSync(pathRead + appnames[i] + '.Original.txt');
			var contenderexists = fs.existsSync(pathRead + appnames[i] + '.Contender.txt');
	//both files found			
			if(originalexists == true && contenderexists == true) {
				console.log("Both files found for " + element);
				fs.writeFile(pathWriteResultMatch + appnames[i] +  '.txt', '', function(err) { 
					console.log(err);
				});
				
				var original = JSON.parse(fs.readFileSync(pathRead + appnames[i] + '.Original.txt', 'utf8'));
				var contender = JSON.parse(fs.readFileSync(pathRead + appnames[i] + '.Contender.txt', 'utf8'));
				//var diff = jsdiff.diffArrays(original, contender);
				var diff = jsdiff.diffJson(original, contender);
				diff.forEach(function(part){
					var status = part.added ? 'Add@' : part.removed ? 'Rem@' : '===@';
					fs.appendFile(pathWriteResultMatch + appnames[i] + '.txt', [status]+ part.count + '|'  + part.value + '\r\n', function(err) {
						console.log(err);
					});
				});
			} else {
	//one of the files are not found
					
				if (originalexists == true) {
					fs.copyFile(pathRead + appnames[i] + '.Original.txt', pathWriteResultNoMatch + appnames[i] + '.Original.txt', (err) => {
					if (err) throw err;
					});

				} else {

					fs.copyFile(pathRead + appnames[i] + '.Contender.txt', pathWriteResultNoMatch + appnames[i] + '.Contender.txt', (err) => {
					if (err) throw err;
					});

				} 

			}	
		
		}
	});
});	

