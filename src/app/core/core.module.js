(function () {
  "use strict";

  angular
    .module("app.core", [
      /* Angular modules */
      "ngRoute", "ngSanitize", "ngAnimate", "ngResource",

      /* 3rd parties modules */
      "firebase", "mgcrea.ngStrap", "textAngular", "ngFileUpload", "ngTable", "ui.select", "frapontillo.bootstrap-switch", "angular-loading-bar"
    ])

    .constant("DELETE_MODAL_URL", "/adm/src/app/layout/confirmDeleteModal.html")
    .constant("API_IMAGE_URL", "/api/image")
    .constant("API_USER_URL", "/api/users/:userId");

})();
