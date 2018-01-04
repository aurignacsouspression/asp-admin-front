(function () {
    "use strict";

    angular
        .module("app.motos")
        .factory("motosFactory", motosFactory);

    motosFactory.$inject = ["firebaseFactory"];
    function motosFactory(firebaseFactory) {
        var categoryName = categories.moto.name;
        var fireMotosAsArray = firebaseFactory.motos;

        var service = {
            getByKey: getMotoByKey,
            removeLogo: removeLogoMoto,
            motoObjectById: motoObjectById,
            modifyPriority: modifyMotoPriority,
            add: addMoto,
            update: saveMoto,
            remove: removeMoto,
            updateAfterEditionRemoval: updateMotosAfterEditionRemove
        };

        return service;

        //////////////////////////////

        function removeEditionFromMoto(key, edition) {
            var moto = getMotoByKey(key);
            delete moto.editions[edition.$id];
            fireMotosAsArray.$save(moto);
        }

        function getMotoByKey(key) {
            return fireMotosAsArray.$getRecord(key);
        }

        function removeLogoMoto(moto) {
            delete moto.logo;
            moto.$save();
        }

        //Retourne un exposant moto sous forme d'objet
        function motoObjectById(id) {
            return firebaseFactory.getCategoryObject(categoryName, id);
        }

        //Fonction qui s'occupe de setter la priorité en fonction de l'élément caractéristique.
        function modifyMotoPriority(ref) {
            var added = getMotoByKey(ref.key());
            added.$priority = (added.name).toLowerCase();
            fireMotosAsArray.$save(added);
        }

        function addMoto(moto) {
            return fireMotosAsArray.$add(moto);
        }

        function saveMoto(moto) {
            return moto.$save();
        }

        function removeMoto(moto) {
            var index = fireMotosAsArray.$indexFor(moto.$id);
            return fireMotosAsArray.$remove(index);
        }

        function updateMotosAfterEditionRemove(edition) {
            angular.forEach(edition.motos, function (val, key) {
                removeEditionFromMoto(key, edition);
            });
        }
    }

})();
