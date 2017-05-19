'use strict';

angular.module('ngAdmin')
    .controller('RegionsCtrl', function ($scope, RegionService, $modal, $stateParams) {

    window.scope = $scope;
    $scope.regionsList = null;

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    /*
    $scope.localeChoicesData = [
        {'code':'en', 'name':'English'},
        {'code':'fr', 'name':'French'},
        {'code':'de', 'name':'German'},
        {'code':'nl', 'name':'Dutch'}
    ];
    $scope.localeChoices = _.pluck($scope.localeChoicesData, 'code');
*/
    $scope.search = "";
    $scope.sortOptions = [
        { field:'name', direction:'asc', name:'Name (A-Z)' },
        { field:'updated_at', direction:'desc', name:'Date created (Newest to oldest)' },
        { field:'updated_at', direction:'asc', name:'Date created (Oldest to newest)' },
    ];
    $scope.sort = _.first($scope.sortOptions);
    
    $scope.init = function() {
        console.log("GET CONTENT RESTFULL");
        console.log('currentLocale', $stateParams['currentLocale']);
        console.log('currentLocale', $scope.localesList);

        if(!angular.isUndefined($stateParams['currentLocale']) && $stateParams['currentLocale'] != '') {
            $scope.currentLocale = $stateParams['currentLocale'];
        }

        $scope.pageChanged();
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
        console.log('$scope.currentPage', $scope.currentPage);
    };

    $scope.changeLocale = function() {
        $scope.pageChanged();
    };

    $scope.performSearch = function() {
        $scope.pageChanged();
    };

    $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.currentPage);

        // This will query /members and return a promise.
        $scope.showLoader();
        RegionService.getList( {currentLocale: $scope.currentLocale, page: $scope.currentPage, sortField: $scope.sort.field, sortDirection: $scope.sort.direction, search: $scope.search}).then(function(pages) {
            $scope.regionsList = pages;

            //localeChoices
            _.each($scope.regionsList, function(page) {

                var translatedPages = _.pluck(page.translations, 'locale');
                console.log('translatedPages', translatedPages);
                page.translated = {};
                _.each($scope.localesList, function(pageLocale) {
                    page.translated[pageLocale.code] = _.contains(translatedPages, pageLocale.code);
                });

                //console.log('MISSING '+page.id, missingPages);
            });


            $scope.pageInfo = pages.meta;
            $scope.currentPage = pages.meta.current_page;
            $scope.totalItems = pages.meta.total;
            $scope.hideLoader();
            //$scope.currentPage = members.total;
        });

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

    
        
    $scope.regionEdit = function(regionId, pageLang) {

        var modalInstance = $modal.open({
            templateUrl: 'app/regions/regions-edit.html',
            controller: 'RegionsEditCtrl',
            size: 'md',
            resolve: {
                regionId: function () {
                  return regionId;
                },
                currentLocale: function () {
                  return pageLang;
                }
            }
        });
    
        modalInstance.result.then(function (selectedItem) {
            console.log("SUCCESS");
        }, function () {
            console.log("CLOSED");
        });
        
    };
    

    $scope.init();
});
