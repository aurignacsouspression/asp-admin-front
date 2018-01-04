(function () {
  "use strict";

  var adminApp = angular.module("adminApp", [
    /* Shared modules */
    "app.core",
    "app.config",

    /* Feature area */
    "app.layout",
    "app.auth",
    "app.brasseurs",
    "app.editions",
    "app.hebergements",
    "app.motos",
    "app.partenaires",
    "app.presse",
    "app.users",

    "SharedDirectives",
  ]);

  //where we will store the attempted url
  adminApp.value("redirectToUrlAfterLogin", { url: "/" });

  adminApp.config(["$routeProvider", function ($routeProvider) {
    var mustBeAuth = {
      "currentAuth": ["authFactory", function (authFactory) {
        return authFactory.requireAuth();
      }]
    };

    $routeProvider
      .when("/", {
        templateUrl: "/adm/src/app/layout/dashboard.html",
        resolve: mustBeAuth
      })
      .when("/login", {
        controllerAs: "authCtrl",
        controller: "AuthController",
        templateUrl: "/adm/src/app/auth/login.html",
      })
      .when("/password/remind", {
        controllerAs: "authCtrl",
        controller: "AuthController",
        templateUrl: "/adm/src/app/auth/forgotPassword.html"
      })
      .when("/password/reset/:token", {
        controllerAs: "authCtrl",
        controller: "AuthController",
        templateUrl: "/adm/src/app/auth/resetPassword.html"
      })
      .when("/administration", {
        controllerAs: "usersCtrl",
        controller: "UsersController",
        templateUrl: "/adm/src/app/users/users.html",
        resolve: {
          "currentAuth": ["authFactory", "$q", function (authFactory, $q) {
            var deferred = $q.defer();

            authFactory.requireAuth().then(function (auth) {
              if (auth.auth.rights == 1) {
                deferred.resolve();
              }
              else {
                deferred.reject("UNAUTHORIZED");
              }
            }, function (data) {
              deferred.reject(data);
            });

            return deferred.promise;
          }]
        }
      })

      .when("/brasseurs", {
        controller: "BrasseursController",
        controllerAs: "brasseursCtrl",
        templateUrl: "/adm/src/app/brasseurs/brasseurs.html",
        resolve: mustBeAuth
      })
      .when("/editions", {
        controller: "EditionsController",
        controllerAs: "editionsCtrl",
        templateUrl: "/adm/src/app/editions/editions.html",
        resolve: mustBeAuth
      })
      .when("/partenaires", {
        controller: "PartenairesController",
        controllerAs: "partenairesCtrl",
        templateUrl: "/adm/src/app/partenaires/partenaires.html",
        resolve: mustBeAuth
      })
      .when("/presse", {
        controller: "PresseController",
        controllerAs: "presseCtrl",
        templateUrl: "/adm/src/app/presse/presse.html",
        resolve: mustBeAuth
      })
      .when("/hebergement", {
        controller: "HebergementController",
        controllerAs: "hebergementCtrl",
        templateUrl: "/adm/src/app/hebergements/hebergements.html",
        resolve: mustBeAuth
      })
      .when("/moto", {
        controller: "MotosController",
        controllerAs: "motosCtrl",
        templateUrl: "/adm/src/app/motos/motos.html",
        resolve: mustBeAuth
      })
      .when("/:category/:key/content", {
        controller: "ContentArticlesController",
        controllerAs: "articlesCtrl",
        templateUrl: "/adm/src/app/core/content/content-articles.html",
        resolve: mustBeAuth
      })
      .when("/:category/:key/content/:action/:articleId?", {
        controller: "ContentArticleController",
        controllerAs: "articleCtrl",
        templateUrl: "/adm/src/app/core/content/content-article.html",
        resolve: mustBeAuth
      })
      .when("/:category/:key/images", {
        controller: "ContentImagesController",
        controllerAs: "imagesCtrl",
        templateUrl: "/adm/src/app/core/content/content-images.html",
        resolve: mustBeAuth
      })
      .when("/:category/:value*", {
        redirectTo: function (params) {
          return "/" + params.category;
        }
      })
      .otherwise({
        redirectTo: "/"
      });

  }]);

  adminApp.run(["$rootScope", "$location", "redirectToUrlAfterLogin", function ($rootScope, $location, redirectToUrlAfterLogin) {
    $rootScope.$on("$routeChangeError", function (event, next, previous, error) {
      // We can catch the error thrown when the $requireAuth promise is rejected
      // and redirect the user back to the home page
      if (error === "AUTH_REQUIRED") {
        redirectToUrlAfterLogin.url = $location.path();
        $location.path("/login");
      }

      if (error === "UNAUTHORIZED") {
        $location.path("/");
      }
    });
  }]);

  /**
   * Initialise la gestion de l'authentification en démarrant le service correspondant
   */
  adminApp.run(["authFactory", function (authFactory) {
    authFactory.initialize();
  }]);

  adminApp.config(function (uiSelectConfig) {
    uiSelectConfig.theme = "bootstrap";
  });

  adminApp.config(function ($modalProvider) {
    angular.extend($modalProvider.defaults, {
      // container: body,
      animation: "am-fade-and-slide-top",
      show: false
    });
  });

})();
