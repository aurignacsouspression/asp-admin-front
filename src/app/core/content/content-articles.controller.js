(function () {
    "use strict";

    angular
        .module("app.core")
        .controller("ContentArticlesController", ContentArticlesController);

    ContentArticlesController.$inject = ["$scope", "$location", "$routeParams", "firebaseFactory", "$modal", "DELETE_MODAL_URL"];
    function ContentArticlesController($scope, $location, $routeParams, firebaseFactory, $modal, DELETE_MODAL_URL) {
        var vm = this;
        vm.pageClass = "content";
        vm.initDeleteContentArticle = initDeleteContentArticle;

        activate();

        /////////////////////////////

        function activate() {
            vm.category = categories[$routeParams.category];
            vm.contentKey = $routeParams.key;
            vm.editions = firebaseFactory.editions;

            $scope.contentArticles = firebaseFactory.getAsArray(vm.category.name + "/" + vm.contentKey + "/contentArticles");

            //TODO: Gérer le titre pour toutes les catégories
            switch (vm.category) {

                case categories.editions:
                    vm.editions.$loaded(function () {
                        vm.contentTitle = vm.editions.$getRecord(vm.contentKey).year;
                    });
                    break;
            }
        }

        function initDeleteContentArticle(contentArticle) {
            vm.contentToDelete = contentArticle;
            $scope.submitModalForm = removeContentArticle;

            var modalInfos = {
                scope: $scope,
                templateUrl: DELETE_MODAL_URL,
                title: "Supprimer un article",
                html: true,

                // Syntaxe template strings ES6
                content: `<p>Attention, vous allez supprimer l'article intitulé "${contentArticle.title}".</p>
                          <p>Cliquez sur "Supprimer" pour valider.</p>`
            };

            var confirmDeleteContentArticleModal = $modal(modalInfos);
            confirmDeleteContentArticleModal.$promise.then(confirmDeleteContentArticleModal.show);
        }

        /**
         * Appelée lors de la validation de la suppression d'un article
         */
        function removeContentArticle() {
            var that = this;
            $scope.contentArticles.$remove(vm.contentToDelete).then(function (ref) {
                that.$hide();
            });
        }
    }

})();
