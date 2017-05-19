// Declare factory
angular.module('ngAdmin')
    .factory('PropertyService', function(Restangular, DSCacheFactory) {
		return Restangular.service('property');
});

// Declare factory
angular.module('ngAdmin')
    .factory('MemberService', function(Restangular, DSCacheFactory) {
    return Restangular.service('members');
});

angular.module('ngAdmin')
    .factory('ContentService', function(Restangular, DSCacheFactory) {
    return Restangular.service('content');
});

// Declare factory
angular.module('ngAdmin')
    .factory('MenuService', function(Restangular, DSCacheFactory) {

    return Restangular.service('menu');

});

// Declare factory
angular.module('ngAdmin')
    .factory('LanguageService', function(Restangular, DSCacheFactory) {

    return Restangular.service('language');


});

// Declare factory
angular.module('ngAdmin')
    .factory('PropertyTypeService', function(Restangular, DSCacheFactory) {

    return Restangular.service('property-types');
});

// Declare factory
angular.module('ngAdmin')
    .factory('PackageService', function(Restangular, DSCacheFactory) {

    return Restangular.service('packages');
});

// Declare factory
angular.module('ngAdmin')
    .factory('RegionService', function(Restangular, DSCacheFactory) {
    return Restangular.service('regions');
});

// Declare factory
angular.module('ngAdmin')
    .factory('SearchCriteriaTypeService', function(Restangular, DSCacheFactory) {

    return Restangular.service('search-criteria-types');
});

// Declare factory
angular.module('ngAdmin')
    .factory('PaymentMethodsService', function(Restangular, DSCacheFactory) {

    return Restangular.service('payment-methods');
});
// Declare factory
angular.module('ngAdmin')
    .factory('TransactionService', function(Restangular, DSCacheFactory) {

    return Restangular.service('transactions');
});
// Declare factory
angular.module('ngAdmin')
    .factory('ProspectService', function(Restangular, DSCacheFactory) {

    return Restangular.service('prospects');
});


angular.module('ngAdmin')
    .service('SettingsService', function(Restangular, $q) {

    this.list = {};

    this.save = function(data) {

        var deferred = $q.defer();

        Restangular.all('settings').post(data).then(function() {
            console.log("Object saved OK");
            deferred.resolve(data);

        }, function() {
            deferred.reject(true);
        });
        return deferred.promise;
    }

    this.getList = function(data) {
        var deferred = $q.defer();
        var me = this;

        Restangular.all('settings').getList().then(function(data) {
            console.log("Object saved OK");
            console.log(data);
            console.log(me.list);
            me.list = data;
            deferred.resolve(data);

        }, function() {
            deferred.reject(true);
        });
        return deferred.promise;
    }

    this.getArray = function(data) {
        var deferred = $q.defer();
        var me = this;

        Restangular.all('settings').getList().then(function(response) {

            var settings = {};
            _.each(response, function(n, key) {
                settings[n.key] = n.value;
            });

            deferred.resolve(settings);

        }, function() {
            deferred.reject(true);
        });
        return deferred.promise;
    }

    this.get = function(key) {
        var deferred = $q.defer();
        var me = this;
        console.log(me.list);
        var setting = _.findWhere(me.list, {key: key})
        if(setting) {
            return setting.value;
        }
        return false;
    }


});
