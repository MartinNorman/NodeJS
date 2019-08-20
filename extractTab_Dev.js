var fs = require("fs");
var path = require("path");
var pathRead = "./DiffApps/Raw/loadScript/";
var deleteFiles = require('./deleteFiles');
var pathWriteTabOrder = "./DiffApps/Raw/loadScript/LoadScriptTabOrder/";
var pathWriteNoTabOrder = "./DiffApps/Raw/loadScript/LoadScriptNoTabOrder/";

deleteFiles.deleteFiles(pathWriteTabOrder);
deleteFiles.deleteFiles(pathWriteNoTabOrder);

function getfiledata(file) {
	fs.readFile(pathRead + file, 'utf8', function(err, data) {
		if (err) {
			return console.log(err);
		}
		var DotIsAt = file.length -4; //Get the position of the first dot 
		var AppName = file.substring(0, DotIsAt); //removes the .qvf part from the appname.		
		var Arr = data.split("///$tab ");
		
		for (i = 1; i < Arr.length; i++) {

			var TabNames = Arr[i].split(/[\r\n]+/);		
			var TabName = TabNames[0];
			var re = /[/]/g; //regexp for finding "/"
			if(re.test(TabName))
			{
				console.log("Don't use / or \\ in tabnames -> ");  //+ file + " -> " + TabName
			}
			else
			{	
				console.log('pathWriteTabOrder');
//				fs.writeFile(pathWriteTabOrder + AppName + '!' + [i] + '_' + [TabName] + '.txt', Arr[i], function(err) { 
//					console.log(err);
//				});
//Write the same file but without the tab number so we can try to match that later if we do not get a hit with tab number
	console.log('pathWriteNoTabOrder');
	//			fs.writeFile(pathWriteNoTabOrder + AppName + '!' + [TabName] + '.txt', Arr[i], function(err) { 
	//				console.log(err);
	//			});
			}
		}
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
			console.log('Calling getfiledata: ' ); //+ file2
			getfiledata(file2);
		}
	}
});
