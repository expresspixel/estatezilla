'use strict';

angular.module('ngAdmin')
  .controller('SettingsPaymentsCtrl', function ($scope, PaymentMethodsService) {
	
    $scope.selectedPaymentMethod = [];
    $scope.paymentMethods = [];
	//$scope.paymentMethods.push({"id":1,'status' :0, 'title': 'Loading...', 'handle': 'loading',"nodes":[]});
    $scope.treeOptions = {
        dragStart: function(event) {
            console.log('Start dragging', event);
        },
        dragStop: function(event) {
            console.log('Stop dragging', event);
        },
        dropped: function(event) {
            console.log(event);
            $scope.saveOrder();
        }
    };
    
	$scope.savePaymentMethod = function(paymentMethod) {
        console.log('savePaymentMethod', paymentMethod);
        paymentMethod.saving = true;
        paymentMethod.save().then(function(response) {
            paymentMethod.saving = false;
            console.log("Object saved OK", response);
            var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
        }, function(response) {
            paymentMethod.saving = false;
            var n = noty({text: 'Not saved, please try again', type:'warning', timeout: 2000});
            var errors = response.data.errors;
            console.log(errors);
        });
        
    };
    
    $scope.saveOrder = function() {
        var n = noty({text: 'Saving...', type:'warning', timeout: 2000});
        
        //now save it
        $scope.paymentList.customPOST({'payments': $scope.paymentMethods}, "save-order").then(function(response) {
            var n = noty({text: 'Saved...', type:'warning', timeout: 2000});
        }, function(response) {
           var n = noty({text: 'There was an error saving', type:'warning', timeout: 2000});
            console.log("There was an error saving");       
        });
        
    };
    
    
	$scope.init = function() {
        $scope.showLoader();
        PaymentMethodsService.getList().then(function(data) {
            $scope.paymentList = data;
            $scope.paymentMethods = [];
            _.each(data, function(value) {
                value.nodes = [];
                value.saving = false;
                $scope.paymentMethods.push(value);
            });
            $scope.hideLoader();
            //$scope.paymentMethods = data;
            //console.log(data);
        }); 
    };
	$scope.init();

});
