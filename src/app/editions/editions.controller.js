(function () {
    "use strict";

    angular
        .module("app.editions")
        .controller("EditionsController", EditionsController);

    EditionsController.$inject = ["$scope", "$modal", "editionsFactory", "brasseursFactory", "motosFactory", "pressArticlesFactory", "DELETE_MODAL_URL", "firebaseFactory"];
    function EditionsController($scope, $modal, editionsFactory, brasseursFactory, motosFactory, pressArticlesFactory, DELETE_MODAL_URL, firebaseFactory) {
        var vm = this;
        vm.pageClass = "category";
        vm.uploading = false;
        vm.category = categories.editions;

        $scope.editionFullPath = sharedImgPath + vm.category.imagePath;

        vm.initNewEdition = initNewEdition;
        vm.initModifyEdition = initModifyEdition;
        vm.initDeleteEdition = initDeleteEdition;

        activate();

        ///////////////////

        function activate() {
            vm.editions = firebaseFactory.editions;
        }

        /**
         * Réinitialise la variable newEdition
         */
        function initNewEdition() {
            vm.uploadErrors = null;
            $scope.newEdition = {};
            $scope.modalForm = {
                modalType: formType.creation,
                title: "Ajouter une nouvelle édition",
                action: "Ajouter l'édition"
            };

            // var addEditionModal = $modal(new Modal("/adm/src/app/editions/edition.modal.html", $scope));
            var addEditionModal = $modal({
                scope: $scope,
                content: "Chargement en cours",
                container: "body",
                templateUrl: "/adm/src/app/editions/edition.modal.html",
                html: true,
                animation: "am-fade-and-slide-top",
                show: false,
                controller: ModalController,
                controllerAs: "modal"
            });
            addEditionModal.$promise.then(addEditionModal.show);
        }

        /**
         * Récupère l'édition à modifier et l'injecte dans newEdition pour le modifier dans la modal
         * @param {Object} edition - Edition destinée à être modifié
         */
        function initModifyEdition(edition) {
            vm.uploadErrors = null;
            $scope.newEdition = editionsFactory.editionObjectById(edition.$id);
            $scope.newEdition.$loaded().then(function () {
                $scope.modalForm = {
                    editionBrasseurs: [],
                    modalType: formType.modification,
                    title: "Modifier une édition existante",
                    action: "Valider les modifications"
                };

                angular.forEach($scope.newEdition.brasseurs, function (val, key) {
                    $scope.modalForm.editionBrasseurs.push(brasseursFactory.getBrasseurByKey(key));
                });

                $scope.editionA3ToUpdate = edition.a3;

                var modifyEditionModal = $modal({
                    scope: $scope,
                    content: "Chargement en cours",
                    container: "body",
                    templateUrl: "/adm/src/app/editions/edition.modal.html",
                    html: true,
                    animation: "am-fade-and-slide-top",
                    show: false,
                    controller: ModalController,
                    controllerAs: "modal"
                });
                modifyEditionModal.$promise.then(modifyEditionModal.show);
            });
        }

        function initDeleteEdition(edition) {
            vm.editionToDelete = edition;
            $scope.submitModalForm = removeEdition;

            var modalInfos = {
                scope: $scope,
                templateUrl: DELETE_MODAL_URL,
                title: "Supprimer une édition",
                html: true,

                // Syntaxe template strings ES6
                content: `<p>Attention, vous allez supprimer l'édition "${edition.year}".</p>
                          <p>Cliquez sur "Supprimer" pour valider.</p>`
            };

            var confirmDeleteEditionModal = $modal(modalInfos);
            confirmDeleteEditionModal.$promise.then(confirmDeleteEditionModal.show);
        }

        /**
         * Supprime de firebase l'édition sélectionnée
         */
        function removeEdition() {
            var that = this;

            var promise = editionsFactory.remove(vm.editionToDelete);
            promise.then(function (ref) {
                //On supprime les années dans les brasseurs et exposants motos si besoin
                brasseursFactory.updateBrasseursAfterEditionRemove(vm.editionToDelete);
                motosFactory.updateAfterEditionRemoval(vm.editionToDelete);
                pressArticlesFactory.updateArticlesAfterEditionRemoval(vm.editionToDelete);
                that.$hide();
            });
        }
    }

    ModalController.$inject = ["$scope", "editionsFactory", "brasseursFactory", "firebaseFactory", "apiFactory"];
    function ModalController($scope, editionsFactory, brasseursFactory, firebaseFactory, apiFactory) {
        var vm = this;
        vm.category = categories.editions;

        vm.onFileSelectEdition = onFileSelectEdition;
        vm.deleteImageEdition = deleteImageEdition;
        vm.commitEdition = commitEdition;

        activate();

        ///////////////////

        function activate() {
            vm.brasseurs = firebaseFactory.brasseurs;
        }

        /**
         * Redirige vers la création ou la modification de l'édition en fonction du type de modal
         */
        function commitEdition() {
            if ($scope.modalForm.modalType == formType.creation) {
                addEdition(this);
            }
            else if ($scope.modalForm.modalType == formType.modification) {
                modifyEdition(this);
            }
        }

        /**
         * Modifie la priorité de l'édition ajoutée/modifiée et met à jour les brasseries concernées
         * @param {string} editionRef - Référence Firebase de l'édition modifiée
         */
        function editionCallback(editionRef) {
            editionsFactory.modifyPriority(editionRef);
            var edition = editionsFactory.getByKey(editionRef.key());
            brasseursFactory.updateBrasseursForEdition(edition);
            $scope.$hide();
        }

        /**
         * Appelée lors du submit d'une nouvelle édition
         */
        function addEdition() {
            preparationEdition();

            var promise = editionsFactory.add($scope.newEdition);
            promise.then(function (ref) {
                editionCallback(ref);
            });
        }

        /**
         * Sauve les modifications effectuées sur une édition
         */
        function modifyEdition() {
            //On supprime les années dans les brasseurs si besoin
            brasseursFactory.removeEditionFromBrasseurs($scope.newEdition, $scope.modalForm.editionBrasseurs);
            preparationEdition();
            var promise = editionsFactory.update($scope.newEdition);
            promise.then(function (ref) {
                editionCallback(ref);
            });
        }

        function preparationEdition() {
            $scope.newEdition.brasseurs = {};

            //On (ré)écrit les brasseurs participants dans l'édition créée/modifiée
            angular.forEach($scope.modalForm.editionBrasseurs, function (val, key) {
                $scope.newEdition.brasseurs[val.$id] = true;
            });
        }

        /**
         * Uploade une ou plusieurs images vers le serveur puis les ajoute à Firebase
         * @param {Object[]} $files - Liste d'un ou plusieurs fichiers à uploader
         */
        function onFileSelectEdition($files) {
            var dataToSend = {
                path: vm.category.imagePath,
                id: $scope.newEdition.year
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

                    $scope.newEdition.a3 = data.filename;
                    $scope.editionA3ToUpdate = $scope.newEdition.a3 + timestamp;

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
        function deleteImageEdition(file) {
            var path = vm.category.imagePath;

            var promise = apiFactory.deleteImage(file, path);
            promise.then(null, function (httpResponse) {
                vm.uploadErrors = httpResponse;
            }).finally(function () {
                editionsFactory.removeAffiche($scope.newEdition);
            });
        }
    }

})();
