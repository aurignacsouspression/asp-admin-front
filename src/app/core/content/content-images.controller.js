(function () {
    "use strict";

    angular
        .module("app.core")
        .controller("ContentImagesController", ContentImagesController);

    ContentImagesController.$inject = ["$scope", "$routeParams", "firebaseFactory", "apiFactory"];
    function ContentImagesController($scope, $routeParams, firebaseFactory, apiFactory) {
        var vm = this;
        vm.pageClass = "content";
        vm.switchActive = false;
        vm.contentKey = $routeParams.key;
        vm.category = categories[$routeParams.category];
        vm.contentImagesFullPath = sharedImgPath + vm.category.imagePath;
        vm.contentImages = firebaseFactory.getAsArray(vm.category.name + "/" + vm.contentKey + "/contentImages");

        vm.displayImageInfos = displayImageInfos;
        vm.toggleImageState = toggleImageState;
        vm.changeImagePosition = changeImagePosition;
        vm.reloadPhotos = reloadPhotos;
        vm.deleteContentImage = deleteContentImage;
        vm.commitImage = commitImage;
        vm.onFileSelectContentImages = onFileSelectContentImages;

        activate();

        /////////////////////////////////

        function activate() {
            vm.brasseurs = firebaseFactory.brasseurs;
            vm.editions = firebaseFactory.editions;

            //TODO: Gérer le titre pour toutes les catégories
            switch (vm.category) {
                case categories.brasseurs:
                    vm.brasseurs.$loaded(function () {
                        vm.contentTitle = vm.brasseurs.$getRecord(vm.contentKey).name;
                        vm.imagesPath = vm.contentImagesFullPath + vm.contentKey + "/";
                    });
                    break;

                case categories.editions:
                    vm.editions.$loaded(function () {
                        vm.contentTitle = vm.editions.$getRecord(vm.contentKey).year;
                        vm.imagesPath = vm.contentImagesFullPath + vm.contentTitle + "/";
                    });
                    break;
            }
        }

        function displayImageInfos(image) {
            vm.contentImage = firebaseFactory.getCategoryObject(vm.category.name + "/" + vm.contentKey + "/contentImages", image.$id);
            vm.switchActive = true;
        }

        //Change l'état de l'image entre actif et inactif
        function toggleImageState(index) {
            var imageContent = vm.contentImages[index];
            imageContent.active = !imageContent.active;
            vm.contentImages.$save(imageContent).then();
        }

        //Modifie la priorité de l'object Firebase qui correspond à l'ordre d'affichage de l'image
        function changeImagePosition(sens) {
            var switched;

            if (sens == 0 && vm.contentImages.length > vm.contentImage.$priority + 1) {
                 switched = vm.contentImages[vm.contentImage.$priority + 1];

                vm.contentImage.$priority += 1;
                vm.contentImage.$save().then(function () {
                    switched.$priority -= 1;
                    vm.contentImages.$save(switched);
                });

            } else if (sens == 1 && vm.contentImage.$priority > 0) {
                switched = vm.contentImages[vm.contentImage.$priority - 1];

                vm.contentImage.$priority -= 1;
                vm.contentImage.$save().then(function () {
                    switched.$priority += 1;
                    vm.contentImages.$save(switched);
                });
            }
        }

        //Sauve les modifications effectuées à l'image dans Firebase
        function commitImage() {
            if (vm.contentImage.legend == "") {
                delete vm.contentImage.legend;
            }
            vm.contentImage.$save().then(function () {
                delete vm.contentImage;
                vm.switchActive = false;
            });
        }

        function reloadPhotos() {
            var imagesCount = firebaseFactory.getCategoryObject(vm.category.name + "/" + vm.contentKey, "imagesCount");
            imagesCount.$loaded(function () {
                imagesCount.$value = 0;
                firebaseFactory.getReference(vm.category.name + "/" + vm.contentKey + "/contentImages")
                    .remove(function (error) {
                        if (error) {
                            console.log(error);
                        } else {
                            var promise = apiFactory.getImages(vm.category.imagePath, vm.contentTitle);
                            promise.then(function (data, status) {
                                for (var i = 0; i < data.length; i++) {
                                    vm.contentImages.$add({
                                        filename: data[i].name,
                                        date: data[i].date || null,
                                        active: true
                                    }).then(function () {
                                        imagesCount.$value += 1;
                                        imagesCount.$save();
                                    });
                                }
                            });
                        }
                    });
            });
        }

        //Uploade les images sélectionnées puis les ajoute au tableau
        function onFileSelectContentImages($files) {
            var dataToSend = {
                path: vm.category.imagePath + vm.contentKey,
                fullName: true,
                id: "filename"
            };

            var imagesCount = firebaseFactory.getReference(vm.category.name + "/" + vm.contentKey + "/imagesCount");

            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                vm.uploading = true;

                var promise = apiFactory.addImage(dataToSend, file);
                promise.progress(function (evt) {
                    console.log("percent: " + (100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    imagesCount.transaction(function (currentCount) {
                        if (!currentCount) {
                            return 1;
                        } else {
                            return currentCount + 1;
                        }
                    }, function (error, committed, snapshot) {
                        if (error) {
                            console.log("Error :", error);
                        } else if (!committed) {
                            console.log('Transaction aborted !');
                        } else {
                            vm.contentImages.$add({
                                filename: data.filename,
                                active: true,
                                $priority: snapshot.val() - 1
                            }).then(function (ref) {
                                vm.uploading = false;
                            });
                        }
                    });

                }).error(function (data) {
                    vm.uploadErrors = data;
                    vm.uploading = false;
                });
            }
        }

        //Supprimer l'image sélectionnée du serveur et de Firebase
        function deleteContentImage() {
            var path = null;

            switch (vm.category) {
                case categories.brasseurs:
                    path = vm.category.imagePath + vm.contentKey + "/";
                    break;

                case categories.editions:
                    path = vm.category.imagePath + vm.contentTitle + "/";
                    break;
            }

            apiFactory.deleteImage(vm.contentImage.filename, path)
                .catch(function (httpResponse) {
                    vm.uploadErrors = httpResponse;
                }).finally(function () {
                    var imagesCount = firebaseFactory.getAsObject(vm.category.name + "/" + vm.contentKey + "/imagesCount/");
                    imagesCount.$loaded(function () {
                        for (var i = vm.contentImage.$priority + 1; i < imagesCount.$value; i++) {
                            vm.contentImages[i].$priority -= 1;
                            vm.contentImages.$save(i);
                        }

                        vm.contentImage.$remove()
                            .then(function () {
                                imagesCount.$value -= 1;
                                imagesCount.$save();
                                delete vm.contentImage;
                                vm.switchActive = false;
                            });
                    });
                });
        }
    }

})();
