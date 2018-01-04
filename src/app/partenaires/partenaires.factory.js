(function () {
    "use strict";

    angular
        .module("app.partenaires")
        .factory("partenairesFactory", partenairesFactory);

    partenairesFactory.$inject = ["firebaseFactory"];
    function partenairesFactory(firebaseFactory) {
        var categoryName = categories.partenaires.name;
        var firePartenairesAsArray = firebaseFactory.partenaires;

        var service = {
            getByKey: getPartenaireByKey,
            partenaireObjectById: partenaireObjectById,
            add: addPartenaire,
            save: savePartenaire,
            update: removePartenaire,
            modifyPriority: modifyPriority
        };

        return service;

        ///////////////////////////

        function getPartenaireByKey(key) {
            return firePartenairesAsArray.$getRecord(key);
        }

        //Retourne un hébergement sous forme d'objet
        function partenaireObjectById(id) {
            return firebaseFactory.getCategoryObject(categoryName, id);
        }

        function addPartenaire(partenaire) {
            return firePartenairesAsArray.$add(partenaire);
        }

        function savePartenaire(partenaire) {
            return partenaire.$save();
        }

        function removePartenaire(partenaire) {
            var index = firePartenairesAsArray.$indexFor(partenaire.$id);
            return firePartenairesAsArray.$remove(index);
        }

        //Fonction qui s'occupe de setter la priorité en fonction de l'élément caractéristique.
        function modifyPriority(ref) {
            var added = getPartenaireByKey(ref.key());
            added.$priority = (added.name).toLowerCase();
            firePartenairesAsArray.$save(added);
        }
    }

})();
