(function () {
    "use strict";

    angular
        .module("app.core")
        .service("firebaseFactory", firebaseFactory);

    firebaseFactory.$inject = ["FIREBASE_URL", "$firebaseObject", "$firebaseArray"];
    function firebaseFactory(FIREBASE_URL, $firebaseObject, $firebaseArray) {
        this.getAsArray = getAsArray;
        this.getAsObject = getAsObject;
        this.getCategoryObject = getCategoryObject;
        this.getReference = getReference;

        ////////////////////////////

        function getAsArray(path) {
            var ref = new Firebase(FIREBASE_URL).child(path);
            return $firebaseArray(ref);
        }

        function getAsObject(path) {
            var ref = new Firebase(FIREBASE_URL).child(path);
            return $firebaseObject(ref);
        }

        function getCategoryObject(category, child) {
            var ref = new Firebase(FIREBASE_URL).child(category).child(child);
            return $firebaseObject(ref);
        }

        function getReference(path) {
            return new Firebase(FIREBASE_URL).child(path);
        }
    }

    Object.defineProperties(firebaseFactory.prototype,
        {
            "brasseurs": {
                configurable: false,
                enumerable: true,
                get: function () {
                    if (!this._brasseurs) {
                        this._brasseurs = this.getAsArray(categories.brasseurs.name);
                    }

                    return this._brasseurs;
                }
            },
            "editions": {
                configurable: false,
                enumerable: true,
                get: function () {
                    if (!this._editions) {
                        this._editions = this.getAsArray(categories.editions.name);
                    }

                    return this._editions;
                }
            },
            "partenaires": {
                configurable: false,
                enumerable: true,
                get: function () {
                    if (!this._partenaires) {
                        this._partenaires = this.getAsArray(categories.partenaires.name);
                    }

                    return this._partenaires;
                }
            },
            "presse": {
                configurable: false,
                enumerable: true,
                get: function () {
                    if (!this._presse) {
                        this._presse = this.getAsArray(categories.presse.name);
                    }

                    return this._presse;
                }
            },
            "articles": {
                configurable: false,
                enumerable: true,
                get: function () {
                    if (!this._articles) {
                        this._articles = this.getAsArray(categories.articles.name);
                    }

                    return this._articles;
                }
            },
            "hebergements": {
                configurable: false,
                enumerable: true,
                get: function () {
                    if (!this._hebergements) {
                        this._hebergements = this.getAsArray(categories.hebergements.name);
                    }

                    return this._hebergements;
                }
            },
            "motos": {
                configurable: false,
                enumerable: true,
                get: function () {
                    if (!this._motos) {
                        this._motos = this.getAsArray(categories.moto.name);
                    }

                    return this._motos;
                }
            }
        });

})();
