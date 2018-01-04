(function () {
    "use strict";

    angular
        .module("app.hebergements")
        .controller("HebergementController", HebergementController);

    HebergementController.$inject = ["$scope", "$modal", "hebergementsFactory", "apiFactory", "DELETE_MODAL_URL", "firebaseFactory"];
    function HebergementController($scope, $modal, hebergementsFactory, apiFactory, DELETE_MODAL_URL, firebaseFactory) {
        var vm = this;
        vm.pageClass = "category";
        vm.uploading = false;
        vm.category = categories.hebergements;
        vm.imageFullPath = sharedImgPath + vm.category.imagePath;

        $scope.commitHebergement = commitHebergement;
        $scope.onFileSelectHebergement = onFileSelectHebergement;
        $scope.deleteImageHebergement = deleteImageHebergement;

        vm.initNewHebergement = initNewHebergement;
        vm.initModifyHebergement = initModifyHebergement;
        vm.initDeleteHebergement = initDeleteHebergement;

        activate();

        ///////////////////

        function activate() {
            vm.hebergements = firebaseFactory.hebergements;
        }

        /**
         * Redirige vers la création ou la modification de l'hébergement en fonction du type de modal
         */
        function commitHebergement() {
            if ($scope.modalForm.modalType == formType.creation) {
                addHebergement(this);
            } else if ($scope.modalForm.modalType == formType.modification) {
                modifyHebergement(this);
            }
        }

        function hebergementCallback(hebergementRef, modal) {
            hebergementsFactory.modifyPriority(hebergementRef);
            modal.$hide();
        }

        /**
         * Réinitialise la variable newHebergement
         */
        function initNewHebergement() {
            vm.uploadErrors = null;
            $scope.newHebergement = {
                active: true
            };

            $scope.modalForm = {
                modalType: formType.creation,
                title: "Ajouter un nouvel hébergement",
                action: "Ajouter l'hébergement"
            };

            var addHebergementModal = $modal(new Modal("/adm/src/app/hebergements/hebergement.modal.html", $scope));
            addHebergementModal.$promise.then(addHebergementModal.show);
        }

        /**
         * Appelée lors du submit de l'ajout d'un hébergement
         * @param {Object} modal - Référence à la modal à fermer
         */
        function addHebergement(modal) {
            completeLinks($scope.newHebergement);

            var promise = hebergementsFactory.add($scope.newHebergement);
            promise.then(function (ref) {
                hebergementCallback(ref, modal);
            });
        }

        /**
         * Récupère l'hébergement à modifier et l'injecte dans newHebergement pour le modifier dans la modal
         * @param {Object} hebergement - Hébergement destiné à être modifié
         */
        function initModifyHebergement(hebergement) {
            vm.uploadErrors = null;
            $scope.newHebergement = hebergementsFactory.hebergementObjectById(hebergement.$id);
            $scope.newHebergement.$loaded().then(function () {
                vm.imageToUpdate = hebergement.image;
                $scope.modalForm = {
                    modalType: formType.modification,
                    title: "Modifier un hébergement existant",
                    action: "Valider les modifications"
                };

                sliceLinks($scope.newHebergement);
                var modifyHebergementModal = $modal(new Modal("/adm/src/app/hebergements/hebergement.modal.html", $scope));
                modifyHebergementModal.$promise.then(modifyHebergementModal.show);
            });
        }

        /**
         * Appelée lors du submit de la modification d'un hébergement
         * @param {Object} modal - Référence à la modal à fermer
         */
        function modifyHebergement(modal) {
            completeLinks($scope.newHebergement);

            var promise = hebergementsFactory.update($scope.newHebergement);
            promise.then(function (ref) {
                hebergementCallback(ref, modal);
            });
        }

        function initDeleteHebergement(hebergement) {
            vm.hebergementToDelete = hebergement;
            $scope.submitModalForm = removeHebergement;

            var modalInfos = {
                scope: $scope,
                templateUrl: DELETE_MODAL_URL,
                title: "Supprimer un hébergement",
                html: true,

                // Syntaxe template strings ES6
                content: `<p>Attention, vous allez supprimer l'hébergement "${hebergement.name}". Vous pouvez simplement le désactiver si vous préférez.</p>
                          <p>Cliquez sur "Supprimer" pour valider.</p>`
            };

            var confirmDeleteHebergementModal = $modal(modalInfos);
            confirmDeleteHebergementModal.$promise.then(confirmDeleteHebergementModal.show);
        }

        /**
         * Appelée lors de la validation de la suppression d'un hébergement
         */
        function removeHebergement() {
            var that = this;

            var promise = hebergementsFactory.remove(vm.hebergementToDelete);
            promise.then(function (ref) {
                that.$hide();
            });
        }

        /**
         * Uploade une ou plusieurs images vers le serveur puis les ajoute à Firebase
         * @param {Object[]} $files - Liste d'un ou plusieurs fichiers à uploader
         */
        function onFileSelectHebergement($files) {
            var dataToSend = {
                path: vm.category.imagePath,
                id: $scope.newHebergement.name
            };

            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                vm.uploading = true;

                var promise = apiFactory.addImage(dataToSend, file);
                promise.progress(function (evt) {
                    console.log("percent: " + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    var timestamp = "?" + new Date().getTime();

                    $scope.newHebergement.image = data.filename;
                    vm.imageToUpdate = $scope.newHebergement.image + timestamp;
                    vm.uploading = false;

                }).error(function (data) {
                    vm.uploadErrors = data;
                    vm.uploading = false;
                });
            }
        }

        /**
         * Supprime une image du serveur et de firebase
         * @param {string} file - Nom du fichier à supprimer
         */
        function deleteImageHebergement(file) {
            var promise = apiFactory.deleteImage(file, vm.category.imagePath);

            promise.then(null, function (httpResponse) {
                vm.uploadErrors = httpResponse;
            }).finally(function () {
                hebergementsFactory.removeImage($scope.newHebergement);
            });
        }
    }

})();
