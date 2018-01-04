(function () {
  "use strict";

  angular
    .module("app.core")
    .factory("apiFactory", apiFactory);

  apiFactory.$inject = ["API_IMAGE_URL", "API_USER_URL", "$resource", "Upload"];
  function apiFactory(API_IMAGE_URL, API_USER_URL, $resource, Upload) {
    var imageResource = $resource(API_IMAGE_URL);
    var usersResource = $resource(API_USER_URL, null,
      {
        "update": { method: "PUT" }
      });

    var service = {
      addImage: addApiImage,
      deleteImage: deleteApiImage,
      getImages: getApiImages,

      getUser: getApiUser,
      updateUser: updateApiUser,
      deleteUser: deleteApiUser,
      getUsers: getApiUsers
    };

    return service;

    ////////////////////////////////

    function addApiImage(data, file) {
      return Upload.upload({
        url: API_IMAGE_URL,
        method: "POST",
        fields: data,
        file: file
      });
    }

    function deleteApiImage(id, path) {
      return imageResource.remove({ id, path }).$promise;
    }

    function getApiImages(path, folder) {
      return imageResource.query({ path, folder }).$promise;
    }

    function getApiUser(id) {
      return usersResource.get({ userId: id }).$promise;
    }

    function updateApiUser(user) {
      return usersResource.update({ userId: user.id }, user).$promise;
    }

    function deleteApiUser(id) {
      return usersResource.delete({ userId: id }).$promise;
    }

    function getApiUsers() {
      return usersResource.query().$promise;
    }
  }

})();
