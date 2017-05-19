'use strict';

angular.module('ngAdmin')
    .controller('RegionsEditCtrl', function ($scope, $stateParams, $timeout, RegionService, S, regionId, currentLocale) {
    window.scope = $scope;

    $scope.regionId = regionId;
    $scope.currentLocale = currentLocale;
    $scope.loading = true;

    $scope.submitForm = function() {
        $("#form").alpaca('get').form.submit();
    }    

    $scope.dismiss = function() {
        
        try {
            $("#form").alpaca('destroy');
        } catch(err) {
        }
        
        $scope.$dismiss();
    };

    $scope.onSubmit = function(val) {
        $scope.saving = true;
console.log(val);
        $scope.region.customPOST({form:val, regionId:$scope.regionId, locale:$scope.currentLocale}).then(function(response) {
            $scope.saving = false;
            var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
            $scope.$close();
        }, function(response) {
            $scope.saving = false;
            var errors = response.data.errors;
            console.log(errors);

            angular.forEach(response.data.errors, function(errors, field) {
                console.log('field', field, angular.isUndefined($scope.form[field]));
                if(!angular.isUndefined($scope.form[field])) {
                    $scope.form[field].$setValidity('server', false);
                    return $scope.errors[field] = errors.join(', ');
                }
            });

            console.log("There was an error saving", response);
        });
    }

    $scope.setupForm = function() {
        console.log('############# setupForm');
        
        var form_options = {};
        form_options['form'] = {
            "attributes":{
                "action":"http://www.httpbin.org/post",
                "method":"post",
                "enctype":"multipart/form-data"
            },
            "buttons":{}
        };
        jQuery.extend(form_options, $scope.region.meta.options);
        console.log(form_options);
        
        console.log($scope.region.meta.optionsSource);
        $timeout(function() {
            $("#form").alpaca({
                "data": $scope.region.meta.data,
                "options": form_options,
                "schema": $scope.region.meta.schema,
                "postRender": function(renderedField) {
                    var form = renderedField.form;
                    if (form) {
                        form.registerSubmitHandler(function(e, form) {
                            form.validate(true);
                            form.refreshValidationState(true);
                            if (form.isFormValid()) {
                                var val = form.getValue();
                                $scope.onSubmit(val);
                            } else {
                                alert("Invalid value: " + JSON.stringify(val, null, "  "));
                            }
                            e.stopPropagation();
                            return false;
                        });
                    }
                }
            });
        }, 500);


    };

    $scope.init = function() {
        console.log('############# INIT');
        RegionService.one($scope.regionId).one($scope.currentLocale).get().then(function(data) {
            $scope.region = data;
            
            $scope.loading = false;
            $scope.setupForm();
        });



    };

    $scope.init();

});        

