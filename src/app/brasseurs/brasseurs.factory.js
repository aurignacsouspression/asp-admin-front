(function () {
    "use strict";

    angular
        .module("app.brasseurs")
        .factory("brasseursFactory", brasseursFactory);

    brasseursFactory.$inject = ["firebaseFactory"];

    function brasseursFactory(firebaseFactory) {
        var categoryName = categories.brasseurs.name;
        var fireBrasseursAsArray = firebaseFactory.brasseurs;

        var service = {
            getBrasseurByKey: getBrasseurByKey,
            removeAfficheBrasseur: removeAfficheBrasseur,
            updateBrasseursForEdition: updateBrasseursForEdition,
            brasseurObjectById: brasseurObjectById,
            modifyPriority: modifyPriority,
            add: addBrasseur,
            update: saveBrasseur,
            remove: removeBrasseur,
            removeEditionFromBrasseurs: removeEditionFromBrasseurs,
            updateBrasseursAfterEditionRemove
        };

        return service;

        //////////////////////////////////

        function getBrasseurByKey(key) {
            return fireBrasseursAsArray.$getRecord(key);
        }

        function removeAfficheBrasseur(brasseur) {
            delete brasseur.logo;
            brasseur.$save();
        }

        //Appelée lors de la sauvegarde d'une édition : on ajoute sa key aux brasseurs concernés
        function updateBrasseursForEdition(edition) {
            angular.forEach(edition.brasseurs, function (val, key) {
                var brasseur = fireBrasseursAsArray.$getRecord(key);
                if (!brasseur.editions) {
                    brasseur.editions = {};
                }
                brasseur.editions[edition.$id] = true;
                fireBrasseursAsArray.$save(brasseur);
            });
        }

        //Retourne un brasseur sous forme d'objet
        function brasseurObjectById(id) {
            return firebaseFactory.getCategoryObject(categoryName, id);
        }

        //Fonction qui s'occupe de setter la priorité en fonction de l'élément caractéristique.
        function modifyPriority(ref) {
            var added = getBrasseurByKey(ref.key());
            added.$priority = (added.name).toLowerCase();
            fireBrasseursAsArray.$save(added);
        }

        function addBrasseur(brasseur) {
            return fireBrasseursAsArray.$add(brasseur);
        }

        function saveBrasseur(brasseur) {
            return brasseur.$save();
        }

        function removeBrasseur(brasseur) {
            var index = fireBrasseursAsArray.$indexFor(brasseur.$id);
            return fireBrasseursAsArray.$remove(index);
        }

        //Supprime les liens avec les brasseurs qui ne sont plus liés à une édition après modification de celle-ci
        function removeEditionFromBrasseurs(edition, formBrasseurs) {
            angular.forEach(edition.brasseurs, function (val, key) {
                var brasseurFound = false;
                angular.forEach(formBrasseurs, function (brasseurVal, brasseurKey) {
                    if (!brasseurFound && brasseurVal.$id == key) {
                        brasseurFound = true;
                    }
                });

                if (!brasseurFound) {
                    removeEditionFromBrasseurByKey(key, edition);
                }
            });
        }

        function updateBrasseursAfterEditionRemove(edition) {
            angular.forEach(edition.brasseurs, function (val, key) {
                removeEditionFromBrasseurByKey(key, edition);
            });
        }

        ////////////////////////////

        function removeEditionFromBrasseurByKey(key, edition) {
            var brasseur = getBrasseurByKey(key);
            delete brasseur.editions[edition.$id];
            fireBrasseursAsArray.$save(brasseur);
        }
    }

})();
