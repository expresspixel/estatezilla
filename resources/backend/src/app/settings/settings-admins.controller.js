'use strict';

angular.module('ngAdmin')
  .controller('SettingsAdminsCtrl', function ($scope, MemberService, $modal, $stateParams) {

    window.scope = $scope;
    $scope.membersList = null;

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.memberType = 'admin';
    
    $scope.search = "";
    $scope.sort = {};
    $scope.sort.field = 'created_at';
    $scope.sort.direction = 'desc';
    
    $scope.init = function() {
        console.log("GET MEMBERS RESTFULL");
        console.log('memberId', $stateParams['memberType']);
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
        MemberService.getList( {memberType: $scope.memberType, page: $scope.currentPage, sortField: $scope.sort.field, sortDirection: $scope.sort.direction, search: $scope.search}).then(function(members) {
            $scope.membersList = members;

            $scope.pageInfo = members.meta;
            $scope.currentPage = members.meta.current_page;
            $scope.totalItems = members.meta.total;
            $scope.hideLoader();
            //$scope.currentPage = members.total;
        });

    };
    
    $scope.addNewAdmin = function() {

        var modalInstance = $modal.open({
            templateUrl: 'app/settings/settings-admins-create.html',
            controller: 'SettingsAdminsCreateCtrl',
            size: 'md'
        });

        modalInstance.result.then(function (selectedItem) {
            console.log("SUCCESS");
            $scope.pageChanged();
        }, function () {
            console.log("CLOSED");
        });

    };
    
    $scope.deleteMember = function(member) {
        //show pop-up        
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this member!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, delete it!',
            closeOnConfirm: false
        },
        function(){
            swal.close();
            var n = noty({text: 'Deleting...', type:'warning', timeout: 2000});
            member.remove().then(function(response) {
                $scope.pageChanged();
                var n = noty({text: 'Deleted', type:'warning', timeout: 2000});
            }, function() {
                var n = noty({text: "There was an error deleting", type:'warning', timeout: 2000});
                console.log("There was an error deleting");
            });
            
        });

    };

    $scope.showPermissions = function(permissions) {
        return permissions.join();
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

});
