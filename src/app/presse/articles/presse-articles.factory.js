(function () {
    "use strict";

    angular
        .module("app.presse")
        .factory("pressArticlesFactory", pressArticlesFactory);

    pressArticlesFactory.$inject = ["firebaseFactory"];
    function pressArticlesFactory(firebaseFactory) {
        var categoryName = categories.articles.name;
        var fireArticlesAsArray = firebaseFactory.articles;

        var service = {
            getByKey: getArticleByKey,
            articleObjectById: articleObjectById,
            add: addArticle,
            update: saveArticle,
            remove: removeArticle,
            modifyPriority: modifyArticlePriority,
            removePaperScan: removeArticlePaper,
            updateArticlesAfterEditionRemoval: updateArticlesAfterEditionRemove
        };

        return service;

        ////////////////////////////

        function getArticleByKey(key) {
            return fireArticlesAsArray.$getRecord(key);
        }

        //Retourne un article de presse sous forme d'objet
        function articleObjectById(id) {
            return firebaseFactory.getCategoryObject(categoryName, id);
        }

        function addArticle(article) {
            return fireArticlesAsArray.$add(article);
        }

        function saveArticle(article) {
            var index = fireArticlesAsArray.$indexFor(article.$id);
            return fireArticlesAsArray.$save(index);
        }

        function removeArticle(article) {
            var index = fireArticlesAsArray.$indexFor(article.$id);
            return fireArticlesAsArray.$remove(index);
        }

        //Fonction qui s'occupe de setter la priorité en fonction de l'élément caractéristique.
        function modifyArticlePriority(ref) {
            var added = getArticleByKey(ref.key());
            added.$priority = added.date;
            fireArticlesAsArray.$save(added);
        }

        function removeArticlePaper(article) {
            delete article.paper;
            article.$save();
        }

        function updateArticlesAfterEditionRemove(edition) {
            angular.forEach(edition.articles, function (val, key) {
                var article = getArticleByKey(key);
                delete article.edition;
                fireArticlesAsArray.$save(article);
            });
        }
    }

})();
