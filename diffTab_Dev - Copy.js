var jsdiff = require('diff');
var fs = require("fs"), path = require("path");
var deleteFiles = require('./deleteFiles');
var pathReadTabOrder = "./DiffApps/Raw/loadScript/LoadScriptTabOrder/";
var pathReadNoTabOrder = "./DiffApps/Raw/loadScript/LoadScriptNoTabOrder/";
var pathWriteResultFullMatchFound = "./DiffApps/Results/loadScript/match/";
var pathWriteResultPartMatchFound = "./DiffApps/Results/loadScript/partmatch/";
var pathWriteResultNoMatchFound = "./DiffApps/Results/loadScript/nomatch/";

deleteFiles.deleteFiles(pathWriteResultFullMatchFound);
deleteFiles.deleteFiles(pathWriteResultPartMatchFound);
deleteFiles.deleteFiles(pathWriteResultNoMatchFound);



//module.exports = {
//	diffTab: function () {
		fs.readdir(pathReadTabOrder, function (err, files) {
			if (err) {
				throw err;
			}

			var AppNames = new Array();
			var TabNames = new Array();
			var AppTabNames = new Array();

			for (i = 0; i < files.length; i++) {
				var DotIsAt = files[i].indexOf('.');
				var AppName = files[i].substring(0, DotIsAt);
				AppNames.indexOf(AppName) === -1 ? AppNames.push(AppName) : console.log("Item exists");		
			}
			
			for (j = 0; j < AppNames.length; j++) {
				TabNames.push(AppNames[j]);	
				for (k = 0; k < files.length; k++) {
					var FirstDotIsAt = files[k].indexOf('.');
					var ThisApp = files[k].substring(0, FirstDotIsAt);
					if (ThisApp == AppNames[j]) { 
						var ExclamationmarkIsAt = files[k].indexOf('!');
						var LastDotIsAt = files[k].lastIndexOf('.');
						var TabName = files[k].substring(ExclamationmarkIsAt +1, LastDotIsAt);
					TabNames.indexOf(TabName) === -1 ? TabNames.push(TabName) : console.log("Item exists");
					}
				}
				AppTabNames.push(TabNames);
				TabNames = [];
			}

			for (i = 0; i < AppTabNames.length; i++) {
				for (j = 1; j < AppTabNames[i].length; j++) {
				
					var originalExists = fs.existsSync(pathReadTabOrder + AppTabNames[i][0] + '.Prod!' + AppTabNames[i][j] + '.txt');
					var contenderExists = fs.existsSync(pathReadTabOrder + AppTabNames[i][0] + '.Stage!' + AppTabNames[i][j] + '.txt');
					var UnderscoreIsAt = AppTabNames[i][j].indexOf('_');
					var TabNameWithoutTabNumber = AppTabNames[i][j].substring(UnderscoreIsAt +1);
					var original2Exists = fs.existsSync(pathReadNoTabOrder + AppTabNames[i][0] + '.Prod!' + TabNameWithoutTabNumber + '.txt');
					var contender2Exists = fs.existsSync(pathReadNoTabOrder + AppTabNames[i][0] + '.Stage!' + TabNameWithoutTabNumber + '.txt');
					
					if(originalExists == true && contenderExists == true) {
//Both files found with same TabNr
						var original = fs.readFileSync(pathReadTabOrder + AppTabNames[i][0] + '.Prod!' + AppTabNames[i][j] + '.txt', 'utf8');
						var contender = fs.readFileSync(pathReadTabOrder + AppTabNames[i][0] + '.Stage!' + AppTabNames[i][j] + '.txt', 'utf8');
						var diff = jsdiff.diffTrimmedLines(original, contender);

						fs.writeFile(pathWriteResultFullMatchFound + AppTabNames[i][0] + '!' +  TabNameWithoutTabNumber + '.txt', '', function(err) {
							console.log(err);
						});
						
						diff.forEach(function(part){
							var status = part.added ? 'Add@' : part.removed ? 'Rem@' : '===@';
							fs.appendFileSync(pathWriteResultFullMatchFound + AppTabNames[i][0] + '!' +  TabNameWithoutTabNumber + '.txt', [status]+ part.count + '|'  + part.value, function(err) {
								console.log(err);
							});

						});

					} else if (original2Exists == true && contender2Exists == true) {
//If no file found store in separate array for second try without tab number in case order of tab has changed. 				
						var original2 = fs.readFileSync(pathReadNoTabOrder + AppTabNames[i][0] + '.Prod!' + TabNameWithoutTabNumber + '.txt', 'utf8');
						var contender2 = fs.readFileSync(pathReadNoTabOrder + AppTabNames[i][0] + '.Stage!' + TabNameWithoutTabNumber + '.txt', 'utf8');
						var diff2 = jsdiff.diffTrimmedLines(original2, contender2);

						fs.writeFile(pathWriteResultPartMatchFound + AppTabNames[i][0] + '!' +  TabNameWithoutTabNumber + '.txt', '', function(err) {
							console.log(err);
						});

						
						diff2.forEach(function(part){
							var status = part.added ? 'Add@' : part.removed ? 'Rem@' : '===@';
							fs.appendFileSync(pathWriteResultPartMatchFound + AppTabNames[i][0] + '!' +  TabNameWithoutTabNumber + '.txt', [status]+ part.count + '|'  + part.value, function(err) {
								console.log(err);
							});
						});
					} else {
//One of the files are not found
						
						if (originalExists == true) {
							fs.copyFile(pathReadTabOrder + AppTabNames[i][0] + '.Prod!' + AppTabNames[i][j] + '.txt', pathWriteResultNoMatchFound + AppTabNames[i][0] + '.Prod!' + AppTabNames[i][j] + '.txt', (err) => {
								if (err) throw err;
							});

						} else {

							fs.copyFile(pathReadTabOrder + AppTabNames[i][0] + '.Stage!' + AppTabNames[i][j] + '.txt', pathWriteResultNoMatchFound + AppTabNames[i][0] + '.Stage!' + AppTabNames[i][j] + '.txt', (err) => {
								if (err) throw err;
							});

						} 
					}
					
				}
			}
		});
//	}
//};