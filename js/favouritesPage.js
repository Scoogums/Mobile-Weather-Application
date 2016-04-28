/**
 * @fileOverview This contains code for the Favourite system functionality.
 * @author B00276551
 * @version 1
 */

/** @module Favourites */

var favouritesListChecked = true;
var deleteMode = false;
var favouritesArray = [];

/**
 * This function sets up handlers for user events, such as clicking on the list, swiping an item on the list,
 * adding a favourite and inputting the name of a favourite.
 *
 * Code for validating user input here:
 * http://stackoverflow.com/questions/2980038/allow-text-box-only-for-letters-using-jquery
 */
$(document).ready(function () {
    $('#favouritesList').on('click', 'li', function () {
        selectFavourite($(this));
    });
    $("#favouritesList").on("swiperight", "li", function () {
        if (deleteMode) {
            removeFavourite($(this));
        }
    });
    $("#flip-2").bind("change", function (event, ui) {
        deleteMode = !deleteMode;
        console.log("Delete mode is now: " + deleteMode);
    });
    $("#favouriteName").on("keydown", function (event) {
        // Allow controls such as backspace
        var arr = [8, 16, 17, 20, 35, 36, 37, 38, 39, 40, 45, 46];

        // Allow letters
        for (var i = 65; i <= 90; i++) {
            arr.push(i);
        }

        // Prevent default if not in array
        if (jQuery.inArray(event.which, arr) === -1) {
            event.preventDefault();
        }
    });
    $("#favouriteName").on("input", function () {
        var regexp = /[^a-zA-Z]/g;
        if ($(this).val().match(regexp)) {
            $(this).val($(this).val().replace(regexp, ''));
        }
    });
    $("#addFavourite").click(function () {
        addFavourite();
    });
});

/**
 * This function deals with the user selecting a favourite item from the list of favourites. If
 * the user does not currently have the location selected, it will replace their current weatherObject
 * with one selected from the favourite list. It will also update the forecast after the user has selected it,
 * assuming they have an internet connection.
 *
 * If the select forecast has a custom name, it will display the name of the location in brackets e.g.
 * Your location has been changed to Bedrock (Paisley).
 *
 * If a users selected forecast is unable to be updated due to lack of internet connection, it will load the
 * stored forecast for that location.
 *
 * @param li The list item the user selected.
 */
function selectFavourite(li) {
    var selectedFavourite = (li.attr('array-position'));
    if (checkNetConnection()) {
        if (favouritesArray[selectedFavourite].id == weatherObject.id) {
            $("#favouritesErrorText").text("You location is already set to this favourite.");
        } else {
            if (favouritesArray[selectedFavourite].nameAsFavourite != favouritesArray[selectedFavourite].name) {
                $("#favouritesErrorText").text("Your location has been changed to " + favouritesArray[selectedFavourite].nameAsFavourite + " (" + favouritesArray[selectedFavourite].name + ")");
                $("#currentLocation").text("Current Location: " + favouritesArray[selectedFavourite].nameAsFavourite + " (" + favouritesArray[selectedFavourite].name + ")");
            } else {
                $("#favouritesErrorText").text("Your location has been changed to: " + favouritesArray[selectedFavourite].name);
                $("#currentLocation").text("Current Location: " + favouritesArray[selectedFavourite].name);
            }
            weatherObject = new weatherLocation();
            weatherObject.name = favouritesArray[selectedFavourite].name;
            weatherObject.id = favouritesArray[selectedFavourite].id;
            weatherObject.nameAsFavourite = favouritesArray[selectedFavourite].nameAsFavourite;
            $("#favouriteName")[0].value = weatherObject.nameAsFavourite;
            console.log("Changing location to: " + favouritesArray[selectedFavourite.name]);
        }
        weatherObject.updateWeather(true);                                    // Update locations weather
        favouritesArray[selectedFavourite].forecast = weatherObject.forecast; // Update the stored forecast
        saveFavourites();                                                     // Save favourite list so new stored forecast is saved.
        saveStoredWeather();                                                  // Saves weatherLocation object in local storage.
        checkForecastDate();                                                  // Check if the forecast is out of date.
        generateWeatherHtml(currentSelectedDate, selectDayOrNight);           // Display new weather on the screen
    } else {
        weatherObject = new weatherLocation();
        weatherObject.name = favouritesArray[selectedFavourite].name;
        weatherObject.id = favouritesArray[selectedFavourite].id;
        weatherObject.nameAsFavourite = favouritesArray[selectedFavourite].nameAsFavourite;
        weatherObject.forecast = favouritesArray[selectedFavourite].forecast;
        $('#weatherUpdateText').html('Sorry, there appears to be a problem with your internet connection. Please try again when you have a stable connection. Your ' +
            'forecast has been set to this favourites most recently saved forecast.');
        $("#weatherPagePopup").popup("open");                                 // Display popup with the above warning text being displayed.
        saveStoredWeather();                                                  // Saves weatherLocation object in local storage.
        generateWeatherHtml(currentSelectedDate, selectDayOrNight);           // Display new weather on the screen
    }
}

