var csv = require('fast-csv');
var http = require('http');
var readline = require('readline');
var stream = require ('stream');
var fs = require('fs');

var getProducts = function(callback) {

	var txtFile = fs.createWriteStream('alko.txt');
	var products = [];

	var req = http.get('http://www.alko.fi/PageFiles/5634/fi/Alkon%20hinnasto%20tekstitiedostona.txt', function(res) {
	
		res.pipe(txtFile);
		
		res.on('end', function() {

			txtFile.end();

			txtFile.on('finish', function() {

				var index = 0;
				var input = fs.createReadStream('alko.txt');
				var output = fs.createWriteStream('alko.csv');
				var rl = readline.createInterface(input, output);

				// remove the couple first lines of text as well as quotation marks
				rl.on('line', function(line) {
					if (index > 2) {
						line = line.replace(/"/g, '');
						output.write(line + '\n');
					}
					index++;
				});

				rl.on('close', function() {
					
					output.end();

					output.on('finish', function() {
						csv.fromPath('alko.csv', {
							headers : true, 
							delimiter : '\t'
						}).on('record', function(data) {
							products.push(data);
						}).on('error', function(err) {
							console.log(err);
						}).on('end', function() {
							console.log('Lines: ' + products.length);
							callback(products);
						});
					});
				});
			});
		});
	});
};

exports.getProducts = getProducts;