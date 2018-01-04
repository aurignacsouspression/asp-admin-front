(function () {
    "use strict";

    angular
        .module("app.core")
        .controller("ContentArticleController", ContentArticleController);

    ContentArticleController.$inject = ["$routeParams", "firebaseFactory", "$location"];
    function ContentArticleController($routeParams, firebaseFactory, $location) {
        var vm = this;
        vm.commitContentArticle = commitContentArticle;
        vm.goToContentArticles = goToContentArticles;

        activate();

        //////////////////////

        function activate() {
            vm.category = categories[$routeParams.category];
            vm.contentKey = $routeParams.key;
            vm.contentArticles = firebaseFactory.getAsArray(vm.category.name + "/" + vm.contentKey + "/contentArticles");

            // if (typeof vm.contentKey === "undefined" || vm.contentKey != $routeParams.key) {
            //     loadContentArticles();
            // }

            switch ($routeParams.action) {
                case "create":
                    initNewContentArticle();
                    break;

                case "edit":
                    initModifyContentArticle();
                    break;

                default:
                    window.history.back();
            }
        }

        function initNewContentArticle() {
            vm.uploadErrors = null;
            vm.contentArticle = {};
            vm.form = {
                type: formType.creation,
                title: "Créer un nouvel article",
                action: "Enregistrer l'article"
            };
        }

        function initModifyContentArticle() {
            vm.uploadErrors = null;
            vm.contentArticle = firebaseFactory.getCategoryObject(vm.category.name + "/" + vm.contentKey + "/contentArticles", $routeParams.articleId);
            vm.contentArticle.$loaded().then(function () {
                vm.form = {
                    type: formType.modification,
                    title: "Modifier un article",
                    action: "Enregistrer les modifications"
                };
            });
        }

        function commitContentArticle() {
            if (vm.form.type == formType.creation) {
                createContentArticle();
            } else if (vm.form.type == formType.modification) {
                modifyContentArticle();
            }
        }

        function createContentArticle() {
            vm.contentArticles.$add(vm.contentArticle).then(function (ref) {
                modifyContentArticlePriority(ref);
                vm.goToContentArticles();
            });
        }

        function modifyContentArticle() {
            vm.contentArticle.$save().then(function (ref) {
                modifyContentArticlePriority(ref);
                vm.goToContentArticles();
            });
        }

        /**
         * S'occupe de setter la priorité en fonction de l'élément caractéristique.
         */
        function modifyContentArticlePriority(ref) {
            var added = vm.contentArticles.$getRecord(ref.key());
            added.$priority = (added.title).toLowerCase();
            vm.contentArticles.$save(added);
        }

        function goToContentArticles() {
            $location.path(vm.category.name + "/" + vm.contentKey + "/content/");
        }
    }

})();
