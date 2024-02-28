angular.module('myApp', [])
    .controller('myController', function ($scope, $http) {
        $scope.currentStep = 0;

        // Fetch JSON data from file
        $http.get('formData.json')
            .then(function (response) {
                $scope.formData = response.data;
            })
            .catch(function (error) {
                console.error('Error fetching formData:', error);
            });

        $scope.setCurrentStep = function (index) {
            $scope.currentStep = index;
        };
    });
