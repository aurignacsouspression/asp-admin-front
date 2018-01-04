"use strict";

//TODO: Changer le chemin par le CDN
var sharedImgPath = "shared/assets/img/";

//Objet de base utilisé pour construire une modal
var Modal = function (template, scope, animation) {
    return {
        scope: scope,
        content: "Chargement en cours",
        container: "body",
        templateUrl: template,
        html: true,
        animation: (typeof animation === "undefined") ? "am-fade-and-slide-top" : animation,
        show: false
    };
};

//Parse les liens internet et facebooks des nouveaux éléments avant envoi dans Firebase
function completeLinks(newObject) {
    if (newObject.internetParsed !== undefined) {
        if (newObject.internetParsed != "") {
            newObject.internet = "http://" + newObject.internetParsed;
        } else {
            delete newObject.internet;
        }
        delete newObject.internetParsed;
    }

    if (newObject.facebookParsed !== undefined) {
        if (newObject.facebookParsed != "") {
            newObject.facebook = "http://" + newObject.facebookParsed;
        } else {
            delete newObject.facebook;
        }
        delete newObject.facebookParsed;
    }

    // return newObject;
}

//Supprime les premiers caractères des liens de l'élément à modifier (http://)
function sliceLinks(objectToModify) {
    if (objectToModify.internet) {
        objectToModify.internetParsed = objectToModify.internet.slice(7);
    }

    if (objectToModify.facebook) {
        objectToModify.facebookParsed = objectToModify.facebook.slice(7);
    }

    // return objectToModify;
}

//************************* ENUMERATIONS *************************//

var categories = {
    brasseurs: {
        id: 1,
        name: "brasseurs",
        imagePath: "brasseurs/"
    },
    editions: {
        id: 2,
        name: "editions",
        imagePath: "editions/"
    },
    partenaires: {
        id: 3,
        name: "partenaires",
        imagePath: "partenaires/"
    },
    presse: {
        id: 4,
        name: "presse",
        imagePath: "presse/logos/"
    },
    articles: {
        id: 5,
        name: "articles",
        imagePath: "presse/articles/"
    },
    hebergements: {
        id: 6,
        name: "hebergements",
        imagePath: "hebergement/"
    },
    moto: {
        id: 7,
        name: "moto",
        imagePath: "moto/"
    }
};
