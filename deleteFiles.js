var fs = require('fs');

module.exports = {
  deleteFiles: function (path) {
	fs.readdir(path, function (err, files) {
		if (err) {
			throw err;
		}
		for (i = 0; i < files.length; i++) {
			var file = files[i];
			var file2 = file.replace(/"/g,"");
			var re = /[.]/g; //regexp for finding the first dot
				
			if(re.test(file2)) //only call the function when it includes a dot (ie. is a file instead of a folder)
			{
				fs.unlinkSync(path + files[i]);
			}
		}
	});
  }
};



