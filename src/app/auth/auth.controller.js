(function () {
    "use strict";

    angular
        .module("app.auth")
        .controller("AuthController", AuthController);

    AuthController.$inject = ["authFactory", "$location", "$routeParams", "$scope", "redirectToUrlAfterLogin"];
    function AuthController(authFactory, $location, $routeParams, $scope, redirectToUrlAfterLogin) {
        var vm = this;
        var args = $location.search();
        vm.userForm = {
            type: "login"
        };

        vm.switchLoginAction = switchLoginAction;
        vm.loginWithPassword = loginWithPassword;
        vm.createAccount = createAccount;
        vm.logOut = logOut;
        vm.getRemind = getRemind;
        vm.resetPassword = resetPassword;

        activate();

        ///////////////////////////////////

        //Set le titre de la page "mot de passe oublié" (en cas de réinitalisation forcée)
        function activate() {
            //TODO: Gérer le titre pour toutes les catégories
            switch (args.reinit) {
                case "true":
                    vm.formTitle = "Réinitialisation";
                    break;
                default:
                    vm.formTitle = "Mot de passe oublié";
            }
        }

        function setMailErrors (val) {
            for (var i = 0; i < val.length; i++)
            {
                switch (val[i])
                {
                    case "validation.unique":
                        vm.serverResult.data.push("L'adresse mail utilisée est déjà associée à un compte");
                        break;
                    case "validation.required":
                        vm.serverResult.data.push("L'adresse mail est requise");
                        break;
                    default:
                        vm.serverResult.data.push("L'adresse mail n'est pas valide");
                }
            }
        }

        function switchLoginAction() {
            delete vm.serverResult;
            if (vm.userForm.type == "creation") {
                createAccount();
            } else {
                loginWithPassword();
            }
        }

        /**
         * Identifie l'utilisateur auprès du serveur puis auprès de Firebase une fois le token récupéré
         */
        function loginWithPassword() {
            delete vm.serverResult;

            authFactory
                .loginWithPassword({ email: vm.userForm.mail, password: vm.userForm.password })
                .then(function (data) {
                    $location.path(redirectToUrlAfterLogin);
                    redirectToUrlAfterLogin = "/";
                })
                .catch(function (error) {
                    vm.serverResult = {
                        type: "error",
                        data: []
                    };

                    angular.forEach(error.data, function(val, key) {
                        if (key == "rights") {
                            vm.serverResult.data.push("Votre compte n'a pas été validé pour l'instant");
                        } else if (key == "credentials") {
                            vm.serverResult.data.push("Adresse mail et/ou mot de passe invalide");
                        }
                    });
                });
        }

        /**
         * Envoie les infos nécessaires au serveur pour la création d'un compte
         */
        function createAccount() {
            delete vm.serverResult;

            authFactory
                .createAccount({
                    email: vm.userForm.mail,
                    password: vm.userForm.password,
                    password_confirmation: vm.userForm.passwordConfirmation })
                .then(function (response) {
                    vm.serverResult = {
                        type: "success"
                    };
                })
                .catch(function (error) {
                    vm.serverResult = {
                        type: "error",
                        data: []
                    };

                    angular.forEach(error.data, function(val, key) {
                        if (key == "email") {
                            setMailErrors(val);
                        }

                        if (key == "password") {
                            vm.serverResult.data.push("Le mot de passe doit avoir une longueur comprise entre 8 et 15 caractères avec au moins une majuscule et un chiffre");
                        }
                    });
                });
        }

        /**
         * Déconnecte l'utilisateur du serveur puis de Firebase
         */
        function logOut() {
            authFactory.logOut();
        }

        /**
         * Demande l'envoi d'un mail de réinitialisation du mot de passe au serveur
         */
        function getRemind() {
            delete vm.serverResult;

            authFactory
                .getReminderMail(vm.forgotPassword.mail)
                .then(function (response) {
                    vm.serverResult = {
                        type: "success"
                    };
                })
                .catch(function (error) {
                    vm.serverResult = {
                        type: "error",
                        data: []
                    };

                    vm.serverResult.data.push("Erreur interne au serveur");
                });
        }

        /**
         * Envoie le nouveau mot de passe au serveur
         */
        function resetPassword() {
            delete vm.serverResult;

            vm.passwordForm.token = $routeParams.token;

            authFactory
                .resetPassword(vm.passwordForm)
                .then(function (response) {
                    vm.serverResult = {
                        type: "success"
                    };
                })
                .catch(function (error) {
                    vm.serverResult = {
                        type: "error",
                        data: []
                    };

                    if (error.data == "'reminders.token'") {
                        vm.serverResult.data.push("L'adresse mail est incorrecte ou la validité du lien de réinitialisation est dépassée.");
                        return;
                    }

                    angular.forEach(error.data, function(val, key) {
                        if (key == "email") {
                            vm.serverResult.data.push("Erreur interne : vérifiez votre adresse mail");
                        } else if (key == "password") {
                            vm.serverResult.data.push("Le mot de passe doit avoir une longueur comprise entre 8 et 15 caractères avec au moins une majuscule et un chiffre");
                        } else {
                            vm.serverResult.data.push("Erreur interne au serveur");
                        }
                    });
                });
        }
    }

})();
