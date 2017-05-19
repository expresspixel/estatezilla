'use strict';

angular.module('ngAdmin')
  .controller('PropertyListCtrl', function ($scope, PropertyService, PropertyTypeService, SettingsService, $modal, $q, $state) {
    
    window.scopeList = $scope;
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    
    $scope.search = "";
    $scope.sort = {};
    $scope.sort.field = 'created_at';
    $scope.sort.direction = 'desc';
    
    $scope.setCurrentPage('properties');
    $scope.propertyTypes = null;

	$scope.getPropertyTypes = function() {
        var d = $q.defer();
        PropertyTypeService.getList().then(function(response) {
            d.resolve(response);
        }, function(response) {
            d.reject(response);
        });
        return d.promise;
    }
    
    $scope.addNewProperty = function() {

        var modalInstance = $modal.open({
            templateUrl: 'app/properties/property-create.html',
            controller: 'PropertyCreateCtrl',
            size: 'md',
            resolve: {
                propertyTypes: function () {
                  return $scope.propertyTypes;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            console.log("SUCCESS");
            $scope.pageChanged();
        }, function () {
            console.log("CLOSED");
        });

    };
    
    $scope.nextPage = function() {
        $scope.setPage($scope.pageInfo.next_page);
    };
    
    $scope.previousPage = function() {
        $scope.setPage($scope.pageInfo.prev_page);
    };    
    
    $scope.performSearch = function() {
        $scope.pageChanged();
    };

    $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.currentPage);

        // This will query /members and return a promise.
        $scope.showListLoader();        
        var params = {currentLocale: $scope.currentLocale, page: $scope.currentPage, sortField: $scope.sort.field, sortDirection: $scope.sort.direction, search: $scope.search};
        params = $.extend({}, params, $scope.searchParams);
        console.log('params', params);
        PropertyService.getList(params).then(function(properties) {
            
            if($state.current.name != 'app.properties.edit') {
                var property = _.first(properties);
                console.log('app.properties.edit', property);
				if(!_.isUndefined(property)) {
					$state.go("app.properties.edit", {propertyId:property.id});
				} else {
					$state.go("app.properties.edit", {propertyId:0});
				}
            }
            
            $scope.propertiesList = properties;
            
            console.log('propertiesList', $scope.propertiesList);
            
            $scope.pageInfo = properties.meta;
            $scope.pageInfo.next_page = $scope.pageInfo.last_page;
            if($scope.pageInfo.next_page_url) {
                $scope.pageInfo.next_page = URI($scope.pageInfo.next_page_url).query(true).page; 
                console.log('next_page_url', $scope.pageInfo.next_page_url, $scope.pageInfo.next_page);
            }            
            $scope.pageInfo.prev_page = 1;
            if($scope.pageInfo.prev_page_url) {
                console.log('prev_page_url', $scope.pageInfo.prev_page_url);
                $scope.pageInfo.prev_page = URI($scope.pageInfo.prev_page_url).query(true).page; 
            }
            $scope.currentPage = properties.meta.current_page;
            $scope.totalItems = properties.meta.total;
            $scope.hideListLoader();
            //$scope.currentPage = members.total;
        });

    };
    
    $scope.showContent = function() {

        $('.listings-bar').addClass('hidden-xs hidden-sm');
        $('.listings-wrapper').removeClass('hidden-xs hidden-sm');
    };

    $scope.showMenu = function() {

        $('.listings-bar').removeClass('hidden-xs hidden-sm');
        $('.listings-wrapper').addClass('hidden-xs hidden-sm');
    };

    $scope.searchOptions = {};
    $scope.searchParams = {};
    $scope.submitForm = function() {
        console.log($scope.searchParams);
        $scope.performSearch();
    };
    
    $scope.setupSearch = function() {
        
        $scope.searchOptions['min_beds'] = [
            {value:null, name:'No min beds'},
            {value:0, name:'Studio'},
            {value:1, name:'1 bed'},
            {value:2, name:'2 beds'},
            {value:3, name:'3 beds'},
            {value:4, name:'4 beds'},
            {value:5, name:'5 beds'}
        ];
        
        $scope.searchOptions['max_beds'] = [
            {value:null, name:'No max beds'},
            {value:0, name:'Studio'},
            {value:1, name:'1 bed'},
            {value:2, name:'2 beds'},
            {value:3, name:'3 beds'},
            {value:4, name:'4 beds'},
            {value:5, name:'5 beds'}
        ];
                
        $scope.searchOptions['listing_types'] = [
            {value:null, name:'Sale/Rent'},
            {value:'sale', name:'Sale'},
            {value:'rent', name:'Rent'}
        ];
        
    };
    
    $scope.init = function() {
        
        $scope.pageChanged();
        $scope.setupSearch();
        $scope.getPropertyTypes().then(function(response) {
            $scope.propertyTypes = response;
        }, function(response) {
        });
        
    };

    
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
        console.log('$scope.currentPage', $scope.currentPage);
        $scope.pageChanged();
    };
    
    $scope.tableSort = function(field) {

        if($scope.sort.direction == 'desc' && $scope.sort.field == field) {
            $scope.sort.direction = 'asc';
        } else if($scope.sort.direction == 'asc' && $scope.sort.field == field) {
            $scope.sort.direction = 'desc';
        } else {
            $scope.sort.direction = 'desc';
        }

        $scope.sort.field = field;
        $scope.currentPage = 1;
        $scope.pageChanged();
    };
    
    $scope.init();
    
        
    $scope.preloadContent = function (propertyId) {
        $scope.showEditor();
        if(propertyId != $scope.propertyId) {
            $scope.showPropertyLoader();
            
            //$state.go('app.properties.edit', {propertyId: propertyId}, {location:"replace", inherit:false} );
        }
    };
    
    $scope.deleteProperty = function(property) {
        //show pop-up        
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover the property:<br /><strong>" + property.title + '</strong>',
			html: true,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, delete it!',
            closeOnConfirm: false,
            //closeOnCancel: false
        },
        function(){
            swal.close();
            $scope.showLoader();
            property.remove().then(function(response) {
                $scope.hideLoader();                
                var n = noty({text: 'Property deleted successfully', type:'warning', timeout: 2000});
                $scope.pageChanged();
            }, function() {
                $scope.hideLoader();
                var n = noty({text: "There was an error deleting", type:'warning', timeout: 2000});
                console.log("There was an error deleted");
            });
            
        });
    };
	
});
