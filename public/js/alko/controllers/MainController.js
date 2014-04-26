app.controller('MainController', function($scope, $http, $modal, $q, $filter, ngTableParams) {

	var productKey = 'alko_products';
	var timeKey = 'alko_timestamp';
	var availableTypes = [];


	$scope.init = function() {

		$('.loader').show();
		
		if (dataValid() !== true) {
			updateLocalStorage();
		} else {
			setScopeItems();
		}

	};

	$scope.openModal = function(product) {

		product.img = "http://cdn.alko.fi/ProductImages/Scaled/" + product.Numero + "/product.jpg"

		var modalInstance = $modal.open({
			templateUrl: 'js/alko/templates/modal.html',
			controller: ModalInstanceController,
			resolve: {
				product: function() {
					return product;
				}
			}
		});
	};

	$scope.getAvailableTypes = function() {
		var def = $q.defer();
		var arr = [];
		angular.forEach(availableTypes, function(type, index) {
			arr.push({
				'id': type,
				'title': type
			});
		});
		def.resolve(arr);
		return def;
	};

  	var setScopeItems = function() {

		var productArray = JSON.parse(localStorage.getItem(productKey));

		angular.forEach(productArray, function(p, i) {
			if (availableTypes.indexOf(p.Tyyppi) === -1) {
				availableTypes.push(p.Tyyppi);
			}
		});

		$scope.tableParams = new ngTableParams({
	  		page: 1,
	  		count: 50,
	  		sorting: {
	  			Tyyppi: 'asc'
	  		}
	  	}, {
	  		counts: [],
	  		getData: function($defer, params) {
	  			
	  			// filter
	  			var orderedData = params.filter() ? $filter('filter')(productArray, params.filter()) : productArray;

	  			// sorting	
	  			orderedData = params.sorting() ? $filter('orderBy')(orderedData, params.orderBy()) : orderedData;

	  			params.total(orderedData.length);
	  			$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
	  		}
	  	});

	  	$('.loader').hide();
  	};

	var updateLocalStorage = function() {

		var timeStamp = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);

		$http.get('/tuotteet').success(function(data) {

			localStorage.setItem(timeKey, JSON.stringify(timeStamp));
			localStorage.setItem(productKey, JSON.stringify(data));
			
			setScopeItems();

		}).error(function(err) {
			$('.loader').hide();
			console.log(err);
		});

	};

	var dataValid = function() {

		var currentTime = new Date().getTime();
		var timeStamp = JSON.parse(localStorage.getItem(timeKey));

		return currentTime < timeStamp && localStorage.getItem(productKey) !== null;
	};

});

var ModalInstanceController = function($scope, $modalInstance, product) {

	$scope.product = product;

	$scope.close = function() {
		$modalInstance.dismiss('cancel');
	};

};