(function () {
    "use strict";

    angular
        .module("app.layout")
        .controller("AdminController", AdminController);

    AdminController.$inject = ["$rootScope", "$scope"];
    function AdminController($rootScope, $scope) {
        $rootScope.activateLeftMenu = activateLeftMenu;

        $scope.timestampToStringDate = timestampToStringDate;
        $scope.setPageClass = setPageClass;

        activate();

        /////////////////////

        function activate() {
            activateLeftMenu();

            // setup editor options
            $scope.editorOptions = {
                height: "100"
            };
        }

        function setPageClass(classe) {
            $scope.pageClass = classe;
        }

        function timestampToStringDate(timestamp) {
            var date = new Date(timestamp);
            var day = date.getDate();
            var month = date.getMonth() + 1;
            if (day.toString().length < 2) {
                day = "0" + day;
            }

            return day + "/" + month + "/" + date.getFullYear();
        }

        function activateLeftMenu() {
            if ($rootScope.user.authData && $rootScope.user.authData.auth.rights > 0) {
                $rootScope.menuLeft = "../../adm/src/app/layout/leftMenu.html";
            }
        }
    }

})();
