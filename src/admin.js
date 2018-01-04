"use strict";

var formType = {
    creation: 1,
    modification: 2
};

var userRights = ["Aucun", "AdminSys", "Admin", "Moderateur"];

var imgOnSelectAction = function(event, $element, editorScope) {
    // setup the editor toolbar
    // Credit to the work at http://hackerwins.github.io/summernote/ for this editbar logic/display
    var finishEdit = function() {
        editorScope.updateTaBindtaTextElement();
        editorScope.hidePopover();
    };
    event.preventDefault();
    editorScope.displayElements.popover.css("width", "375px");
    var container = editorScope.displayElements.popoverContainer;
    container.empty();
    var buttonGroup = angular.element("<div class='btn-group' style='padding-right: 6px;'>");
    var fullButton = angular.element("<button type='button' class='btn btn-default btn-sm btn-small' unselectable='on' tabindex='-1'>100% </button>");
    fullButton.on("click", function(event) {
        event.preventDefault();
        $element.css({
            "width": "100%",
            "height": ""
        });
        finishEdit();
    });
    var halfButton = angular.element("<button type='button' class='btn btn-default btn-sm btn-small' unselectable='on' tabindex='-1'>50% </button>");
    halfButton.on("click", function(event) {
        event.preventDefault();
        $element.css({
            "width": "50%",
            "height": ""
        });
        finishEdit();
    });
    var quartButton = angular.element("<button type='button' class='btn btn-default btn-sm btn-small' unselectable='on' tabindex='-1'>25% </button>");
    quartButton.on("click", function(event) {
        event.preventDefault();
        $element.css({
            "width": "25%",
            "height": ""
        });
        finishEdit();
    });
    var resetButton = angular.element("<button type='button' class='btn btn-default btn-sm btn-small' unselectable='on' tabindex='-1'>Reset</button>");
    resetButton.on("click", function(event) {
        event.preventDefault();
        $element.css({
            width: "",
            height: ""
        });
        finishEdit();
    });
    buttonGroup.append(fullButton);
    buttonGroup.append(halfButton);
    buttonGroup.append(quartButton);
    buttonGroup.append(resetButton);
    container.append(buttonGroup);

    buttonGroup = angular.element("<div class='btn-group' style='padding-right: 6px;'>");
    var floatLeft = angular.element("<button type='button' class='btn btn-default btn-sm btn-small' unselectable='on' tabindex='-1'><i class='fa fa-align-left'></i></button>");
    floatLeft.on("click", function(event) {
        event.preventDefault();
        // webkit
        $element.css("float", "left");
        // firefox
        $element.css("cssFloat", "left");
        // IE < 8
        $element.css("styleFloat", "left");
        finishEdit();
    });
    var floatRight = angular.element("<button type='button' class='btn btn-default btn-sm btn-small' unselectable='on' tabindex='-1'><i class='fa fa-align-right'></i></button>");
    floatRight.on("click", function(event) {
        event.preventDefault();
        // webkit
        $element.css("float", "right");
        // firefox
        $element.css("cssFloat", "right");
        // IE < 8
        $element.css("styleFloat", "right");
        finishEdit();
    });
    var floatNone = angular.element("<button type='button' class='btn btn-default btn-sm btn-small' unselectable='on' tabindex='-1'><i class='fa fa-align-justify'></i></button>");
    floatNone.on("click", function(event) {
        event.preventDefault();
        // webkit
        $element.css("float", "");
        // firefox
        $element.css("cssFloat", "");
        // IE < 8
        $element.css("styleFloat", "");
        finishEdit();
    });
    buttonGroup.append(floatLeft);
    buttonGroup.append(floatNone);
    buttonGroup.append(floatRight);
    container.append(buttonGroup);

    buttonGroup = angular.element("<div class='btn-group'>");
    var remove = angular.element("<button type='button' class='btn btn-default btn-sm btn-small' unselectable='on' tabindex='-1'><i class='fa fa-trash-o'></i></button>");
    remove.on("click", function(event) {
        event.preventDefault();
        $element.remove();
        finishEdit();
    });
    buttonGroup.append(remove);
    container.append(buttonGroup);

    editorScope.showPopover($element);
    editorScope.showResizeOverlay($element);
};
