'use strict';

angular.module('ngAdmin')
.controller('PaymentMethodCtrl', function ($scope, $http, ContentService) {

    window.scope = $scope;
    $scope.errors = {};
    $scope.loading = false;
    $scope.linkTypes = [
        {type: 'url', name: 'URL'},
        {type: 'page', name: 'Page'},
        {type: 'property', name: 'Property'}
    ];
    $scope.linkTypeLabel = "test";
    /*$scope.changeLinkType = function() {
        $scope.setLinkType();
        $scope.selectedPage.selected = {};
        $scope.link.value = {};
    }
    $scope.setLinkType = function() {
        console.log($scope.linkTypeLabel, $scope.link);
        switch ($scope.paymentMethod.type) {
            case 'page':
                $scope.linkTypeLabel = "Select page";
                if(!angular.isUndefined($scope.paymentMethod.value)) {
                    $scope.selectedPage.selected = $scope.paymentMethod.value;
                }
                break;
            case 'property':
                $scope.linkTypeLabel = "Select property";
                if(!angular.isUndefined($scope.paymentMethod.value)) {
                    $scope.selectedPage.selected = $scope.paymentMethod.value;
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
        $scope.link.value = {id : $scope.selectedPage.selected.page_id, title: $scope.selectedPage.selected.title };
    };
    $scope.spinner = false;
    $scope.searchPages = function($select) {
        if($select.search.length < 1)
            return false;
        $scope.spinner = true;
        return ContentService.getList( {currentLang: $scope.currentLang, page: 1, sortField: 'title', sortDirection: 'ASC', search: $select.search}).then(function(pages) {
            $scope.pageList = pages;
            $scope.spinner = false;
        }, function() {
            $scope.spinner = false;
        });
        
    };
*/
    $scope.init = function() {
        console.log("partial")
        if(angular.isUndefined($scope.paymentMethod.type)) {
            $scope.paymentMethod.type = _.findWhere($scope.linkTypes, {'type': 'page'}).type;
        } else {
            
        }
        
        //$scope.setLinkType();
    };

    $scope.init();

});