/**
 * This function is executed when a user swipes a list item with delete mode enabled. It removes
 * an item from the list and then redraws it. It also saves the updated favourites array after
 * the user has removed an item from the list.
 *
 * @param li The list item the user swiped.
 */
function removeFavourite(li) {
    if (deleteMode) {
        var indexToRemove = (li.attr('array-position'));
        console.log("Removing array element with index " + indexToRemove);
        favouritesArray.splice(indexToRemove, 1);
        li.animate({"margin-left": '+=' + $(window).width()}, 400, function () {
            li.remove();
            saveFavourites();
            loadFavourites();
            populateFavouritesList();
            $("#favouritesErrorText").text("Favourite removed.");
        });
    }
}

/**
 * This function runs whenever the favourites panel is opened. It loads the current saved array of favourites
 * from local storage and then creates the favourites list. If the list has no entries, it informs the
 * user. It then sets the #currentLocation.text value to the users current location. It also sets the
 * value of the #favouriteName input to the name of the users current weatherObject.
 */
$(document).on("panelbeforeopen", "#favouritesPanel", function (e, ui) {
    console.log("Favourites panel open.");
    loadFavourites();
    $("#favouritesErrorText").text("");
    populateFavouritesList();
    if (favouritesArray.length == 0) {
        $("#favouritesErrorText").text("You have no saved favourites :(");
        $("#currentLocation").text("");
        if (weatherObject.name == null) {
            $("#favouriteName")[0].value = "";
        } else {
            $("#favouriteName")[0].value = weatherObject.name;
        }
    } else {
        console.log("Favourites panel opened.");
        if (weatherObject.nameAsFavourite != weatherObject.name) {
            $("#currentLocation").text("Current Location: " + weatherObject.nameAsFavourite + " (" + weatherObject.name + ")");
        } else {
            $("#currentLocation").text("Current Location: " + weatherObject.nameAsFavourite);
        }
        $("#favouriteName")[0].value = weatherObject.name;
    }

});

/**
 * This function runs when the user adds a favourite to the list. Firstly it checks to see
 * whether there are already any favourites in the array that share the same ID as the favourite
 * the user wishes to add. If this is true, it will inform the user.
 *
 * If the array has detected no duplicates then a favourite will be added to the list. The list
 * will then be saved, loaded and redrawn for the user. If the users current weatherObject doesn't exist,
 * it will warn the user although this shouldn't be possible!
 */
function addFavourite() {
    $("#favouritesErrorText").text("");
    // Check there are entries in the array. If this step wasn't here, program would be unable to add another
    // entry if the last was deleted, as favouritesListChecked would be stuck at false.
    // Thus the else statement at the end.
    if (favouritesArray.length > 0) {
        for (var x = 0; x < favouritesArray.length; x++) {
            if (weatherObject.id == favouritesArray[x].id) {
                if (favouritesArray[x].nameAsFavourite == weatherObject.name) {
                    $("#favouritesErrorText").text("You already have this location saved under the name " + favouritesArray[x].nameAsFavourite);
                } else {
                    $("#favouritesErrorText").text("You already have this location saved as a favourite!");
                }
                favouritesListChecked = false;
                console.log("Duplicate entry detected at array position [" + x + "] ");
            }
        }
    } else {
        favouritesListChecked = true;
        console.log("List is empty.");
    }
    if (favouritesListChecked && weatherObject.name != null) {
        var favouritesObject = new weatherLocation(weatherObject.name, weatherObject.id, weatherObject.forecast);
        favouritesObject.nameAsFavourite = $("#favouriteName")[0].value;
        favouritesArray.push(favouritesObject);
        console.log("Adding new template: " + $("#favouriteName")[0].value);
        saveFavourites();
        loadFavourites();
        populateFavouritesList();
    } else if (weatherObject.name == null) {
        console.log("There is no weather object.");
        $("#favouritesErrorText").text("You currently have no location. Please set one in the location page.");
    };
    favouritesListChecked = true;
};

/**
 * This function iterates through the favouritesArray and, for each entry in the array, adds them to the list.
 */
function populateFavouritesList() {
    $('#favouritesList').empty();
    for (var x = 0; x < favouritesArray.length; x++) {
        $("#favouritesList").append("<li array-position='" + x + "'><a>" + favouritesArray[x].nameAsFavourite + "</a></li>").listview("refresh");
    }
};

/**
 * Saves the current favourites array to local storage.
 */
function saveFavourites() {
    localStorage["favouritesArray"] = JSON.stringify(favouritesArray);
};

/**
 * Loads the current favourites array from local storage.
 */
function loadFavourites() {
    favouritesArray = JSON.parse(localStorage["favouritesArray"]);
};

