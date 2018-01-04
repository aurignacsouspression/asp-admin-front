(function () {
  "use strict";

  angular
    .module("SharedDirectives", [])
    .directive("navMenu", navMenu)
    .directive("aspCheckExistence", aspCheckExistence)
    .directive("equals", equals);

  navMenu.$inject = ["$location"];
  function navMenu($location) {
    return function (scope, element, attrs) {
      var links = element.find("a"),
        onClass = attrs.navMenu || "on",
        routePattern,
        link,
        url,
        currentLink,
        urlMap = {},
        i;

      if (!$location.$$html5) {
        routePattern = /^#[^/]*/;
      }

      for (i = 0; i < links.length; i++) {
        link = angular.element(links[i]);
        url = link.attr("href");

        if (url && $location.$$html5) {
          urlMap[url] = link;
        } else if (url) {
          urlMap[url.replace(routePattern, "")] = link;
        }
      }

      scope.$on("$routeChangeStart", function () {
        var pathLink = urlMap[$location.path()];

        if (pathLink) {
          if (currentLink) {
            currentLink.removeClass(onClass);
          }
          currentLink = pathLink;
          currentLink.addClass(onClass);
        }
      });
    };
  }

  aspCheckExistence.$inject = ["firebaseFactory"];
  function aspCheckExistence(firebaseFactory) {
    function link(scope, element, attrs, ctrl) {
      ctrl.$parsers.unshift(function (viewValue) {
        var exists = false;

        switch (scope.category) {
          case categories.editions.id:
            angular.forEach(firebaseFactory.editions, function (value, key) {
              if (value.$id != scope.newEdition.$id && value.year == viewValue) {
                exists = true;
              }
            });
            break;

          case categories.brasseurs.id:
            angular.forEach(firebaseFactory.brasseurs, function (value, key) {
              if (value.$id != scope.newBrasseur.$id && value.name.toLowerCase() == viewValue.toLowerCase()) {
                exists = true;
              }
            });
            break;

          case categories.partenaires.id:
            angular.forEach(firebaseFactory.partenaires, function (value, key) {
              if (value.$id != scope.newPartenaire.$id && value.name.toLowerCase() == viewValue.toLowerCase()) {
                exists = true;
              }
            });
            break;

          case categories.presse.id:
            angular.forEach(firebaseFactory.presse, function (value, key) {
              if (value.$id != scope.newPressOrgan.$id && value.name.toLowerCase() == viewValue.toLowerCase()) {
                exists = true;
              }
            });
            break;

          case categories.articles.id:
            angular.forEach(firebaseFactory.articles, function (value, key) {
              if (value.$id != scope.newArticle.$id && value.title.toLowerCase() == viewValue.toLowerCase()) {
                exists = true;
              }
            });
            break;

          case categories.hebergements.id:
            angular.forEach(firebaseFactory.hebergements, function (value, key) {
              if (value.$id != scope.newHebergement.$id && value.name.toLowerCase() == viewValue.toLowerCase()) {
                exists = true;
              }
            });
            break;

          case categories.moto.id:
            angular.forEach(firebaseFactory.motos(), function (value, key) {
              if (value.$id != scope.newMoto.$id && value.name.toLowerCase() == viewValue.toLowerCase()) {
                exists = true;
              }
            });
            break;
        }

        ctrl.$setValidity("exists", !exists);
        return viewValue;
      });
    }

    return {
      require: "ngModel",
      restrict: "A",
      link: link
    };
  }

  function equals() {
    return {
      restrict: "A", // only activate on element attribute
      require: "?ngModel", // get a hold of NgModelController
      link: function (scope, elem, attrs, ngModel) {
        if (!ngModel) {
          return;
        } // do nothing if no ng-model

        // watch own value and re-validate on change
        scope.$watch(attrs.ngModel, function () {
          validate();
        });

        // observe the other value and re-validate on change
        attrs.$observe("equals", function (val) {
          validate();
        });

        var validate = function () {
          // values
          var val1 = ngModel.$viewValue;
          var val2 = attrs.equals;

          // set validity
          ngModel.$setValidity("equals", !val1 || !val2 || val1 === val2);
        };
      }
    };
  }

})();
