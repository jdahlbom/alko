var csv = require('fast-csv');
var http = require('http');
var readline = require('readline');
var stream = require ('stream');
var fs = require('fs');

var filu = fs.createWriteStream('alko.txt');

var req = http.get('http://www.alko.fi/PageFiles/5634/fi/Alkon%20hinnasto%20tekstitiedostona.txt', function(res) {
	res.pipe(filu);
	res.on('end', function() {

		var index = 0;
		
		var alkostream = fs.createReadStream('alko.txt');
		var str = new stream;
		var rl = readline.createInterface(alkostream, str);

		var alkocsv = fs.createWriteStream('alko.csv');

		rl.on('line', function(line) {
			if (index > 2) {
				alkocsv.write(line + '\n');
			}
			index++
		});

		rl.on('close', function() {

			alkocsv.close();
			var jooh = fs.createReadStream('alko.csv');

			csv.fromStream(jooh, {
				headers : true, 
				delimiter : '\t'
			}).on('record', function(data) {
				console.log(data);
			}).on('end', function() {
				console.log('Done.');
			});

		});
	});
});

