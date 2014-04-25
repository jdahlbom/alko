app.controller('MainController', function($scope, $http, $modal) {

	var productKey = 'alko_products';
	var timeKey = 'alko_timestamp';

	$scope.products = [];
	$scope.filterText = null;
	$scope.typeFilter = null;
	$scope.availableTypes = [];
	$scope.orderByField = null;
  	$scope.reverseSort = false;

	$scope.init = function() {

		if (dataValid() !== true) {
			updateLocalStorage();
		} else {
			$scope.products = JSON.parse(localStorage.getItem(productKey));

			angular.forEach($scope.products, function(p, i) {
				if ($scope.availableTypes.indexOf(p.Tyyppi) === -1) {
					$scope.availableTypes.push(p.Tyyppi);
				}
			});
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

	var updateLocalStorage = function() {

		var timeStamp = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);

		$http.get('/tuotteet').success(function(data) {

			localStorage.setItem(timeKey, JSON.stringify(timeStamp));
			localStorage.setItem(productKey, JSON.stringify(data));
			
			angular.forEach(data, function(product, index) {
				
				if ($scope.availableTypes.indexOf(product.Tyyppi) === -1) {
					$scope.availableTypes.push(product.Tyyppi);
				}

				$scope.products.push(product);
			});

		}).error(function(err) {
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


app.filter('isType', function() {

	return function(input, type) {
		if( typeof type == 'undefined' || type == null || type == '') {
			return input;
		} else {
			var out = [];
			for (var i in input) {
				if (input[i].Tyyppi === type) {
					out.push(input[i]);
				}
			}
			return out;
		}
	}

});