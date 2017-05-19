'use strict';

angular.module('ngAdmin')
.controller('NavigationLinksCtrl', function ($scope, $http, ContentService, PropertyService) {

    window.scope = $scope;
    $scope.errors = {};
    $scope.loading = false;
    $scope.linkTypes = [
        {type: 'url', name: 'URL'},
        {type: 'page', name: 'Page'},
        {type: 'property', name: 'Property'}
    ];
    $scope.linkTypeLabel = "test";
    $scope.changeLinkType = function() {
        $scope.setLinkType();
        $scope.selectedPage.selected = {};
        $scope.link.value = {};
    }
    $scope.setLinkType = function() {
        console.log($scope.linkTypeLabel, $scope.link);
        switch ($scope.link.type) {
            case 'page':
                $scope.linkTypeLabel = "Select page";
                if(!angular.isUndefined($scope.link.value)) {
                    $scope.selectedPage.selected = $scope.link.value;
                }
                break;
            case 'property':
                $scope.linkTypeLabel = "Select property";
                if(!angular.isUndefined($scope.link.value)) {
                    $scope.selectedPage.selected = $scope.link.value;
                }
                break;
            case 'url':
                $scope.linkTypeLabel = "Web address";
                break;
        }

    };
    
    $scope.selectedPage = {};
    $scope.pageList = [];
    $scope.updatePageLink = function() {
        console.log('$scope.selectedPage', $scope.selectedPage);
        $scope.link.value = {id : $scope.selectedPage.selected.page_id, title: $scope.selectedPage.selected.title, slug: $scope.selectedPage.selected.slug };
    };
    $scope.spinnerPage = false;
    $scope.searchPages = function($select) {
        if($select.search.length < 1)
            return false;
        $scope.spinnerPage = true;
        return ContentService.getList( {currentLocale: $scope.currentLocale, page: 1, sortField: 'title', sortDirection: 'ASC', search: $select.search}).then(function(pages) {
            $scope.pageList = pages;
            $scope.spinnerPage = false;
        }, function() {
            $scope.spinnerPage = false;
        });
        
    };
    
    
    
    $scope.selectedProperty = {};
    $scope.propertyList = [];
    $scope.updatePropertyLink = function() {
        $scope.link.value = {id : $scope.selectedProperty.selected.property_id, title: $scope.selectedProperty.selected.displayable_address, slug: $scope.selectedProperty.selected.slug };
    };
    $scope.spinnerProperties = false;
    $scope.searchProperties = function($select) {
        if($select.search.length < 1)
            return false;
        $scope.spinnerProperties = true;
        return PropertyService.getList( {currentLocale: $scope.currentLocale, page: 1, sortField: 'displayable_address', sortDirection: 'ASC', search: $select.search}).then(function(properties) {
            $scope.propertyList = properties;
            $scope.spinnerProperties = false;
        }, function() {
            $scope.spinnerProperties = false;
        });
        
    };

    $scope.deleteItem = function() {
		$scope.remove();
		//console.log($scope.$parent.menuData);
	};
	
    $scope.init = function() {
        console.log("partial")
        if(angular.isUndefined($scope.link.type)) {
            $scope.link.type = _.findWhere($scope.linkTypes, {'type': 'page'}).type;
        } else {
            
        }
        
        $scope.setLinkType();
    };

    $scope.init();

});
