<!doctype html>
<html lang="fr" ng-app="adminApp">
<head>
	<meta charset="utf-8">
	<link href='http://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
    <!--<link rel="stylesheet" href="../../shared/css/animate.css">-->

    <!-- bower:css -->
    <link rel="stylesheet" href="/adm/bower_components/ng-table/dist/ng-table.min.css">
    <link rel="stylesheet" href="/adm/bower_components/angular-ui-select/dist/select.css">
    <link rel="stylesheet" href="/adm/bower_components/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.css">
    <link rel="stylesheet" href="/adm/bower_components/angular-motion/dist/angular-motion.css">
    <link rel="stylesheet" href="/adm/bower_components/angular-loading-bar/build/loading-bar.css">
    <link rel="stylesheet" href="/adm/bower_components/bootswatch-dist/css/bootstrap.css">
    <link rel="stylesheet" href="/adm/bower_components/textAngular/dist/textAngular.css">
    <!-- endinject -->

    <!-- inject:css -->
    <link rel="stylesheet" href="/adm/.tmp/custom.css">
    <!-- endinject -->

    <!--<base href="/admin/">-->

</head>

<body ng-controller="AdminController as admin">

	<div class="container-fluid">

		<div class="row" ng-if="user.authData" ng-include="menuLeft"></div>

        <div class="row">
            <div class="main {{pageClass}}" ng-class="{'col-xs-10 col-xs-offset-2': user.authData != null, 'col-xs-12': user.authData == null}" ng-view></div>
        </div>

	</div>

</body>

<!-- bower:js -->
<script src="/adm/bower_components/jquery/dist/jquery.js"></script>
<script src="/adm/bower_components/angular/angular.js"></script>
<script src="/adm/bower_components/angular-route/angular-route.js"></script>
<script src="/adm/bower_components/angular-resource/angular-resource.js"></script>
<script src="/adm/bower_components/angular-animate/angular-animate.js"></script>
<script src="/adm/bower_components/firebase/firebase.js"></script>
<script src="/adm/bower_components/ng-ckeditor/ng-ckeditor.js"></script>
<script src="/adm/bower_components/angular-strap/dist/angular-strap.js"></script>
<script src="/adm/bower_components/angular-strap/dist/angular-strap.tpl.js"></script>
<script src="/adm/bower_components/ckeditor/ckeditor.js"></script>
<script src="/adm/bower_components/ng-file-upload/ng-file-upload.js"></script>
<script src="/adm/bower_components/ng-table/dist/ng-table.min.js"></script>
<script src="/adm/bower_components/angular-ui-select/dist/select.js"></script>
<script src="/adm/bower_components/bootstrap/dist/js/bootstrap.js"></script>
<script src="/adm/bower_components/bootstrap-switch/dist/js/bootstrap-switch.js"></script>
<script src="/adm/bower_components/angular-loading-bar/build/loading-bar.js"></script>
<script src="/adm/bower_components/bootswatch-dist/js/bootstrap.js"></script>
<script src="/adm/bower_components/angularfire/dist/angularfire.js"></script>
<script src="/adm/bower_components/angular-bootstrap-switch/dist/angular-bootstrap-switch.js"></script>
<script src="/adm/bower_components/textAngular/dist/textAngular-rangy.min.js"></script>
<script src="/adm/bower_components/textAngular/dist/textAngular.js"></script>
<script src="/adm/bower_components/textAngular/dist/textAngular-sanitize.js"></script>
<script src="/adm/bower_components/textAngular/dist/textAngularSetup.js"></script>
<!-- endinject -->

<script src="/adm/src/common.js"></script>
<script src="/adm/src/admin.js"></script>
<script src="/adm/src/directives.js"></script>

<!-- inject:js -->
<script src="/adm/src/app/app.module.js"></script>
<script src="/adm/src/app/config.module.js"></script>
<script src="/adm/src/app/editions/editions.module.js"></script>
<script src="/adm/src/app/brasseurs/brasseurs.module.js"></script>
<script src="/adm/src/app/hebergements/hebergements.module.js"></script>
<script src="/adm/src/app/motos/motos.module.js"></script>
<script src="/adm/src/app/layout/layout.module.js"></script>
<script src="/adm/src/app/partenaires/partenaires.module.js"></script>
<script src="/adm/src/app/presse/presse.module.js"></script>
<script src="/adm/src/app/users/users.module.js"></script>
<script src="/adm/src/app/auth/auth.module.js"></script>
<script src="/adm/src/app/core/core.module.js"></script>
<script src="/adm/src/app/editions/editions.controller.js"></script>
<script src="/adm/src/app/editions/editions.factory.js"></script>
<script src="/adm/src/app/brasseurs/brasseurs.controller.js"></script>
<script src="/adm/src/app/brasseurs/brasseurs.factory.js"></script>
<script src="/adm/src/app/hebergements/hebergements.controller.js"></script>
<script src="/adm/src/app/hebergements/hebergements.factory.js"></script>
<script src="/adm/src/app/motos/motos.controller.js"></script>
<script src="/adm/src/app/motos/motos.factory.js"></script>
<script src="/adm/src/app/layout/admin.controller.js"></script>
<script src="/adm/src/app/partenaires/partenaires.controller.js"></script>
<script src="/adm/src/app/partenaires/partenaires.factory.js"></script>
<script src="/adm/src/app/presse/presse.controller.js"></script>
<script src="/adm/src/app/users/users.controller.js"></script>
<script src="/adm/src/app/auth/auth.controller.js"></script>
<script src="/adm/src/app/auth/auth.factory.js"></script>
<script src="/adm/src/app/core/api.factory.js"></script>
<script src="/adm/src/app/core/firebase.factory.js"></script>
<script src="/adm/src/app/presse/articles/presse-articles.factory.js"></script>
<script src="/adm/src/app/presse/titres/presse-titres.factory.js"></script>
<script src="/adm/src/app/core/content/content-article.controller.js"></script>
<script src="/adm/src/app/core/content/content-articles.controller.js"></script>
<script src="/adm/src/app/core/content/content-images.controller.js"></script>
<script src="/adm/src/app/core/content/content.config.js"></script>
<script src="/adm/lib/angular-locale_fr-fr.js"></script>
<script src="/adm/lib/diacritics.js"></script>
<!-- endinject -->

</html>