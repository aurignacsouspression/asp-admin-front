(function () {
    "use strict";

    angular
        .module("app.auth")
        .factory("authFactory", authFactory);

    authFactory.$inject = ["$http", "$firebaseAuth", "$q", "FIREBASE_URL", "firebaseFactory", "$rootScope", "$location"];
    function authFactory($http, $firebaseAuth, $q, FIREBASE_URL, firebaseFactory, $rootScope, $location) {
        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);

        var service = {
            initialize: initialize,
            loginWithPassword: loginWithPassword,
            createAccount: createAccount,
            logOut: logOut,
            getReminderMail: getReminderMail,
            resetPassword: resetPassword,
            requireAuth: requireAuth
        };

        return service;

        //////////////////////////

        /**
         * Appelée lors de l'instanciation de l'application, récupère l'état de l'authentification et applique les modifications nécessaires
         */
        function initialize() {
            $rootScope.user = { authData: auth.$getAuth() };

            auth.$onAuth(function (authData) {
                if (authData) {
                    $rootScope.user.authData = authData;
                    $rootScope.activateLeftMenu();
                } else {
                    $rootScope.user.authData = null;
                    delete $rootScope.menuLeft;
                    $location.path("/login");
                }
            });
        }

        function loginWithPassword(credentials) {
            var deferred = $q.defer();

            $http
                .post("auth/login", credentials)
                .then(function (response) {
                    //Si succès côté serveur, on s'identifie sur Firebase
                    var promise = auth.$authWithCustomToken(response.data.token);
                    promise.then(function (authData) {
                        console.log("Logged in as:", authData.uid);
                        deferred.resolve(authData);
                    }).catch(function (error) {
                        deferred.reject(error);
                    });
                })
                .catch(function (error) {
                    console.error("Authentication failed:", error);
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        function createAccount(credentials) {
            return $http.post("auth/create", credentials);
        }

        function logOut() {
            return $http
                .get("auth/logout")
                .finally(function () {
                    auth.$unauth();
                });
        }

        function getReminderMail(email) {
            return $http.post("auth/remind", { email: email });
        }

        function resetPassword(data) {
            return $http.post("auth/reset", data);
        }

        function requireAuth() {
            return auth.$requireAuth();
        }
    }

})();
