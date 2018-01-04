(function () {
    "use strict";

    angular
        .module("app.hebergements")
        .factory("hebergementsFactory", hebergementsFactory);

    hebergementsFactory.$inject = ["firebaseFactory"];
    function hebergementsFactory(firebaseFactory) {
        var categoryName = categories.hebergements.name;
        var fireHebergementsAsArray = firebaseFactory.hebergements;

        var service = {
            getHebergementByKey: getHebergementByKey,
            hebergementObjectById: hebergementObjectById,
            add: addHebergement,
            update: saveHebergement,
            remove: removeHebergement,
            modifyPriority: modifyHebergementPriority,
            removeImage: removeImageHebergement
        };

        return service;

        ///////////////////////////////

        function getHebergementByKey(key) {
            return fireHebergementsAsArray.$getRecord(key);
        }

        //Retourne un hébergement sous forme d'objet
        function hebergementObjectById(id) {
            return firebaseFactory.getCategoryObject(categoryName, id);
        }

        function addHebergement(hebergement) {
            return fireHebergementsAsArray.$add(hebergement);
        }

        function saveHebergement(hebergement) {
            return hebergement.$save();
        }

        function removeHebergement(hebergement) {
            var index = fireHebergementsAsArray.$indexFor(hebergement.$id);
            return fireHebergementsAsArray.$remove(index);
        }

        //Fonction qui s'occupe de setter la priorité en fonction de l'élément caractéristique.
        function modifyHebergementPriority(ref) {
            var added = getHebergementByKey(ref.key());
            added.$priority = (added.name).toLowerCase();
            fireHebergementsAsArray.$save(added);
        }

        function removeImageHebergement(hebergement) {
            delete hebergement.image;
            hebergement.$save();
        }
    }

})();
