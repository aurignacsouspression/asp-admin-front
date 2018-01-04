(function () {
    "use strict";

    angular
        .module("app.brasseurs")
        .controller("BrasseursController", BrasseursController);

    BrasseursController.$inject = ["$scope", "$modal", "brasseursFactory", "editionsFactory", "apiFactory", "DELETE_MODAL_URL", "firebaseFactory"];
    function BrasseursController($scope, $modal, brasseursFactory, editionsFactory, apiFactory, DELETE_MODAL_URL, firebaseFactory) {
        var vm = this;
        vm.pageClass = "category";
        vm.uploading = false;
        vm.category = categories.brasseurs;

        vm.initNewBrasseur = initNewBrasseur;
        vm.initModifyBrasseur = initModifyBrasseur;
        vm.initDeleteBrasseur = initDeleteBrasseur;

        $scope.commitBrasseur = commitBrasseur;
        $scope.onFileSelectBrasseur = onFileSelectBrasseur;
        $scope.deleteBrasseurImage = deleteBrasseurImage;
        $scope.logoFullPath = sharedImgPath + vm.category.imagePath + "logos/";

        activate();

        ///////////////////

        function activate() {
            vm.brasseurs = firebaseFactory.brasseurs;
            vm.editions = firebaseFactory.editions;
        }

        function preparationBrasseur() {
            $scope.newBrasseur.editions = {};
            completeLinks($scope.newBrasseur);

            angular.forEach($scope.modalForm.brasseurEditions, function (val, key) {
                $scope.newBrasseur.editions[val.$id] = true;
            });
        }

        /**
         * Redirige vers la création ou la modification de la brasserie en fonction du type de modal
         */
        function commitBrasseur() {
            if ($scope.modalForm.modalType == formType.creation) {
                addBrasseur(this);
            }
            else if ($scope.modalForm.modalType == formType.modification) {
                modifyBrasseur(this);
            }
        }

        function brasseurCallback(brasseurRef, modal) {
            brasseursFactory.modifyPriority(brasseurRef);
            var brasseur = brasseursFactory.getBrasseurByKey(brasseurRef.key());
            editionsFactory.updateEditionsForBrasseur(brasseur);
            modal.$hide();
        }

        /**
         * Réinitialise la variable newBrasseur
         */
        function initNewBrasseur() {
            vm.uploadErrors = null;
            $scope.newBrasseur = {};
            $scope.modalForm = {
                modalType: formType.creation,
                title: "Ajouter un nouveau brasseur",
                action: "Ajouter la brasserie"
            };

            var addBrasseurModal = $modal(new Modal("/adm/src/app/brasseurs/brasseur.modal.html", $scope));
            addBrasseurModal.$promise.then(addBrasseurModal.show);
        }

        /**
         * Récupère le brasseur à modifier et l'injecte dans newBrasseur pour le modifier dans la modal
         * @param {Object} brasseur - Brasseur destiné à être modifié
         */
        function initModifyBrasseur(brasseur) {
            vm.uploadErrors = null;
            $scope.newBrasseur = brasseursFactory.brasseurObjectById(brasseur.$id);
            $scope.newBrasseur.$loaded().then(function () {
                $scope.modalForm = {
                    brasseurEditions: [],
                    modalType: formType.modification,
                    title: "Modifier un brasseur existant",
                    action: "Valider les modifications"
                };

                angular.forEach($scope.newBrasseur.editions, function (val, key) {
                    $scope.modalForm.brasseurEditions.push(editionsFactory.getByKey(key));
                });

                sliceLinks($scope.newBrasseur);
                $scope.brasseurLogoToUpdate = brasseur.logo;

                var modifyBrasseurModal = $modal(new Modal("/adm/src/app/brasseurs/brasseur.modal.html", $scope));
                modifyBrasseurModal.$promise.then(modifyBrasseurModal.show);
            });
        }

        /**
         * Appelée lors du submit de l'ajout d'un brasseur
         * @param {Object} modal - Référence à la modal à fermer
         */
        function addBrasseur(modal) {
            preparationBrasseur();

            var promise = brasseursFactory.add($scope.newBrasseur);
            promise.then(function (ref) {
                brasseurCallback(ref, modal);
            });
        }

        /**
         * Appelée lors du submit de la modification d'un brasseur
         * @param {Object} modal - Référence à la modal à fermer
         */
        function modifyBrasseur(modal) {
            //On supprime les années dans les brasseurs si besoin
            editionsFactory.removeBrasseurFromEditions($scope.newBrasseur, $scope.modalForm.brasseurEditions);

            preparationBrasseur();
            var promise = brasseursFactory.update($scope.newBrasseur);
            promise.then(function (ref) {
                brasseurCallback(ref, modal);
            });
        }

        function initDeleteBrasseur(brasseur) {
            vm.brasseurToDelete = brasseur;
            $scope.submitModalForm = removeBrasseur;

            var modalInfos = {
                scope: $scope,
                templateUrl: DELETE_MODAL_URL,
                title: "Supprimer un brasseur",
                html: true,

                // Syntaxe template strings ES6
                content: `<p>Attention, vous allez supprimer la brasserie "${brasseur.name}".</p>
                          <p>Cliquez sur "Supprimer" pour valider.</p>`
            };

            var confirmDeleteBrasseurModal = $modal(modalInfos);
            confirmDeleteBrasseurModal.$promise.then(confirmDeleteBrasseurModal.show);
        }

        /**
         * Appelée lors de la validation de la suppression d'un brasseur
         */
        function removeBrasseur() {
            var that = this;

            var promise = brasseursFactory.remove(vm.brasseurToDelete);//removeBrasseur
            promise.then(function (ref) {
                //On supprime les années dans les brasseurs si besoin
                editionsFactory.updateEditionsAfterBrasseurRemove(vm.brasseurToDelete);
                that.$hide();
            });
        }

        /**
         * Uploade une ou plusieurs images vers le serveur puis les ajoute à Firebase
         * @param {Object[]} $files - Liste d'un ou plusieurs fichiers à uploader
         */
        function onFileSelectBrasseur($files) {
            var dataToSend = {
                path: vm.category.imagePath + "logos/",
                id: $scope.newBrasseur.name
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

                    $scope.newBrasseur.logo = data.filename;
                    $scope.brasseurLogoToUpdate = $scope.newBrasseur.logo + timestamp;

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
        function deleteBrasseurImage(file) {
            var path = vm.category.imagePath + "logos/";

            var promise = apiFactory.deleteImage(file, path);
            promise.then(null, function (httpResponse) {
                vm.uploadErrors = httpResponse;
            }).finally(function () {
                brasseursFactory.removeAfficheBrasseur($scope.newBrasseur);
            });
        }
    }

})();
