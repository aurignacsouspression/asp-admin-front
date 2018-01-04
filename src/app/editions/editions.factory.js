(function () {
    "use strict";

    angular
        .module("app.editions")
        .factory("editionsFactory", editionsFactory);

    editionsFactory.$inject = ["firebaseFactory"];
    function editionsFactory(firebaseFactory) {
        var categoryName = categories.editions.name;
        var fireEditionsAsArray = firebaseFactory.editions;

        var service = {
            getByKey: getEditionByKey,
            editionObjectById: editionObjectById,
            add: addEdition,
            update: saveEdition,
            remove: removeEdition,

            updateEditionsForBrasseur: updateEditionsForBrasseur,
            updateEditionsForMoto: updateEditionsForMoto,
            removeBrasseurFromEditions: removeBrasseurFromEditions,
            removeMotoFromEditions: removeMotoFromEditions,
            updateEditionsAfterBrasseurRemove: updateEditionsAfterBrasseurRemove,
            updateEditionsAfterMotoRemove: updateEditionsAfterMotoRemove,

            modifyPriority: modifyEditionPriority,
            removeAffiche: removeAfficheEdition,
            unlinkArticle: removeArticleFromEdition,
            updateEditionForArticle: updateEditionForArticle
        };

        return service;

        ////////////////////////////////

        function removeBrasseurFromEdition(key, brasseur) {
            var edition = getEditionByKey(key);
            delete edition.brasseurs[brasseur.$id];
            fireEditionsAsArray.$save(edition);
        }

        function removeMotoFromEdition(key, moto) {
            var edition = getEditionByKey(key);
            delete edition.motos[moto.$id];
            fireEditionsAsArray.$save(edition);
        }

        function getEditionByKey(key) {
            return fireEditionsAsArray.$getRecord(key);
        }

        //Retourne un brasseur sous forme d'objet
        function editionObjectById(id) {
            return firebaseFactory.getCategoryObject(categoryName, id);
        }

        function addEdition(edition) {
            return fireEditionsAsArray.$add(edition);
        }

        function saveEdition(edition) {
            return edition.$save();
        }

        function removeEdition(edition) {
            var index = fireEditionsAsArray.$indexFor(edition.$id);
            return fireEditionsAsArray.$remove(index);
        }

        //Appelée lors de la sauvegarde d'une brasserie : on ajoute sa key aux éditions concernées
        function updateEditionsForBrasseur(brasseur) {
            angular.forEach(brasseur.editions, function (val, key) {
                var edition = getEditionByKey(key);
                if (!edition.brasseurs) {
                    edition.brasseurs = {};
                }

                edition.brasseurs[brasseur.$id] = true;
                fireEditionsAsArray.$save(edition);
            });
        }

        //Appelée lors de la sauvegarde d'un exposant moto : on ajoute sa key aux éditions concernées
        function updateEditionsForMoto(moto) {
            angular.forEach(moto.editions, function (val, key) {
                var edition = getEditionByKey(key);
                if (!edition.motos) {
                    edition.motos = {};
                }

                edition.motos[moto.$id] = true;
                fireEditionsAsArray.$save(edition);
            });
        }

        //Fonction qui s'occupe de setter la priorité en fonction de l'élément caractéristique.
        function modifyEditionPriority(ref) {
            var added = getEditionByKey(ref.key());
            added.$priority = (added.year);
            fireEditionsAsArray.$save(added);
        }

        function removeAfficheEdition(edition) {
            delete edition.a3;
            edition.$save();
        }

        //Supprime les liens avec les éditions qui ne sont plus liées à une brasserie après modification de celle-ci
        function removeBrasseurFromEditions(brasseur, formEditions) {
            angular.forEach(brasseur.editions, function (val, key) {
                var editionFound = false;
                angular.forEach(formEditions, function (editionVal, editionKey) {
                    if (!editionFound && editionVal.$id == key) {
                        editionFound = true;
                    }
                });

                if (!editionFound) {
                    removeBrasseurFromEdition(key, brasseur);
                }
            });
        }

        //Supprime les liens avec les éditions qui ne sont plus liées à un exposant moto après modification de celui-ci
        function removeMotoFromEditions(moto, formEditions) {
            angular.forEach(moto.editions, function (val, key) {
                var editionFound = false;

                angular.forEach(formEditions, function (editionVal, editionKey) {
                    if (!editionFound && editionVal.$id == key) {
                        editionFound = true;
                    }
                });

                if (!editionFound) {
                    removeMotoFromEdition(key, moto);
                }
            });
        }

        function updateEditionsAfterBrasseurRemove(brasseur) {
            angular.forEach(brasseur.editions, function (val, key) {
                removeBrasseurFromEdition(key, brasseur);
            });
        }

        function updateEditionsAfterMotoRemove(moto) {
            angular.forEach(moto.editions, function (val, key) {
                removeMotoFromEdition(key, moto);
            });
        }

        function removeArticleFromEdition(article, oldEdition) {
            var edition = null;
            if (typeof oldEdition === "undefined") {
                edition = getEditionByKey(article.edition);
            } else {
                edition = getEditionByKey(oldEdition);
            }

            delete edition.articles[article.$id];
            fireEditionsAsArray.$save(edition);
        }

        //Appelée lors de la sauvegarde d'un article de presse : on ajoute sa key aux éditions concernées
        function updateEditionForArticle(article) {
            var edition = getEditionByKey(article.edition);
            if (!edition.articles) {
                edition.articles = {};
            }

            edition.articles[article.$id] = true;
            fireEditionsAsArray.$save(edition);
        }
    }

})();
