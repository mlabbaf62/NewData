angular.module('myApp', [])
    .controller('MainController', function ($scope, $http) {
        $scope.loadData = function () {
            $http.get('GridData.json')
                .then(function (response) {
                    $scope.headers = Object.keys(response.data[0]);
                    $scope.rows = response.data;
                });
        };

        $scope.addRow = function () {
            $scope.rows.push({ editing:true}); // Add an empty object
        };

        $scope.deleteRow = function (index) {
            $scope.rows.splice(index, 1); // Remove row at index
        };

        $scope.editCell = function (row) {
            row.editing = true;
        };

        $scope.updateCell = function (row, header) {
            row.editing = false;
            console.log('Updated value:', row[header]);
        };

        $scope.saveData = function () {
            console.log('Data saved:', $scope.rows);
            $scope.tmpResult = JSON.stringify($scope.rows)


            $scope.$apply();
            // Here you can send $scope.rows to the server as JSON data
        };
    });
