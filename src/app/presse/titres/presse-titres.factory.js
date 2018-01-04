(function () {
    "use strict";

    angular
        .module("app.presse")
        .factory("pressOrgansFactory", pressOrgansFactory);

    pressOrgansFactory.$inject = ["firebaseFactory"];
    function pressOrgansFactory(firebaseFactory) {
        var categoryName = categories.presse.name;
        var firePressOrgansAsArray = firebaseFactory.presse;

        var service = {
            getByKey: getPressOrganByKey,
            pressOrganObjectById: pressOrganObjectById,
            add: addPressOrgan,
            update: savePressOrgan,
            remove: removePressOrgan,
            modifyPriority: modifyPressOrganPriority,
            removeLogo: removeLogoPressOrgan,
            unlinkArticle: removeArticleFromPressOrgan,
            linkArticle: updatePressOrganForArticle
        };

        return service;

        //////////////////////////////

        function getPressOrganByKey(key) {
            return firePressOrgansAsArray.$getRecord(key);
        }

        //Retourne un titre de presse sous forme d'objet
        function pressOrganObjectById(id) {
            return firebaseFactory.getCategoryObject(categoryName, id);
        }

        function addPressOrgan(pressOrgan) {
            return firePressOrgansAsArray.$add(pressOrgan);
        }

        function savePressOrgan(pressOrgan) {
            return pressOrgan.$save();
        }

        function removePressOrgan(pressOrgan) {
            var index = firePressOrgansAsArray.$indexFor(pressOrgan.$id);
            return firePressOrgansAsArray.$remove(index);
        }

        //Fonction qui s'occupe de setter la priorité en fonction de l'élément caractéristique.
        function modifyPressOrganPriority(ref) {
            var added = getPressOrganByKey(ref.key());
            added.$priority = (added.name).toLowerCase();
            firePressOrgansAsArray.$save(added);
        }

        function removeLogoPressOrgan(pressOrgan) {
            delete pressOrgan.logo;
            pressOrgan.$save();
        }

        function removeArticleFromPressOrgan(article, oldPressOrgan) {
            var pressOrgan = null;
            if (typeof oldPressOrgan === "undefined") {
                pressOrgan = getPressOrganByKey(article.pressOrgan);
            } else {
                pressOrgan = getPressOrganByKey(oldPressOrgan);
            }

            if (pressOrgan == null) {
                return;
            }

            delete pressOrgan.articles[article.$id];
            firePressOrgansAsArray.$save(pressOrgan);
        }

        //Appelée lors de la sauvegarde d'un article de presse : on ajoute sa key au titre de presse concerné
        function updatePressOrganForArticle(article) {
            var pressOrgan = getPressOrganByKey(article.pressOrgan);
            if (!pressOrgan.articles) {
                pressOrgan.articles = {};
            }

            pressOrgan.articles[article.$id] = true;
            firePressOrgansAsArray.$save(pressOrgan);
        }
    }

})();
