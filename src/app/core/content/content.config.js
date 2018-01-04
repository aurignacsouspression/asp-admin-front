(function () {
    "use strict";

    angular
        .module("app.core")
        .config(configContent);

    configContent.$inject = ["$provide"];
    function configContent($provide) {
        $provide.decorator("taOptions", setTextAngularOptions);
    }

    setTextAngularOptions.$inject = ["taRegisterTool", "$delegate", "$modal", "apiFactory"];
    function setTextAngularOptions(taRegisterTool, $delegate, $modal, apiFactory) {
        // $delegate is the taOptions we are decorating
        // register the tool with textAngular
        taRegisterTool("manageImages", {
            iconclass: "fa fa-picture-o",
            tooltiptext: "Ajouter une image",
            action: function (deferred, restoreSelection) {
                var that = this;
                var vm = this.$parent.$parent.articleCtrl;
                var scope = this.$parent.$parent.$parent;

                scope.insertArticleImage = function () {
                    var fullPath = scope.articleImagesPath + scope.imageSelected;
                    restoreSelection();
                    that.$editor().wrapSelection("insertImage", fullPath, true);
                    manageContentArticleImagesModal.hide();
                    deferred.resolve();
                };

                scope.selectArticleImage = function (image) {
                    scope.imageSelected = image;
                };

                scope.deleteArticleImage = function () {
                    var promise = apiFactory.deleteImage(scope.imageSelected, "contentArticles/" + vm.contentArticle.$id + "/");
                    promise.then(function () {
                        var imageIndex = scope.articleImages.indexOf(scope.imageSelected);
                        scope.articleImages.splice(imageIndex, 1);
                        scope.imageSelected = null;
                    });
                };

                //Uploade les images sélectionnées puis les ajoute au tableau
                scope.onFileSelectContentArticleImages = function ($files) {
                    var dataToSend = {
                        path: "contentArticles/" + vm.contentArticle.$id,
                        fullName: true,
                        id: "filename"
                    };

                    //$files: an array of files selected, each file has name, size, and type.
                    for (var i = 0; i < $files.length; i++) {
                        var file = $files[i];
                        scope.uploading = true;

                        var promise = apiFactory.addImage(dataToSend, file);
                        promise.progress(function (evt) {
                            console.log("percent: " + (100.0 * evt.loaded / evt.total));
                        }).success(function (data, status, headers, config) {
                            scope.articleImages.push(data.filename);
                        }).error(function (data) {
                            scope.uploadErrors = data;
                        }).finally(function () {
                            scope.uploading = false;
                        });
                    }
                };

                var manageContentArticleImagesModal = $modal(new Modal("/adm/src/app/core/content/article-images.modal.html", scope));
                manageContentArticleImagesModal.$promise.then(function () {
                    manageContentArticleImagesModal.show();

                    scope.articleImages = [];
                    scope.imageSelected = null;
                    scope.articleImagesPath = sharedImgPath + "contentArticles/" + vm.contentArticle.$id + "/";

                    var promise = apiFactory.getImages("contentArticles/", vm.contentArticle.$id);
                    promise.then(function (data, status) {
                        for (var i = 0; i < data.length; i++) {
                            scope.articleImages.push(data[i].name);
                        }
                    }).catch(function (httpResponse) {
                        scope.uploadErrors = httpResponse;
                    });
                });

                return false;
            },
            onElementSelect: {
                element: "img",
                action: imgOnSelectAction
            }
        });

        return $delegate;
    }

})();
