(function () {
    "use strict";

    angular
        .module("app.partenaires")
        .controller("PartenairesController", PartenairesController);

    PartenairesController.$inject = ["$scope", "$modal", "apiFactory", "partenairesFactory", "DELETE_MODAL_URL", "firebaseFactory"];
    function PartenairesController($scope, $modal, apiFactory, partenairesFactory, DELETE_MODAL_URL, firebaseFactory) {
        var vm = this;
        vm.pageClass = "category";
        vm.uploading = false;
        vm.category = categories.partenaires;
        vm.pubFullPath = sharedImgPath + vm.category.imagePath;
        vm.encartSize = ["Page entière", "1/2 page", "1/4 page"];

        $scope.commitPartenaire = commitPartenaire;
        $scope.onFileSelectPartenaire = onFileSelectPartenaire;

        vm.switchDeleteImagePartenaire = switchDeleteImagePartenaire;
        vm.initNewPartenaire = initNewPartenaire;
        vm.initModifyPartenaire = initModifyPartenaire;
        vm.modifyPartenaire = modifyPartenaire;
        vm.initDeletePartenaire = initDeletePartenaire;

        activate();

        ///////////////////

        function activate() {
            vm.partenaires = firebaseFactory.partenaires;
        }

        function partenaireCallback(partenaireRef, modal) {
            partenairesFactory.modifyPriority(partenaireRef);
            modal.$hide();
        }

        /**
         * Redirige vers la création ou la modification du partenaire en fonction du type de modal
         */
        function commitPartenaire() {
            if ($scope.modalForm.modalType == formType.creation) {
                addPartenaire(this);
            }
            else if ($scope.modalForm.modalType == formType.modification) {
                modifyPartenaire(this);
            }
        }

        function switchDeleteImagePartenaire(pubType) {
            $scope.modalForm.button = pubType;
            deleteImagePartenaire($scope.newPartenaire[pubType]);
        }

        function switchSizeWatch() {
            vm.sizeWatch && vm.sizeWatch();
            vm.sizeWatch = $scope.$watch("newPartenaire.size", function (newValue, oldValue) {
                if (typeof $scope.newPartenaire === "undefined" || !$scope.newPartenaire.pub || typeof oldValue === "undefined" || oldValue == newValue) {
                    return;
                }

                deleteImagePartenaire($scope.newPartenaire.pub, oldValue);
                delete $scope.newPartenaire.pub;
            });
        }

        /**
         * Réinitialise la variable newPartenaire
         */
        function initNewPartenaire() {
            switchSizeWatch();

            vm.uploadErrors = null;
            $scope.newPartenaire = {
                active: true
            };

            $scope.modalForm = {
                encartSize: vm.encartSize,
                modalType: formType.creation,
                title: "Ajouter un nouveau partenaire",
                action: "Ajouter le partenaire"
            };

            var addPartenaireModal = $modal(new Modal("/adm/src/app/partenaires/partenaire.modal.html", $scope));
            addPartenaireModal.$promise.then(addPartenaireModal.show);
        }

        /**
         * Appelée lors du submit d'un nouveau partenaire
         * @param {Object} modal - Référence à la modal à fermer
         */
        function addPartenaire(modal) {
            sliceLinks($scope.newPartenaire);

            //On sauve les ajouts précédents dans Firebase
            var promise = partenairesFactory.add($scope.newPartenaire);
            promise.then(function (ref) {
                partenaireCallback(ref, modal);
            });
        }

        /**
         * Récupère le partenaire à modifier et l'injecte dans newPartenaire pour le modifier dans la modal
         * @param {Object} partenaire - Partenaire destiné à être modifié
         */
        function initModifyPartenaire(partenaire) {
            switchSizeWatch();

            vm.uploadErrors = null;
            $scope.newPartenaire = partenairesFactory.partenaireObjectById(partenaire.$id);
            $scope.newPartenaire.$loaded().then(function () {
                vm.partenairePubToUpdate = partenaire.pub;
                vm.partenairePubInternetToUpdate = partenaire.pubInternet;

                $scope.modalForm = {
                    encartSize: vm.encartSize,
                    modalType: formType.modification,
                    title: "Modifier un partenaire existant",
                    action: "Valider les modifications"
                };

                sliceLinks($scope.newPartenaire);

                var modifyPartenaireModal = $modal(new Modal("/adm/src/app/partenaires/partenaire.modal.html", $scope));
                modifyPartenaireModal.$promise.then(modifyPartenaireModal.show);
            });
        }

        /**
         * Sauve les modifications effectuées sur un partenaire
         * @param {Object} modal - Référence à la modal à fermer
         */
        function modifyPartenaire(modal) {
            completeLinks($scope.newPartenaire);

            var promise = partenairesFactory.save($scope.newPartenaire);
            promise.then(function (ref) {
                partenaireCallback(ref, modal);
            });
        }

        function initDeletePartenaire(partenaire) {
            vm.partenaireToDelete = partenaire;
            $scope.submitModalForm = removePartenaire;

            var modalInfos = {
                scope: $scope,
                templateUrl: DELETE_MODAL_URL,
                title: "Supprimer un partenaire",
                html: true,

                // Syntaxe template strings ES6
                content: `<p>Attention, vous allez supprimer le partenaire "${partenaire.name}". Vous pouvez simplement le désactiver si vous préférez.</p>
                          <p>Cliquez sur "Supprimer" pour valider.</p>`
            };

            var confirmDeletePartenaireModal = $modal(modalInfos);
            confirmDeletePartenaireModal.$promise.then(confirmDeletePartenaireModal.show);
        }

        /**
         * Supprime de firebase le partenaire sélectionné
         */
        function removePartenaire() {
            var that = this;

            var promise = partenairesFactory.update(vm.partenaireToDelete);
            promise.then(function (ref) {
                that.$hide();
            });
        }

        /**
         * Uploade une ou plusieurs images vers le serveur puis les ajoute à Firebase
         * @param {Object[]} $files - Liste d'un ou plusieurs fichiers à uploader
         */
        function onFileSelectPartenaire($files) {
            var dataToSend = {
                path: vm.category.imagePath,
                id: $scope.newPartenaire.name
            };

            if ($scope.modalForm.button == "pub") {
                dataToSend.suffix = $scope.newPartenaire.size;
                dataToSend.path += $scope.newPartenaire.size + "/";
            } else if ($scope.modalForm.button == "pubInternet") {
                dataToSend.suffix = "internet";
                dataToSend.path += "home/";
            }

            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                vm.uploading = true;

                var promise = apiFactory.addImage(dataToSend, file);
                promise.progress(function (evt) {
                    console.log("percent: " + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    var timestamp = "?" + new Date().getTime();

                    if ($scope.modalForm.button == "pub") {
                        $scope.newPartenaire.pub = data.filename;
                        vm.partenairePubToUpdate = $scope.newPartenaire.pub + timestamp;
                    } else if ($scope.modalForm.button == "pubInternet") {
                        $scope.newPartenaire.pubInternet = data.filename;
                        vm.partenairePubInternetToUpdate = $scope.newPartenaire.pubInternet + timestamp;
                    }

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
         * @param {number} oldSizerPart - Index renvoyant à la liste des tailles disponibles
         */
        function deleteImagePartenaire(file, oldSizePart) {
            var path = vm.category.imagePath;

            if (oldSizePart) {
                path += oldSizePart + "/";
            } else {
                if ($scope.modalForm.button == "pub") {
                    path += $scope.newPartenaire.size + "/";
                } else if ($scope.modalForm.button == "pubInternet") {
                    path += "home/";
                }
            }

            var promise = apiFactory.deleteImage(file, path);
            promise.then(null, function (httpResponse) {
                vm.uploadErrors = httpResponse;
            }).finally(function () {
                if (oldSizePart || $scope.modalForm.button == "pub") {
                    delete $scope.newPartenaire.pub;
                } else if ($scope.modalForm.button == "pubInternet") {
                    delete $scope.newPartenaire.pubInternet;
                }

                partenairesFactory.save($scope.newPartenaire);
            });
        }
    }

})();
