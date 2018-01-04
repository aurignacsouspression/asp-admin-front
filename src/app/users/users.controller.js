(function () {
    "use strict";

    angular
        .module("app.users")
        .controller("UsersController", UsersController);

    UsersController.$inject = ["$scope", "$modal", "apiFactory", "DELETE_MODAL_URL"];
    function UsersController($scope, $modal, apiFactory, DELETE_MODAL_URL) {
        var vm = this;
        vm.pageClass = "category";

        vm.initModifyUser = initModifyUser;
        $scope.updateUser = updateUser;
        vm.updateRights = updateRights;
        vm.initDeleteUser = initDeleteUser;

        activate();

        ///////////////////////

        function activate() {
            loadUsers();
        }

        /**
         * Charge la liste des utilisateurs
         */
        function loadUsers() {
            vm.rightsList = userRights;
            var promise = apiFactory.getUsers();
            promise.then(function (users) {
                vm.users = [];
                for (var i = 0; i < users.length; i++) {
                    vm.users.push(users[i]);
                }
            });
        }

        /**
         * Charge l'utilisateur sélectionné pour modification puis affiche la modal
         */
        function initModifyUser(user) {
            delete vm.serverResult;
            apiFactory.getUser(user.id)
                .then(function (data) {
                    vm.selectedUser = data;
                    var modifyUserModal = $modal(new Modal("/adm/src/app/users/user.modal.html", $scope));
                    modifyUserModal.$promise.then(modifyUserModal.show);
                })
                .catch(function (data) {
                    vm.serverResult = {
                        data: data
                    };
                });
        }

        /**
         * Envoie l'utilisateur modifié au serveur pour sauvegarde
         */
        function updateUser() {
            vm.serverResult = {
                data: []
            };

            var emailFound = false;
            angular.forEach(vm.users, function (val, key) {
                if (!emailFound && val.email == vm.selectedUser.email && val.id != vm.selectedUser.id) {
                    vm.serverResult.data.push("L'adresse mail est associée à une autre compte !");
                    emailFound = true;
                }
            });

            if (emailFound == true) {
                return;
            }
            var modal = this;
            apiFactory.updateUser(vm.selectedUser)
                .then(function (data) {
                    loadUsers();
                    modal.$hide();
                })
                .catch(function (json) {
                    angular.forEach(json.data, function (val, key) {
                        if (key == "email") {
                            setMailErrors(val);
                        }
                        if (key == "rights") {
                            vm.serverResult.data.push("Erreur au niveau de l'attribution des droits");
                        }
                    });
                });
        }

        /**
         * Appelé lors de la modification des droits dans la liste des utilisateurs
         */
        function updateRights(user) {
            delete vm.serverTableResult;
            apiFactory.updateUser(user)
                .then(function (data) {
                    loadUsers();
                })
                .catch(function (json) {
                    angular.forEach(json.data, function (val, key) {
                        if (key == "rights") {
                            vm.serverTableResult = "Erreur au niveau de l'attribution des droits";
                        }
                    });
                });
        }

        /**
         * Affiche la modal de confirmation de suppression d'un utilisateur
         */
        function initDeleteUser(user) {
            vm.userToDelete = user;
            $scope.submitModalForm = removeUser;

            var modalInfos = {
                templateUrl: DELETE_MODAL_URL,
                title: "Supprimer un utilisateur",
                html: true,
                scope: $scope,

                // Syntaxe template strings ES6
                content: `<p>Attention, vous allez supprimer l'utilisateur "${user.email}".</p>
                          <p>Cliquez sur "Supprimer" pour valider.</p>`
            };

            var confirmDeleteUserModal = $modal(modalInfos);
            confirmDeleteUserModal.$promise.then(confirmDeleteUserModal.show);
        }

        /**
         * Appelée lors de la validation de la suppression d'un utilisateur
         */
        function removeUser() {
            apiFactory.deleteUser(vm.userToDelete.id)
                .then(function (data) {
                    vm.users.splice(vm.users.indexOf(vm.userToDelete), 1);
                    this.$hide();
                }.bind(this));
        }

        //TODO: doublon avec la même fonction dans AuthController
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
    }

})();
