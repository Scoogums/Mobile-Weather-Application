/**
 * @fileOverview This contains code for the user changing their settings.
 * @author B00276551
 * @version 1
 */

/** @module Settings Page */

/**
 * This function is attached to the settingsPage JQuery Mobile page. It sets up handlers that
 * control what happens when the user presses user input widgets.  When the page is initially loaded
 * it sets the values of the input widgets to those previously selected by the user stored in local
 * storage.
 */
$(document).on('pageinit', "#settingsPage", function () {
    console.log("Initializing settings page.");
    setStoredValues();
    $("#updateFlip").bind("change", function (event, ui) {
        settingsArray[0] = !settingsArray[0];
        console.log("Update weather set to " + settingsArray[0]);
        saveSettings();
    });
    $("#fahrenheitCheck").bind("change", function (event, ui) {
        settingsArray[1] = !settingsArray[1];
        console.log("Fahrenheit checkbox set to " + settingsArray[1]);
        saveSettings();
    });
    $("#refreshCheck").bind("change", function (event, ui) {
        settingsArray[2] = !settingsArray[2];
        console.log("Refresh checkbox set to " + settingsArray[2]);
        saveSettings();
    });
    $("#dateCheck").bind("change", function (event, ui) {
        settingsArray[3] = !settingsArray[3];
        console.log("Date checkbox set to " + settingsArray[3]);
        saveSettings();
    });
    $("#extraCheck").bind("change", function (event, ui) {
        settingsArray[4] = !settingsArray[4];
        console.log("Extra checkbox set to " + settingsArray[4]);
        saveSettings();
    });
});

/**
 * Saves current user settings to local storage.
 */
function saveSettings() {
    console.log("Saving user settings.");
    localStorage["settingsArray"] = JSON.stringify(settingsArray);
}

/**
 * Loads current user settings from local storage.
 */
function loadSettings() {
    console.log("Loading user settings");
    settingsArray = JSON.parse(localStorage["settingsArray"]);
}

/**
 * Sets the values of the inputs on the page to those stored in local storage. This only needs
 * to run the first time the user loads the page, as any changes they make after, due to the
 * way JQuery Mobile pages are set up, will still be there when the user returns to the page.
 */
function setStoredValues() {
    console.log("Updating settings page with stored user values.");
    if (settingsArray[0]) {
        $("#updateFlip").val('on').slider('refresh');
    } else {
        $("#updateFlip").val('off').slider('refresh');
    }
    if (settingsArray[1]) {
        $('#fahrenheitCheck').prop('checked', true).checkboxradio('refresh');
    } else {
        $('#fahrenheitCheck').prop('checked', false).checkboxradio('refresh');
    }
    if (settingsArray[2]) {
        $('#refreshCheck').prop('checked', true).checkboxradio('refresh');
    } else {
        $('#refreshCheck').prop('checked', false).checkboxradio('refresh');
    }
    if (settingsArray[3]) {
        $('#dateCheck').prop('checked', true).checkboxradio('refresh');
    } else {
        $('#dateCheck').prop('checked', false).checkboxradio('refresh');
    }
    if (settingsArray[4]) {
        $('#extraCheck').prop('checked', true).checkboxradio('refresh');
    } else {
        $('#extraCheck').prop('checked', false).checkboxradio('refresh');
    }
}