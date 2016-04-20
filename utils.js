var csv = require('fast-csv');
var http = require('http');
var fs = require('fs');
var html = require('htmlparser2');

var getCatalogFile = function(callback) {
	var alkoCatalogPage = "http://www.alko.fi/tuotteet/tallennahinnasto/";
	var txtFileName = 'tmp/alko.txt';
	var txtFile = fs.createWriteStream(txtFileName);

	var baseUrl="http://www.alko.fi";
	var catalogUrl = "";

	var processTag = function(name, attribs) {
		if (name=="a" && attribs.href && attribs.href.includes("alkon-hinnasto-tekstitiedostona.txt")) {
			catalogUrl = baseUrl + attribs.href;
		}
	};
	var parser = new html.Parser({
		onopentag: processTag
	});

	http.get(alkoCatalogPage, function(catalogRes) {
		catalogRes.pipe(parser);
		catalogRes.on('end', function() {
			console.log("Fetching: "+ catalogUrl);
			http.get(catalogUrl, function(res) {
				res.pipe(txtFile);
				res.on('end', function() {
					txtFile.end();
					callback(null, txtFileName);
				})
			})
		});
	});
}

var getProducts = function(callback) {
	var cleanData = function(dataFile, inCallback) {
		var products = [];
		var input = fs.createReadStream(dataFile);
		var rowsToSkip = 3;
		var skippedRows = 0;

		var headers = ["Numero","Nimi","Valmistaja","Pullokoko","Hinta","Litrahinta","Uutuus","Hinnastojärjestyskoodi",
			"Tyyppi","Erityisryhmä","Oluttyyppi","Valmistusmaa","Alue","Vuosikerta","Etikettimerkintöjä","Huomautus",
			"Rypäleet","Luonnehdinta","Pakkaustyyppi","Suljentatyyppi","Alkoholi-%","Hapot g/l","Sokeri g/l",
			"Kantavierrep-%","Väri EBC","Katkerot EBU","Energia kcal/100 ml","Valikoima"];
		var csvstream = csv({delimiter:"\t",headers:headers})
		.on('data', function(data){
			if (skippedRows < rowsToSkip) {
				skippedRows++;
			} else {
				products.push(data);
			}
		})
		.on('end', function(){
			console.log("Done reading catalog.");
			inCallback(null, products);
		});
		input.pipe(csvstream);
	};

	console.log("Getting products..");
	getCatalogFile(function(err, dataFile) {
		cleanData(dataFile, callback);
	});
};

exports.getProducts = getProducts;
