(function () {
    "use strict";

    angular
        .module("app.presse")
        .controller("PresseController", PresseController);

    PresseController.$inject = ["$scope", "$modal", "apiFactory", "editionsFactory", "pressOrgansFactory", "pressArticlesFactory", "firebaseFactory", "DELETE_MODAL_URL"];
    function PresseController($scope, $modal, apiFactory, editionsFactory, pressOrgansFactory, pressArticlesFactory, firebaseFactory, DELETE_MODAL_URL) {
        var vm = this;
        vm.pageClass = "category";
        vm.pressLogoFullPath = sharedImgPath + categories.presse.imagePath;
        vm.articleScanFullPath = sharedImgPath + categories.articles.imagePath;
        vm.uploading = false;

        $scope.commitPressOrgan = commitPressOrgan;
        $scope.commitArticle = commitArticle;
        $scope.onFileSelectPresse = onFileSelectPresse;
        $scope.deleteImagePresse = deleteImagePresse;

        vm.initNewPressOrgan = initNewPressOrgan;
        vm.initModifyPressOrgan = initModifyPressOrgan;
        vm.initDeletePressOrgan = initDeletePressOrgan;

        vm.initNewArticle = initNewArticle;
        vm.initModifyArticle = initModifyArticle;
        vm.initDeleteArticle = initDeleteArticle;

        activate();

        //////////////////////

        function activate() {
            vm.presse = firebaseFactory.presse;
            vm.articles = firebaseFactory.articles;
            vm.editions = firebaseFactory.editions;
        }

        /**
         * Supprime les références à un article de presse
         * @param {Object} article - Article supprimé
         */
        function removeArticleReferences(article) {
            editionsFactory.unlinkArticle(article);
            pressOrgansFactory.unlinkArticle(article);
        }

        /**
         * TITRES DE PRESSE
         */
        vm.pressTabs = [
            {
                title: "Articles",
                content: "Coucou",
                template: "/adm/src/app/presse/articles/presse-articles.html"
            },
            {
                title: "Titres de presse",
                content: "Salut",
                template: "/adm/src/app/presse/titres/presse-titres.html"
            }
        ];
        vm.pressTabs.activeTab = 0;

        function pressOrganCallback(pressOrganRef, modal) {
            pressOrgansFactory.modifyPriority(pressOrganRef);
            modal.$hide();
        }

        /**
         * Redirige vers la création ou la modification du titre de presse en fonction du type de modal
         */
        function commitPressOrgan() {
            if ($scope.modalForm.modalType == formType.creation) {
                addPressOrgan(this);
            } else if ($scope.modalForm.modalType == formType.modification) {
                modifyPressOrgan(this);
            }
        }

        /**
         * Réinitialise la variable newPressOrgan
         */
        function initNewPressOrgan() {
            vm.category = categories.presse;
            vm.imagePath = vm.category.imagePath;

            vm.uploadErrors = null;
            $scope.newPressOrgan = {};
            $scope.modalForm = {
                modalType: formType.creation,
                title: "Ajouter un nouveau titre de presse",
                action: "Ajouter le titre de presse"
            };

            var addPressOrganModal = $modal(new Modal("/adm/src/app/presse/titres/presse-titre.modal.html", $scope));
            addPressOrganModal.$promise.then(addPressOrganModal.show);
        }

        /**
         * Appelée lors du submit de l'ajout d'un titre de presse
         * @param {Object} modal - Référence à la modal à fermer
         */
        function addPressOrgan(modal) {
            completeLinks($scope.newPressOrgan);

            var promise = pressOrgansFactory.add($scope.newPressOrgan);
            promise.then(function (ref) {
                pressOrganCallback(ref, modal);
            });
        }

        /**
         * Récupère le titre à modifier et l'injecte dans newPressOrgan pour le modifier dans la modal
         * @param {Object} press - Titre de presse destiné à être modifié
         */
        function initModifyPressOrgan(press) {
            vm.category = categories.presse;
            vm.imagePath = vm.category.imagePath;
            vm.uploadErrors = null;

            $scope.newPressOrgan = pressOrgansFactory.pressOrganObjectById(press.$id);
            $scope.newPressOrgan.$loaded().then(function () {
                vm.pressLogoToUpdate = press.logo;
                sliceLinks($scope.newPressOrgan);

                $scope.modalForm = {
                    modalType: formType.modification,
                    title: "Modifier un titre de presse existant",
                    action: "Valider les modifications"
                };

                var modifyPressOrganModal = $modal(new Modal("/adm/src/app/presse/titres/presse-titre.modal.html", $scope));
                modifyPressOrganModal.$promise.then(modifyPressOrganModal.show);
            });
        }

        /**
         * Appelée lors du submit de la modification d'un titre de presse
         * @param {Object} modal - Référence à la modal à fermer
         */
        function modifyPressOrgan(modal) {
            completeLinks($scope.newPressOrgan);

            var promise = pressOrgansFactory.update($scope.newPressOrgan);
            promise.then(function (ref) {
                pressOrganCallback(ref, modal);
            });
        }

        function initDeletePressOrgan(press) {
            vm.pressToDelete = press;
            $scope.submitModalForm = removePressOrgan;

            var modalInfos = {
                scope: $scope,
                templateUrl: DELETE_MODAL_URL,
                title: "Supprimer un titre de presse",
                html: true,

                // Syntaxe template strings ES6
                content: `<p>Attention, vous allez supprimer le titre de presse intitulé "${press.name}".</p>
                          <br/>
                          Tous les articles liés seront également supprimés !</p>
                          <p>Cliquez sur "Supprimer" pour valider.</p>`
            };

            var confirmDeletePressOrganModal = $modal(modalInfos);
            confirmDeletePressOrganModal.$promise.then(confirmDeletePressOrganModal.show);
        }

        /**
         * Appelée lors de la validation de la suppression d'un titre de presse
         */
        function removePressOrgan() {
            var that = this;

            var promise = pressOrgansFactory.remove(vm.pressToDelete);
            promise.then(function (ref) {
                //On supprime les articles correspondants si besoin
                angular.forEach(vm.pressToDelete.articles, function (val, key) {
                    var article = pressArticlesFactory.getByKey(key);
                    var promise = pressArticlesFactory.remove(article);
                    promise.then(function (ref) {
                        removeArticleReferences(article);
                    });
                });

                that.$hide();
            });
        }

        /**
         * ARTICLES
         */
        function updatePresseAndYearsForArticle(articleRef) {
            var article = pressArticlesFactory.getByKey(articleRef.key());

            //Une fois l'article sauvé dans Firebase, on ajoute sa key à l'édition concernée
            editionsFactory.updateEditionForArticle(article);

            //Même chose avec le titre de presse
            pressOrgansFactory.linkArticle(article);
        }

        function initArticleForm() {
            $scope.modalForm = {
                presse: [],
                editions: []
            };

            angular.forEach(vm.presse, function (val, key) {
                $scope.modalForm.presse.push({
                    id: val.$id,
                    name: val.name
                });
            });

            angular.forEach(vm.editions, function (val, key) {
                $scope.modalForm.editions.push({
                    id: val.$id,
                    year: val.year
                });
            });
        }

        function articleCallback(articleRef, modal) {
            pressArticlesFactory.modifyPriority(articleRef, categories.articles);
            updatePresseAndYearsForArticle(articleRef);
            modal.$hide();
        }

        /**
         * Redirige vers la création ou la modification de l'article en fonction du type de modal
         */
        function commitArticle() {
            if ($scope.modalForm.modalType == formType.creation) {
                addArticle(this);
            }
            else if ($scope.modalForm.modalType == formType.modification) {
                modifyArticle(this);
            }
        }

        /**
         * Réinitialise la variable newArticle
         */
        function initNewArticle() {
            vm.category = categories.articles;
            vm.imagePath = vm.category.imagePath;
            vm.uploadErrors = null;
            vm.newArticle = {};
            initArticleForm();

            $scope.modalForm.modalType = formType.creation;
            $scope.modalForm.title = "Ajouter un article de presse";
            $scope.modalForm.action = "Ajouter l'article";

            var addArticleModal = $modal(new Modal("/adm/src/app/presse/articles/presse-article.modal.html", $scope));
            addArticleModal.$promise.then(addArticleModal.show);
        }

        /**
         * Appelée lors du submit de l'ajout d'un article
         * @param {Object} modal - Référence à la modal à fermer
         */
        function addArticle(modal) {
            completeLinks(vm.newArticle);

            var promise = pressArticlesFactory.add(vm.newArticle);
            promise.then(function (ref) {
                articleCallback(ref, modal);
            });
        }

        /**
         * Récupère l'article à modifier et l"injecte dans newArticle pour le modifier dans la modal
         * @param {Object} article - Article destiné à être modifié
         */
        function initModifyArticle(index) {
            vm.category = categories.articles;
            vm.imagePath = vm.category.imagePath;
            vm.uploadErrors = null;

            vm.newArticle = vm.articles[index];
            initArticleForm();
            vm.articleScanToUpdate = vm.newArticle.paper;
            $scope.modalForm.oldEdition = vm.newArticle.edition;
            $scope.modalForm.oldPress = vm.newArticle.pressOrgan;
            $scope.modalForm.modalType = formType.modification;
            $scope.modalForm.title = "Modifier un article existant";
            $scope.modalForm.action = "Valider les modifications";

            sliceLinks(vm.newArticle);

            var modifyArticleModal = $modal(new Modal("/adm/src/app/presse/articles/presse-article.modal.html", $scope));
            modifyArticleModal.$promise.then(modifyArticleModal.show);
        }

        /**
         * Appelée lors du submit de la modification d'un article
         * @param {Object} modal - Référence à la modal à fermer
         */
        function modifyArticle(modal) {
            //On met à jour en cas de déplacement d'édition
            if (vm.newArticle.edition != $scope.modalForm.oldEdition && $scope.modalForm.oldEdition != undefined) {
                editionsFactory.unlinkArticle(vm.newArticle, $scope.modalForm.oldEdition);
            }

            //On met à jour en cas de changement de titre de presse
            if (vm.newArticle.pressOrgan != $scope.modalForm.oldPress) {
                pressOrgansFactory.unlinkArticle(vm.newArticle, $scope.modalForm.oldPress);
            }

            completeLinks(vm.newArticle);
            var promise = pressArticlesFactory.update(vm.newArticle);
            promise.then(function (ref) {
                articleCallback(ref, modal);
                delete vm.newArticle;
            }).catch(function (error) { console.log(error); });
        }

        function initDeleteArticle(article) {
            vm.articleToDelete = article;
            $scope.submitModalForm = removeArticle;

            var modalInfos = {
                scope: $scope,
                templateUrl: DELETE_MODAL_URL,
                title: "Supprimer un article",
                html: true,

                // Syntaxe template strings ES6
                content: `<p>Attention, vous allez supprimer l'article intitulé "${article.title}".</p>
                          <p>Cliquez sur "Supprimer" pour valider.</p>`
            };

            var confirmDeleteArticleModal = $modal(modalInfos);
            confirmDeleteArticleModal.$promise.then(confirmDeleteArticleModal.show);
        }

        /**
         * Appelée lors de la validation de la suppression d'un article
         */
        function removeArticle() {
            var that = this;

            var promise = pressArticlesFactory.remove(vm.articleToDelete);
            promise.then(function (ref) {
                removeArticleReferences(vm.articleToDelete);
                that.$hide();
            });
        }

        /**
         * Uploade une ou plusieurs images vers le serveur puis les ajoute à Firebase
         * @param {Object[]} $files - Liste d'un ou plusieurs fichiers à uploader
         */
        function onFileSelectPresse($files) {
            var dataToSend = {
                path: vm.imagePath
            };

            switch (vm.category) {
                case categories.presse:
                    dataToSend.id = $scope.newPressOrgan.name;
                    break;

                case categories.articles:
                    dataToSend.id = vm.newArticle.title;
                    break;
            }

            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                vm.uploading = true;

                var promise = apiFactory.addImage(dataToSend, file);
                promise.progress(function (evt) {
                    console.log("percent: " + (100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    var timestamp = "?" + new Date().getTime();

                    switch (vm.category) {
                        case categories.presse:
                            $scope.newPressOrgan.logo = data.filename;
                            vm.pressLogoToUpdate = $scope.newPressOrgan.logo + timestamp;
                            break;

                        case categories.articles:
                            vm.newArticle.paper = data.filename;
                            vm.articleScanToUpdate = vm.newArticle.paper + timestamp;
                            break;
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
         */
        function deleteImagePresse(file) {
            var path = vm.imagePath;

            var promise = apiFactory.deleteImage(file, path);
            promise.then(null, function (httpResponse) {
                vm.uploadErrors = httpResponse;
            }).finally(function () {
                switch (vm.category) {
                    case categories.presse:
                        pressOrgansFactory.removeLogo($scope.newPressOrgan);
                        break;

                    case categories.articles:
                        pressArticlesFactory.removePaperScan(vm.newArticle);
                        break;
                }
            });
        }
    }

})();
