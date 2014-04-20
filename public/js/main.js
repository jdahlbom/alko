var productKey = 'alko_products';
var timeKey = 'alko_timestamp';

var Alko = {
	
	init : function() {

		if (this.dataValid() !== true) {
			this.updateLocalStorage();
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

	getProduct : function(numero) {

		var products = JSON.parse(localStorage.getItem(productKey));
		
		for (var i in products) {
			if (products[i].Numero === numero) {
				return products[i];
			}
		}

	},

	updateLocalStorage : function(callback) {

		var self = this;
		var timeStamp = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);

		$.ajax({
			url: '/tuotteet'
		}).done(function (data) {

			localStorage.setItem(timeKey, JSON.stringify(timeStamp));
			localStorage.setItem(productKey, data);

			if(typeof callback !== "undefined") {
				callback(data);
			} else {
				self.fillTable(JSON.parse(data));
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

			productRow.id = product.Numero;
			productRow.className = 'product';
			productRow.setAttribute('data-toggle', 'modal');
			productRow.setAttribute('data-target', '#product-modal');

			var name = document.createElement('td');
			name.innerHTML = product.Nimi;
			productFragment.appendChild(name);

			var type = document.createElement('td');
			type.innerHTML = product.Tyyppi;
			productFragment.appendChild(type);

			var price = document.createElement('td');
			price.innerHTML = product.Hinta + ' €';
			productFragment.appendChild(price);

			var alcohol = document.createElement('td');
			alcohol.innerHTML = product.Alkoholi + ' %';
			productFragment.appendChild(alcohol);
			
			productRow.appendChild(productFragment);
			fragment.appendChild(productRow);
		}

		document.getElementById('results').appendChild(fragment);
		utils.bindEvents();

	}

};

var utils = {

	updateModal : function(product) {

		var $modal = $('#product-modal');

		var alcoholAmount = parseFloat(product.Pullokoko.replace(/,/, '.')) * parseFloat(product.Alkoholi.replace(/,/, '.')) / parseFloat(product.Hinta.replace(/,/, '.'));
		alcoholAmount = Math.round(alcoholAmount * 100) / 100;

		var metrics = product.Pullokoko + ' l || ' + product.Litrahinta + ' €/l || ' + alcoholAmount + ' alc-cl/€';
		var area = product.Valmistusmaa + ', ' + product.Alue;

		$modal.find('.number').text(product.Numero);
		$modal.find('#product-title').text(product.Nimi);
		$modal.find('.alcohol').text(product.Alkoholi);
		$modal.find('.alcoholpere').text('jooh');
		$modal.find('.package').text(product.Pakkaustyyppi);
		$modal.find('.packagesize').text(product.Pullokoko);
		$modal.find('.cork').text(product.Suljentatyyppi);
		$modal.find('#product-image').attr('src', this.productImageUrl(product.Numero));
		$modal.find('#product-description').text(product.Luonnehdinta);
		$modal.find('.product-price').text(product.Hinta + ' €');
		$modal.find('.product-metrics').text(metrics);
		$modal.find('.product-type').text(product.Tyyppi);
		$modal.find('.product-area').text(area);

	},

	productImageUrl : function(id) {
		return "http://cdn.alko.fi/ProductImages/Scaled/{id}/product.jpg".replace(/{id}/, id);
	},

	bindEvents : function() {

		var $productRows = $('.product');

		$productRows.unbind();
		$productRows.on('click', function() {
			var id = $(this).attr('id');
			utils.updateModal(Alko.getProduct(id));

			ga('send', {
			  'hitType': 'click',          // Required.
			  'eventCategory': 'Products',   // Required.
			  'eventAction': 'product',      // Required.
			  'eventLabel': id,
			  'eventValue': id
			});
		});

		$('#search').on('keyup', function() {

			var searchStr = this.value.toLowerCase();

			if (searchStr.length < 3) {
				$productRows.show();
			} else {
				$.each($productRows, function(index, elem) {
					var $elem = $(elem);
					var content = $elem.text().toLowerCase();
					content.indexOf(searchStr) === -1 ? $elem.hide() : $elem.show();
				});
			}

		});
	}

};

$(document).ready(function() {

	Alko.init();
	utils.bindEvents();

	$(window).on('error', function(event) {
		ga('send', {
		  'hitType': 'event',          // Required.
		  'eventCategory': 'JS Error',   // Required.
		  'eventAction': 'error',      // Required.
		  'eventLabel': 'JS error',
		  'eventValue': event.message + '. On: ' + event.filename + ': ' + event.lineno
		});
	});
});