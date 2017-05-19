'use strict';

angular.module('ngAdmin')
.controller('ProspectsCtrl', function ($scope, ProspectService, $modal, $stateParams) {

    window.scope = $scope;
    $scope.membersList = null;

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.memberType = 'unregistered_prospect';
    
    $scope.search = "";
    $scope.sort = {};
    $scope.sort.field = 'created_at';
    $scope.sort.direction = 'desc';
    
    $scope.init = function() {
        console.log("GET MEMBERS RESTFULL");
        console.log('memberId', $stateParams['memberType']);
        
        if(!angular.isUndefined($stateParams['memberType']) && $stateParams['memberType'] != '') {
            $scope.memberType = $stateParams['memberType'];
            
        }

        $scope.pageChanged();
    };


    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
        console.log('$scope.currentPage', $scope.currentPage);
    };

    $scope.performSearch = function() {
        $scope.memberType = 'all';
        $scope.pageChanged();
    };
    
    $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.currentPage);

        // This will query /members and return a promise.
        $scope.showLoader();
        ProspectService.getList( {memberType: $scope.memberType, page: $scope.currentPage, sortField: $scope.sort.field, sortDirection: $scope.sort.direction, search: $scope.search}).then(function(members) {
            $scope.membersList = members;

            $scope.pageInfo = members.meta;
            $scope.currentPage = members.meta.current_page;
            $scope.totalItems = members.meta.total;
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
    
    $scope.deleteMember = function(prospect) {
        //show pop-up        
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this prospect!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, delete it!',
            closeOnConfirm: false
        },
        function(){
            swal.close();
            var n = noty({text: 'Deleting...', type:'warning', timeout: 2000});
            prospect.remove().then(function(response) {
                var n = noty({text: 'Deleted', type:'warning', timeout: 2000});
                $scope.pageChanged();
            }, function() {
                var n = noty({text: "There was an error deleting", type:'warning', timeout: 2000});
                console.log("There was an error deleting");
            });
            
        });

    };


    $scope.init();

});


