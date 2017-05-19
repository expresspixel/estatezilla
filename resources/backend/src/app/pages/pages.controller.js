'use strict';

angular.module('ngAdmin')
    .controller('PagesCtrl', function ($scope, ContentService, $modal, $stateParams) {

    window.scope = $scope;
    $scope.pagesList = null;

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
        { field:'title', direction:'asc', name:'Title (A-Z)' },
        { field:'updated_at', direction:'desc', name:'Date created (Newest to oldest)' },
        { field:'updated_at', direction:'asc', name:'Date created (Oldest to newest)' },
    ];
    $scope.sort = _.first($scope.sortOptions);
    
    $scope.init = function() {
        console.log("GET CONTENT RESTFULL");
        console.log('currentLocale', $scope.currentLocale);
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
        ContentService.getList( {currentLocale: $scope.currentLocale, page: $scope.currentPage, sortField: $scope.sort.field, sortDirection: $scope.sort.direction, search: $scope.search}).then(function(pages) {
            $scope.pagesList = pages;

            //localeChoices
            _.each($scope.pagesList, function(page) {

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

    $scope.addNewMember = function() {

        var modalInstance = $modal.open({
            templateUrl: 'app/members/members-create.html',
            controller: 'MembersCreateCtrl',
            size: 'md'
        });

        modalInstance.result.then(function (selectedItem) {
            console.log("SUCCESS");
        }, function () {
            console.log("CLOSED");
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

    $scope.deletePage = function(page) {
        //show pop-up        
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this page!",
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
            page.remove().then(function(response) {
                $scope.hideLoader();                
                var n = noty({text: 'Page deleted successfully', type:'warning', timeout: 2000});
                $scope.pageChanged();
            }, function() {
                $scope.hideLoader();
                var n = noty({text: "There was an error deleting", type:'warning', timeout: 2000});
                console.log("There was an error deleted");
            });
            
        });
        //delete

    };

    $scope.init();
});
