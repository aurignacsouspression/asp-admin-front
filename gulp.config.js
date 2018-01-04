module.exports = function () {
    var src = "./src/";
    var app = src + "app/";
    var temp = "./.tmp/";

    var config = {
        temp: temp,

        /**
         * Files paths
         */
        alljs: [
            src + "**/*.js",
            "./*.js"
        ],
        src: src,
        css: temp + "custom.css",
        index: src + "index.php",
        js: [
            app + "**/*.module.js",
            app + "**/*.js",
            "!" + "**/*.spec.js",
            "./lib/*.js",
        ],

        scss: src + "styles/*.scss",

        /**
         * Bower and NPM locations
         */
        bower: {
            json: require("./bower.json"),
            directory: "./bower_components",
            ignorePath: "../../",
            overrides: {
                "textAngular": {
                    "main": [
                        "./dist/textAngular-rangy.min.js",
                        "./dist/textAngular.js",
                        "./dist/textAngular-sanitize.js",
                        "./dist/textAngularSetup.js",
                        "./dist/textAngular.css"
                    ]
                },
                "rangy": {
                    "main": []
                },
                "ckeditor": {
                    "main": "ckeditor.js"
                },
                "bootswatch-dist": {
                    "main": [
                        "js/bootstrap.js",
                        "css/bootstrap.css"
                    ]
                }
            }
        }
    };

    config.getBowerFilesDefaultOptions = function () {
        var options = {
            overrides: config.bower.overrides
        };

        return options;
    };

    return config;
};
