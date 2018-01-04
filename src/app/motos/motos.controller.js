(function () {
    "use strict";

    angular
        .module("app.motos")
        .controller("MotosController", MotosController);

    MotosController.$inject = ["$scope", "$modal", "apiFactory", "motosFactory", "editionsFactory", "DELETE_MODAL_URL", "firebaseFactory"];
    function MotosController($scope, $modal, apiFactory, motosFactory, editionsFactory, DELETE_MODAL_URL, firebaseFactory) {
        var vm = this;
        vm.pageClass = "category";
        vm.uploading = false;
        vm.category = categories.moto;
        vm.logoFullPath = sharedImgPath + vm.category.imagePath;
        vm.motoType = ["Exposant", "Marchand", "Préparateur"];

        $scope.commitMoto = commitMoto;
        $scope.onFileSelectMoto = onFileSelectMoto;
        $scope.deleteMotoImage = deleteMotoImage;

        vm.initNewMoto = initNewMoto;
        vm.initModifyMoto = initModifyMoto;
        vm.initDeleteMoto = initDeleteMoto;

        activate();

        ///////////////////

        function activate() {
            vm.motos = firebaseFactory.motos;
            vm.editions = firebaseFactory.editions;
        }

        /**
         * S'assure que les liens commencent bien par http://
         */
        function preparationMoto() {
            completeLinks($scope.newMoto);
            $scope.newMoto.editions = {};

            angular.forEach($scope.modalForm.motoEditions, function (val, key) {
                $scope.newMoto.editions[val.$id] = true;
            });
        }

        function motoCallback(motoRef, modal) {
            motosFactory.modifyPriority(motoRef);
            var moto = motosFactory.getByKey(motoRef.key());
            editionsFactory.updateEditionsForMoto(moto);
            modal.$hide();
        }

        /**
         * Redirige vers la création ou la modification du stand moto en fonction du type de modal
         */
        function commitMoto() {
            if ($scope.modalForm.modalType == formType.creation) {
                addMoto(this);
            } else if ($scope.modalForm.modalType == formType.modification) {
                modifyMoto(this);
            }
        }

        /**
         * Réinitialise la variable newMoto
         */
        function initNewMoto() {
            vm.uploadErrors = null;
            $scope.newMoto = {};
            $scope.modalForm = {
                motoType: vm.motoType,
                modalType: formType.creation,
                title: "Ajouter un nouveau stand moto",
                action: "Ajouter le stand"
            };

            var addMotoModal = $modal(new Modal("/adm/src/app/motos/moto.modal.html", $scope));
            addMotoModal.$promise.then(addMotoModal.show);
        }

        /**
         * Appelée lors du submit de l'ajout d'un stand moto
         * @param {Object} modal - Référence à la modal à fermer
         */
        function addMoto(modal) {
            preparationMoto();

            var promise = motosFactory.add($scope.newMoto);
            promise.then(function (ref) {
                motoCallback(ref, modal);
            });
        }

        /**
         * Récupère le stand moto à modifier et l'injecte dans newMoto pour le modifier dans la modal
         * @param {Object} moto - Exposant/artisan moto destiné à être modifié
         */
        function initModifyMoto(moto) {
            vm.uploadErrors = null;
            $scope.newMoto = motosFactory.motoObjectById(moto.$id);
            $scope.newMoto.$loaded().then(function () {
                $scope.modalForm = {
                    motoEditions: [],
                    motoType: vm.motoType,
                    modalType: formType.modification,
                    title: "Modifier un stand moto existant",
                    action: "Valider les modifications"
                };

                angular.forEach($scope.newMoto.editions, function (val, key) {
                    var t = editionsFactory.getByKey(key);
                    $scope.modalForm.motoEditions.push(t);
                });

                sliceLinks($scope.newMoto);
                vm.motoLogoToUpdate = moto.logo;

                var modifyMotoModal = $modal(new Modal("/adm/src/app/motos/moto.modal.html", $scope));
                modifyMotoModal.$promise.then(modifyMotoModal.show);
            });
        }

        /**
         * Appelée lors du submit de la modification d'un stand moto
         * @param {Object} modal - Référence à la modal à fermer
         */
        function modifyMoto(modal) {
            //On supprime les années enlevées
            editionsFactory.removeMotoFromEditions($scope.newMoto, $scope.modalForm.motoEditions);

            preparationMoto();
            var promise = motosFactory.update($scope.newMoto);
            promise.then(function (ref) {
                motoCallback(ref, modal);
            });
        }

        function initDeleteMoto(moto) {
            vm.motoToDelete = moto;
            $scope.submitModalForm = removeMoto;

            var modalInfos = {
                scope: $scope,
                templateUrl: DELETE_MODAL_URL,
                title: "Supprimer un stand moto",
                html: true,

                // Syntaxe template strings ES6
                content: `<p>Attention, vous allez supprimer le stand "${moto.name}".</p>
                          <p>Cliquez sur "Supprimer" pour valider.</p>`
            };

            var confirmDeleteMotoModal = $modal(modalInfos);
            confirmDeleteMotoModal.$promise.then(confirmDeleteMotoModal.show);
        }

        /**
         * Appelée lors de la validation de la suppression d'un moto
         */
        function removeMoto() {
            var that = this;

            var promise = motosFactory.remove(vm.motoToDelete);
            promise.then(function (ref) {
                //On supprime dans les années concernées
                editionsFactory.updateEditionsAfterMotoRemove(vm.motoToDelete);
                that.$hide();
            });
        }

        /**
         * Uploade une ou plusieurs images vers le serveur puis les ajoute à Firebase
         * @param {Object[]} $files - Liste d'un ou plusieurs fichiers à uploader
         */
        function onFileSelectMoto($files) {
            var dataToSend = {
                path: vm.category.imagePath,
                id: $scope.newMoto.name
            };

            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                vm.uploading = true;

                var promise = apiFactory.addImage(dataToSend, file);
                promise
                    .progress(function (evt) {
                        console.log("percent: " + parseInt(100.0 * evt.loaded / evt.total));
                    })
                    .success(function (data, status, headers, config) {
                        var timestamp = "?" + new Date().getTime();

                        $scope.newMoto.logo = data.filename;
                        vm.motoLogoToUpdate = $scope.newMoto.logo + timestamp;

                        vm.uploading = false;
                    })
                    .error(function (data) {
                        vm.uploadErrors = data;
                        vm.uploading = false;
                    });
            }
        }

        /**
         * Supprime une image du serveur et de firebase
         * @param {string} file - Nom du fichier à supprimer
         */
        function deleteMotoImage(file) {
            var path = vm.category.imagePath;

            var promise = apiFactory.deleteImage(file, path);
            promise.then(null, function (httpResponse) {
                vm.uploadErrors = httpResponse;
            }).finally(function () {
                motosFactory.removeLogo($scope.newMoto);
            });
        }
    }

})();
