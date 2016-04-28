/**
 * @fileOverview Contains the code that deals with Geo-Location and Met Office site data searches.
 * Also contains the code for creating a weatherLocation object.
 * @author B00276551
 * @version 1
 */

/** @module Geo-Location Services */

var locationName;
var siteLocations = []; // Will hold the approximately 6000 sites that the Met Office provides Id's for.
var weatherObject = new weatherLocation();

/**
 * This function attaches handlers to various user input options on the location page. When the page is
 * first loaded, it hides the loading icon from the user. It then populates the array of sites by running
 * populateSiteArray().
 *
 * When a search via GPS is started, there is a try catch block around the GPS code to detect whether the
 * user has an internet connection or their internet dropped. When a search via name is started, the checkNetConnection()
 * function is run to see if the user has an internet connection.
 *
 * Code for validating user input here:
 * http://stackoverflow.com/questions/2980038/allow-text-box-only-for-letters-using-jquery
 */
$(document).on('pageinit', "#locationPage", function () {
    $("#loadingIconDiv").hide();
    console.log("Populating array of sites.");
    populateSiteArray();
    $("#geoLocationButton").click(function () {
        hideErrorText();
        $("#loadingIconDiv").show();
        console.log("Starting GPS services.")
        getLocationGPS();
    });
    $("#geoSearchButton").click(function () {
        hideErrorText();
        if (checkNetConnection()) {
            $("#loadingIconDiv").show();
            var searchValue = $('#nameSearchValue').val();
            matchNameToId(searchValue);
        } else {
            showErrorText();
        }
    });
    $("#nameSearchValue").on("keydown", function (event) {
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
    $("#nameSearchValue").on("input", function () {
        var regexp = /[^a-zA-Z]/g;
        if ($(this).val().match(regexp)) {
            $(this).val($(this).val().replace(regexp, ''));
        }
    });
});

/**
 * This function checks whether the user has an internet connection. It makes an Ajax call to a website
 * and attempts to download an image. If the call is successful, the user has an active internet connection.
 *
 * This function is not ideal, as it is searching for an image on an external website that could be changed
 * without notice. Currently it is set to pull a file from the BBC website. There is a section commented out
 * allowing it to be pulled from the program itself, however this wasn't perfect for uploading to my own website
 * as ajax requests weren't allowed.
 *
 * More detail on this will be provided in the final documentation.
 *
 * http://localhost:63342/WeatherAppFinal/media/0.png
 *
 * @returns {string}
 */
function checkNetConnection() {
    jQuery.ajaxSetup({async: false});
    re = "";
    r = Math.round(Math.random() * 10000);
    //$.get("http://localhost:63342/WeatherAppFinal/media/0.png", {subins: r}, function (d) {
    $.get("http://static.bbci.co.uk/weather/0.5.362/images/icons/tab_sprites/80px/10.png", {subins: r}, function (d) {
        re = true;
    }).error(function () {
        re = false;
    });
    return re;
}

/**
 * This function creates a weatherLocation object. It makes a JSON call to the Met Office forecast list with the ID of
 * the site being requested. Once the data has been recieved, it replaces the data in the weatherObject with the data
 * recieved from the JSON call. It then replaces the current weatherHTML on the weatherPage with the updated information
 * from the weatherObject.
 *
 * @param id The ID of the Met Office site to obtain a five day forecast from.
 */
function instantiateWeatherObject(id) {
    weatherObject = new weatherLocation();
    weatherObject.id = id;
    $.getJSON('http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/' + id + '?res=daily&key=63ec69c4-2dcb-4455-bb14-b4a02c2a2c96', function (jd) {
        console.log(jd);
        weatherObject.name = jd.SiteRep.DV.Location.name.toLowerCase();
        weatherObject.name = weatherObject.name.capitalize();
        weatherObject.nameAsFavourite = weatherObject.name.capitalize();
        weatherObject.forecast = jd.SiteRep.DV.Location.Period;
        localStorage["weatherObject"] = JSON.stringify(weatherObject);
        generateWeatherHtml(currentSelectedDate, selectDayOrNight);
    });
    console.log("Successfully created weather object.");
    $("#loadingIconDiv").hide();
}

/**
 * Capitalises the first letter in a string. Used to capitalise the .name value of
 * weatherObject.
 * @returns {string} Returns a string with the first letter capitalised.
 */
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

/**
 * This function populates the siteLocations[] Array with all of the sites held by the Met Office. It makes a JSON
 * call and stores the information in the siteLocations array.
 */
function populateSiteArray() {
    $.getJSON('http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/sitelist?res=daily&key=63ec69c4-2dcb-4455-bb14-b4a02c2a2c96', function (jd) {
        siteLocations = jd.Locations.Location;
        console.log("Site array populated.");
        console.log("There are a total of " + siteLocations.length + " sites. Can you name them all?!")
    });
}

/**
 * This function matches a Met Office ID value to the ID of a site held in the siteLocations array.
 *
 * Code here adapted from: http://stackoverflow.com/questions/13964155/get-javascript-object-from-array-of-objects-by-value-or-property
 * @param siteName
 */
function matchNameToId(siteName) {
    console.log("Starting search to match site ID to " + siteName);
    var found;
    siteLocations.some(function (obj) {
        if (obj.name === siteName) {
            found = obj;
            console.log(found.name + " matched to ID " + found.id);
        }
    });
    if (found == null) {
        console.log("No matches were found for " + siteName);
        $("#resultsText").text("The location you searched for returned no results. Please try another location.");
    } else {
        $("#resultsText").text("Your location has been changed to " + found.name);
        instantiateWeatherObject(found.id)
    }
}

/**
 * This function is called when the geoLocationButton is pressed and starts two other functions
 * in order to obtain GPS coordinates.
 */
function getLocationGPS() {
    initialize();
    getLocation();
}

/**
 * This function uses navigator.geolocation to get the users current location.
 */
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

/**
 * This function sets up the google maps geocoder.
 */
function initialize() {
    try {
        google.maps.event.addDomListener(window, 'load', initialize);
        geocoder = new google.maps.Geocoder();
    }
    catch (err) {
    }
}

/**
 * This function obtains the users current latitude and longtitude. It then runs codeLatLng
 * in order to find the users location.
 *
 * @param position Current position of the device
 */
function showPosition(position) {
    console.log("Retreiving latitude and longtitude");
    console.log("Latitude: " + position.coords.latitude +
        "Longitude: " + position.coords.longitude)
    lat = position.coords.latitude;
    long = position.coords.longitude;
    input = lat + "," + long;
    codeLatLng();
}

/**
 * This function uses the obtained latitude and longtitude to obtain the users current position. Specifically, it
 * finds a postal_towwn variable that will hold a value that is compatible with the Met Offices site ID
 * list.
 *
 * If the users has no internet connection or their GPS failed, it will display an error message.
 */
function codeLatLng() {
    var latlng = new google.maps.LatLng(lat, long);
    geocoder.geocode({
        'latLng': latlng
    }, function (results, status) {
        resultsx = results;
        // Goes through the returned results list and isolates the name value associated with postal_town
        // as this seems to be the most consistent single word for a place name that the geocoder
        // results return.
        try {
            for (var i = 0; i < resultsx[0].address_components.length; i++) {
                for (var x = 0; x < resultsx[0].address_components[i].types[0].length; x++) {
                    if (resultsx[0].address_components[i].types[x] == "postal_town") {
                        console.log("Matched Latitude and Longitude to area. Retrieving area name.");
                        console.log(resultsx[0].address_components[i].short_name);
                        matchNameToId(resultsx[0].address_components[i].short_name);
                    }
                }
            }
            console.log(results[3]);
            locationName = results[4].formatted_address;
            locationName = locationName.slice(0, -4);
            console.log(locationName);
            $("#resultsText").text("GPS call succesful! Your location is now " + locationName);
        }
        catch (err) {
            console.log("Didn't work");
            $("#loadingIconDiv").hide();
            showErrorText();
        }
    });
}

/**
 * This function displays an error message if the user has problems with their internet or GPS.
 */
function showErrorText() {
    $("#gpsErrorText").html('<b>' + "It appears you aren't connected to the internet or something has gone wrong. Please " +
        "ensure you have a stable internet connection and your location settings are enabled." + '<b>');
    $("#resultsText").text("");
}

/**
 * This function hides the error text message.
 */
function hideErrorText() {
    $("#gpsErrorText").text("");
}