var productKey = 'alko_products';
var timeKey = 'alko_timestamp';

var Alko = {
	
	init : function() {

		if (this.dataValid() !== true) {
			this.updateLocalStorage(function(data) {
				this.fillTable(data);
			});
		} else {
			this.fillTable(JSON.parse(localStorage.getItem(productKey)));
		}

	},

	getProducts : function() {

		var valid = this.dataValid();

		if (valid === true) {
			return JSON.parse(localStorage.getItem(productKey));
		} else {
			this.updateLocalStorage(function(data) {
				return data;
			});
		}

	},

	updateLocalStorage : function(callback) {

		var timeStamp = new Date().getTime() + (7 * 24 * 60 * 1000);

		$.ajax({
			url: '/tuotteet'
		}).done(function (data) {

			localStorage.setItem(timeKey, JSON.stringify(timeStamp));
			localStorage.setItem(productKey, data);

			if(typeof callback !== "undefined") {
				callback(data);
			}

		});

	},

	dataValid : function() {

		var currentTime = new Date().getTime();
		var timeStamp = JSON.parse(localStorage.getItem(timeKey));

		return currentTime < timeStamp && localStorage.getItem(productKey) !== null;
	},

	fillTable : function(products) {

		var fragment = document.createDocumentFragment();

		for (var i in products) {

			var product = products[i];
			var productRow = document.createElement('tr');
			var productFragment = document.createDocumentFragment();

			var name = document.createElement('td');
			name.innerHTML = product.Nimi;
			productFragment.appendChild(name);

			var type = document.createElement('td');
			type.innerHTML = product.Tyyppi;
			productFragment.appendChild(type);

			var price = document.createElement('td');
			price.innerHTML = product.Hinta;
			productFragment.appendChild(price);

			var alcohol = document.createElement('td');
			alcohol.innerHTML = product.Alkoholi;
			productFragment.appendChild(alcohol);
			
			productRow.appendChild(productFragment);
			fragment.appendChild(productRow);
		}

		document.getElementById('results').appendChild(fragment);

	}

};

$(document).ready(function() {

	Alko.init();


});