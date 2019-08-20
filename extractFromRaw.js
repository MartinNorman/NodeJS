var fs = require("fs");
var path = require("path");
var pathRead = "./DiffApps/Raw/raw/";
var pathWrite = "./DiffApps/Raw/";
var deleteFiles = require('./deleteFiles');

var Types = ['bookmarks','dataconnections','dimensions','embeddedmedia','fields','masterobjects','measures','properties','sheets','snapshots','stories','variables'];
Types.forEach(function(element) {
		console.log('Deleting files in ' + element);
		deleteFiles.deleteFiles(pathWrite + '/' + element + '/');
});



function getfiledata(file) {
	

	fs.readFile(pathRead + file, 'utf8', function(err, data) {
		if (err) {
			return console.log(err);
		}
		var DotIsAt = file.length -4; //Get the position of the first dot 
		var AppName = file.substring(0, DotIsAt); //removes the .txt part from the filename.
		object = JSON.parse(data);
		
		var Types = ['bookmarks','dataconnections','dimensions','embeddedmedia','fields','loadScript','masterobjects','measures','properties','sheets','snapshots','stories','variables'];
		Types.forEach(function(element) {
			console.log('Extracting ' + element + ' from raw');
			fs.writeFile(pathWrite + '/' + element + '/' + element + '.' + AppName + '.txt', JSON.stringify(object[element]), function(err) { 
					console.log(err);
				});
		});

	});

}


fs.readdir(pathRead, function (err, files) {
	if (err) {
		throw err;
	}
	for (j = 0; j < files.length; j++) {
		var file = files[j];
		var file2 = file.replace(/"/g,"");
		var re = /[.]/g; //regexp for finding the first dot
				
		if(re.test(file2)) //only call the function when it includes a dot (ie. is a file instead of a folder)
		{
			console.log('Calling getfiledata: ' + file2);
			getfiledata(file2);
		}
	}
});
