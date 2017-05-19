'use strict';

angular.module('ngAdmin')
.controller('NavigationCtrl', function ($scope, $modal, MenuService, Restangular, $q) {
	
    window.scope = $scope;
    $scope.showAdditional = false;

    $scope.menuList = [];
    $scope.menuData = [];
    
    $scope.addNewMenu = function() {

        var modalInstance = $modal.open({
            templateUrl: 'app/navigation/navigation-create.html',
            controller: 'NavigationCreateCtrl',
            size: 'md'
        });

        modalInstance.result.then(function (selectedItem) {
            console.log("SUCCESS");
            $scope.refreshMenus();
        }, function () {
            console.log("CLOSED");
        });

    };

    $scope.addToMenu = function() {
        var json = angular.toJson($scope.menuData);
        console.log(json);
        var count = (json.match(/id/g) || []).length;
        var tmp = {
            "id": count + 1,
            "title": "Untitled " + (count +1),
            "nodes": []
        };
        $scope.menuData.push(tmp);
    };
    
    $scope.changeLanguage = function() {
        $scope.switchMenu($scope.selectedMenu);
    };
    
    $scope.switchMenu = function(menu) {
        $scope.selectedMenu = menu;
        console.log('menu.data', menu.name, menu.data);
        
        if(_.isNull(menu.data) ) {
            menu.data = {}
        } else {
            menu.data = angular.fromJson(menu.data);   
        }
        
        if(_.size(menu.data[$scope.currentLocale]) > 0) {
            $scope.menuData = menu.data[$scope.currentLocale];
        } else {
            $scope.menuData = [];
            $scope.addToMenu();
        }
    }

    $scope.deleteMenu = function() {
        //show pop-up        
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this menu!",
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
            $scope.selectedMenu.remove().then(function(response) {
                $scope.hideLoader();
                $scope.menuList = _.without($scope.menuList, $scope.selectedMenu);
                $scope.switchMenu(_.first($scope.menuList));
                
                //$scope.refreshMenus();
                var n = noty({text: 'Menu deleted successfully', type:'warning', timeout: 2000});
            }, function() {
                $scope.hideLoader();
                var n = noty({text: "There was an error saving", type:'warning', timeout: 2000});
                console.log("There was an error saving");
            });
            
        });
        //delete

    };

    $scope.saveMenu = function() {
        $scope.saving = true;
        $scope.selectedMenu.data[$scope.currentLocale] = $scope.menuData;
        $scope.selectedMenu.data = $scope.selectedMenu.data;
        $scope.selectedMenu.json = angular.toJson($scope.selectedMenu.data);
        $scope.selectedMenu.save().then(function(response) {
            $scope.saving = false;
        }, function() {
            $scope.saving = false;
            console.log("There was an error saving");
        });
    };
    
    $scope.saving = false;
    $scope.updating = false;
    $scope.updateMenu = function() {
        $scope.updating = true;
        $scope.selectedMenu.save().then(function(response) {
            $scope.updating = false;
        }, function() {
            $scope.updating = false;
            console.log("There was an error saving");
        });
    };

    $scope.getMenus = function() {
        var deferred = $q.defer();
        MenuService.getList().then(function(data) {
            $scope.menuList = data;
            deferred.resolve(data);
        });        
        return deferred.promise;
    }

    $scope.refreshMenus = function() {
        //var n = noty({text: 'Loading...', type:'warning'});
        $scope.getMenus().then(function() {
            //$.noty.closeAll();
        });
    };
    $scope.init = function() {
        //set up locales
        /*_.each($scope.localeChoices, function(locale) { 
            $scope.menuData[locale] = [];
        });*/
        
        //let's get the menus
        $scope.showLoader();
        $scope.getMenus().then(function() {
            $scope.switchMenu(_.first($scope.menuList));
            $scope.hideLoader();
        });
    };

    $scope.init();

});


angular.module('ngAdmin')
.animation('.slide', function() {
    var NG_HIDE_CLASS = 'ng-hide';
    return {
        beforeAddClass: function(element, className, done) {
            if(className === NG_HIDE_CLASS) {
                element.slideUp(done);
            }
        },
        removeClass: function(element, className, done) {
            if(className === NG_HIDE_CLASS) {
                element.hide().slideDown(done);
            }
        }
    }
});