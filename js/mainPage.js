/**
 * @fileOverview This file contains the code for the main page of the Weather Application. It mostly deals with displaying the weather,
 * displaying the weather list and loading all of the users stored variables such as settings and favourites.
 * @author B00276551
 * @version 1
 */

// This array refers to [0:Update Weather on opening, 1:Switch to fahrenheit, 2:Show refresh button, 3:Show Date, 4:Show extra weather details]
var settingsArray = [false, false, false, true, false];
// The values in this array correspond with the met office weather data codes. Page 10: http://www.metoffice.gov.uk/media/pdf/3/0/DataPoint_API_reference.pdf
var weatherTypes = ["Clear", "Sunny", "Partly Cloudy", "Partly cloudy", "Not used, something went wrong",
    "Mist", "Fog", "Cloudy", "Overcast", "Light rain shower", "Light rain shower", "Drizzle", "Light rain", "Heavy rain", "Heavy rain", "Heavy rain",
    "Sleet shower", "Sleet shower", "Sleet", "Hail shower", "Hail shower", "Hail", "Light snow shower", "Light snow shower",
    "Light snow", "Heavy snow shower", "Heavy snow shower", "Heavy snow", "Thunder shower", "Thunder shower", "Thunder"];
var currentSelectedDate = 0; // Users selected date from forecast list
var selectDayOrNight = 0;    // Users selection between day or night. 0 = day 1 = night
var daysForecastOutOfDate = 0; // Amount of days forecast is out of date, set by checkForecastDate()
var firstTime = false;         // Boolean for whether it is the first time the application has been started.
var dayOrNightArray = ["Day Forecast", "Night Forecast"]; // This array is used to inform the user whether they are viewing day or night forecasts.
var doOnce = false;            // Boolean for updating the weather once when program is started.

/**
 * This method is fired whenever weatherPage is displayed. Firstly, it loads the users settings so that if they have
 * made any changes on the settings page, those changes will take into effect.
 *
 * Then, it checks to see if there is a stored weatherObject. If not, that means that this is the first time the
 * program has been run and it sends a call to instantiateWeatherObject with the ID code of "352409", or London. T
 * If there is a stored weather object, it is loaded into the current weatherObject (This is useful in case the user
 * changed their location on the Location page) and then runs two methods, checkForecastDate and generateWeatherHtml.
 * This will display HTML for the current weather object and display to the user whether or not their weather forecast
 * is out of date.
 *
 * The next two if statements deal with the user settings for displaying a refresh button or updating the weather
 * when the application is first opened.
 *
 */
$(document).on('pageshow', "#weatherPage", function () {
    if (localStorage["settingsArray"]) {
        loadSettings();
    }
    if (localStorage["weatherObject"]) {
        console.log("Stored weather found. Retrieving.");
        loadStoredWeather();
        checkForecastDate();
        generateWeatherHtml(currentSelectedDate, 0);
    } else {
        console.log("False");
        firstTime = true;
        instantiateWeatherObject(352409);
    }
    if (settingsArray[2]) {
        $('#refreshButton').show();
    } else {
        $('#refreshButton').hide();
    }
    if (settingsArray[0] && doOnce == false) {
        console.log("Attempting to update weather on startup.");
        weatherObject.updateWeather();
        doOnce = true;
    }
});

/**
 * This method runs the first time the application is started. Firstly, it checks if the user has stored favourites
 * and settings and if so, loads them. If they don't have any saved, it saves a blank favourites array into
 * local storage and a set of default settings into local storage.
 *
 * Next, it changes the icon for dayButton to show that it is selected, as display a day forecast should always
 * be the default option. Next the function sets up handlers and events for the day button, night button, forecast
 * list, and refresh button.
 */
$(document).ready(function () {
    if (localStorage["favouritesArray"]) {
        loadFavourites();
    } else {
        localStorage["favouritesArray"] = JSON.stringify(favouritesArray);
    }
    if (localStorage["settingsArray"]) {
        loadSettings();
    } else {
        console.log("No saved settings detected.");
        localStorage["settingsArray"] = JSON.stringify(settingsArray);
    }
    $('#dayButton').attr('src', 'media/suniconselected.png');
    $("#dayButton").click(function () {
        if (selectDayOrNight == 1) { // If night is currently selected
            reverseSunAndMoon();     // Night button unselected, day button selected
        }
        console.log("Changing to day forecast");
        selectDayOrNight = 0;        // 0 = day
        generateWeatherHtml(currentSelectedDate, selectDayOrNight);
    });
    $("#nightButton").click(function () {
        if (selectDayOrNight == 0) { // If day is currently selected
            reverseSunAndMoon();     // Day button unselected, nigt button selected
        }
        console.log("Changing to night forecast.");
        selectDayOrNight = 1;       // 1 = night
        generateWeatherHtml(currentSelectedDate, selectDayOrNight);
    });
    $('#forecastList').on('click', 'li', function () {
        var userClicked = ($(this).attr('array-position'));
        console.log(userClicked);
        currentSelectedDate = userClicked;
        var li = $(this);
        li.animate({"margin-left": '+=' + $(window).width()}, 400, function () {
            li.remove();
            generateWeatherHtml(userClicked, selectDayOrNight);  // Sets the forecast to be displayed as the day the user clicked. Also redraws list.
        });
    });
    $("#refreshButton").click(function () {
        console.log("Refresh button pressed.");
        weatherObject.updateWeather(false);
        saveStoredWeather();
    });
});

/**
 * This function is used to check whether the users forecast is out of date or not. It start with a for
 * loop that runs through the first forecast in the array until it reaches the end, checking all 5
 * stored forecasts. If the forecast is out of date, it increments the variable daysForecastOutOfDate.
 * This variable is used in populateForecastList() so that only days for which the forecasts are
 * valid will be displayed to the user. At the end of the function, it also updates currentSelectedDate
 * with the value of daysForecastOutOfDate. This means the users selected date can't be for days
 * the forecast are out of date, so that out of date weather doesn't show when the forecast is
 * displayed the first time.
 *
 * As it can be a pain to manually wait for a forecast to be out of date, you can change the line
 * currentDate.setTime(currentDate.getTime()) to currentDate.setTime(currentDate.getTime() + 3 * 86400000 )
 * for example. This will artificially extend the currentDate by 3 days.
 *
 * The variable currentDate is set to midnight as the date value from the weatherObject forecast is always
 * parsed to 01:00:00. This way the comparison between parsedDate < currentDate will always be accurate.
 */
function checkForecastDate() {
    daysForecastOutOfDate = 0;
    for (x = 0; x < weatherObject.forecast.length; x++) {
        var forecastDate = Date.parse(weatherObject.forecast[x].value);  // Pull date from weatherObject. This is the date the forecast covers.
        var parsedDate = new Date(forecastDate);                         // Convert it into a usable date.
        var currentDate = new Date();                                    // Get current date
        currentDate.setHours(0, 0, 0);                                   // Set to midnight
        // currentDate.setTime(currentDate.getTime() + 3 * 86400000);    // Uncomment this to artificially out-date forecast.
        if (parsedDate < currentDate) {                                  // Compare the dates
            console.log("Forecast day " + x + " is out of date. Incrementing out of date counter.");
            daysForecastOutOfDate++;                                     // Increment days out of date
        }
    }
    console.log("Total days forecast out of date: " + daysForecastOutOfDate);
    currentSelectedDate = daysForecastOutOfDate;
    if (daysForecastOutOfDate > 0) {                                    // If days are out of date, display warning message to user.
        $('#weatherTextOutOfDate').html('<br>' + "Your forecast is " + daysForecastOutOfDate + " day(s) out of date. If it is shortly after midnight, this could be due to a delay with the Met Office data." +
            " Please try and update your forecast by either changing your location, enabling the refresh button in settings or enabling update on application start.");
    } else {
        $('#weatherTextOutOfDate').html("");
    }
}

/**
 * This function triggers whenever the user clicks on the day icon or night icon. It simply
 * un-highlights the opposite of the what the user clicks.
 */
function reverseSunAndMoon() {
    if ($('#dayButton').attr('src') == "media/sunicon.png") {
        $('#dayButton').attr('src', 'media/suniconselected.png');
        $('#nightButton').attr('src', 'media/moonicon.png');
    } else {
        $('#dayButton').attr('src', 'media/sunicon.png');
        $('#nightButton').attr('src', 'media/mooniconselected.png');
    }
}

/**
 * This function loads the users stored weatherLocation object from local storage. It creates a new
 * weatherLocation object and transfers the attributes of the stored weatherLocation object
 * into it. Without creating a new weather object, if you were to just write
 * weatherObject = JSON.parse(localStorage["weatherObject"]) the weatherObject would no
 * longer be of type weatherLocation, but of type object, and none of the object methods would work
 * on it anymore.
 */
function loadStoredWeather() {
    var tempObject;
    tempObject = JSON.parse(localStorage["weatherObject"]);
    weatherObject = new weatherLocation();
    weatherObject.name = tempObject.name;
    weatherObject.id = tempObject.id;
    weatherObject.forecast = tempObject.forecast;
    weatherObject.nameAsFavourite = tempObject.nameAsFavourite;
    console.log("Loaded weather object. Data is for " + weatherObject.name);
};

/**
 * Saves the users current weatherLocation object into local storage.
 */
function saveStoredWeather() {
    localStorage["weatherObject"] = JSON.stringify(weatherObject);
}


/**
 * This function is used for drawing the list of available days forecasts on the screen. First, the old
 * forecast list is cleared. Then it runs a for loop with the starting position set to the amount of days the
 * forecast is out of date (hopefully 0). It then calls the method getCurrentDay (see conversionMethods) to
 * get a string value for the day of the week and uses this to display the day of the week on the list.
 *
 * The list that is generated will skip the currently selected day, as there is no point displaying to the user
 * a day they already have selected. Also, if the user has a day in the future selected, it will add a (Today)
 * value onto the list item that matches the present day.
 */
function populateForecastList() {
    console.log("Generating forecast list");
    var currentDay;
    $('#forecastList').empty();
    for (var x = daysForecastOutOfDate; x < weatherObject.forecast.length; x++) {
        currentDay = getCurrentDay(x);
        if (x == currentSelectedDate) {
            console.log("Skipping currently selected date being added to the list");
        } else if (x == daysForecastOutOfDate) {
            $("#forecastList").append("<li array-position='" + x + "'><a>" + currentDay + " (Today)" + "</a></li>").listview("refresh");
        } else {
            $("#forecastList").append("<li array-position='" + x + "'><a>" + currentDay + "</a></li>").listview("refresh");
        }
    }
}

/**
 * This function takes in two integers and uses them to display the current days forecast on the weatherPage page. As
 * this is quite a long function with a lot of code in it, and is integral to understanding the program,
 * the code inside will be extensively commented.
 *
 * Important things to note: To get images for displaying the icon and and weather, the function accesses the
 * weatherObject.forecast[x].Rep[x].W to get an integer ranging from 0-30. In the /media file of the project, there are
 * files labelled 0-30.png for icons and w0-w31 for images. These images are matched up to the weather definitions on
 * page 10 of this document: http://www.metoffice.gov.uk/media/pdf/3/0/DataPoint_API_reference.pdf
 *
 * Code for displaying dialog comes from: http://stackoverflow.com/questions/6230460/how-to-open-a-jquery-mobile-dialog-from-javascript
 *
 * @param forecastDay An integer representing the days forecast to be displayed. Range 0-4.
 * @param dayOrNight An integer representing whether to show day or night forecast. 0 = day, 1 = night.
 */
function generateWeatherHtml(forecastDay, dayOrNight) {
    populateForecastList();                                                         // Redraws the forecast list.
    weatherIcon = weatherObject.forecast[forecastDay].Rep[dayOrNight].W;            // Sets weatherIcon with an integer value corresponding to the weather.
    weatherImage = "w" + weatherObject.forecast[forecastDay].Rep[dayOrNight].W;     // Sets weatherImage with an integer value corresponding to the weather.
    var dayOrNightTemp;
    if (dayOrNight == 0) {                                                          // If user selected day...
        dayOrNightTemp = weatherObject.forecast[forecastDay].Rep[dayOrNight].Dm;    // Get day temperature
    } else {                                                                        // If user selected night...
        dayOrNightTemp = weatherObject.forecast[forecastDay].Rep[dayOrNight].Nm;    // Get night temperature
    }
    var tempSymbol = "C";                                                           // Sets temperature symbol to 'C'.
    if (settingsArray[1] == true) {                                                 // If user has selected to show Fahrenheit
        tempSymbol = "F";                                                           // Sets temperature symbol to 'F'
        dayOrNightTemp = convertToFahrenheit(dayOrNightTemp)                        // Convert temperature to Fahrenheit, see conversionMethods.js
    }
    if (settingsArray[3]) {                                                         // If user has selected option Display Date
        dateHtml = '<br>' + dateString(forecastDay) + '</h2>';                      // Generate string for current date, see conversionMethods.js
    } else {
        dateHtml = "";                                                              // Clear dateHTML
    }
    $('#weatherTextOne').html("");
    $('#weatherTextTwo').html("");
    $('#weatherDisplay').html("");
    // This next series of lines generates HTML for the weather icon, temperature, temperature symbol, name of location and the date.
    // With the CSS, this will be overlaid on top of the weather image.
    $('#weatherDisplay').append('<img src="media/' + weatherIcon + '.png" id="weatherIcon"> <h2> ' + weatherTypes[weatherIcon] + ', ' +
        dayOrNightTemp + "°" + tempSymbol + '<br>' +
        '' + weatherObject.name + dateHtml);
    $('.module').css('backgroundImage', 'url(media/' + weatherImage + '.jpg)');  // Sets the weather image to match weather of selected day/night.
    $('#weatherTextOne').html('<b>Visibility: </b>' + getVisibility(weatherObject.forecast[forecastDay].Rep[dayOrNight].V)); // Show visibility information, see conversionMethods.js
    $('#weatherTextTwo').html('<b>Windspeed: </b>' + weatherObject.forecast[forecastDay].Rep[dayOrNight].S + " mph");        // Show wind speed
    extraHtmlSettings(forecastDay, dayOrNight);                                     // Adds extra weather information if user has selected this option.
    var dayToDisplay = getCurrentDay(currentSelectedDate);
    if (currentSelectedDate == daysForecastOutOfDate) {                             // If user selected date matches days forecast out of date...
        $('#dateText').html("Today " + "(" + dayToDisplay + ") - " + dayOrNightArray[selectDayOrNight]);  // Add "Today" to the HTML, will display e.g. Today (Monday) - Night Forecast
    } else {
        $('#dateText').html(dayToDisplay + " - " + dayOrNightArray[selectDayOrNight]);                    // Will display e.g. Wedesday - Day Forecast
    }
    if (firstTime == true) {                                                                              // If this is the first time the application has been run
        $.mobile.changePage('#weatherPageDialog', 'pop', true, true);                                     // Display welcome dialog.
        firstTime = false;
    }
}

/**
 * This method adds extra HTML whenever a forecast is displayed depending on whether the user has selected
 * to show extra weather information. It adds information on Wind Direction, Windspeed, Humidity, Precipitation Possibility
 * and UV Exposure. If extra information is not selected, it clears the HTML information.
 *
 * @param forecastDay An integer representing the days forecast to be displayed. Range 0-4.
 * @param dayOrNight An integer representing whether to show day or night forecast. 0 = day, 1 = night.
 */
function extraHtmlSettings(forecastDay, dayOrNight) {
    if (settingsArray[4]) {
        $('#weatherTextThree').html('<b>Wind Direction: </b>' + getWindDirection(weatherObject.forecast[forecastDay].Rep[dayOrNight].D));
        if (selectDayOrNight == 0) {
            $('#weatherTextTwo').html('<b>Windspeed: </b>' + weatherObject.forecast[forecastDay].Rep[dayOrNight].S + " mph with gusts of " + weatherObject.forecast[forecastDay].Rep[dayOrNight].Gn + " mph");
            $('#weatherTextFour').html('<b>Humidity: </b>' + weatherObject.forecast[forecastDay].Rep[dayOrNight].Hn + "%");
            $('#weatherTextFive').html('<b>Precipitation Possibility: </b>' + weatherObject.forecast[forecastDay].Rep[dayOrNight].PPd + "%");
            $('#weatherTextUV').html('<b>UV Exposure: </b>' + getUvExposure(weatherObject.forecast[forecastDay].Rep[dayOrNight].U));
        } else {
            $('#weatherTextTwo').html('<b>Windspeed: </b>' + weatherObject.forecast[forecastDay].Rep[dayOrNight].S + " mph with gusts of " + weatherObject.forecast[forecastDay].Rep[dayOrNight].Gm + " mph");
            $('#weatherTextFour').html('<b>Humidity: </b>' + weatherObject.forecast[forecastDay].Rep[dayOrNight].Hm + "%");
            $('#weatherTextFive').html('<b>Precipitation Probability: </b>' + weatherObject.forecast[forecastDay].Rep[dayOrNight].PPn + "%");
            $('#weatherTextUV').html('<b>UV Exposure: </b>' + "N/A")
        }
    } else {
        $('#weatherTextThree').html("");
        $('#weatherTextFour').html("");
        $('#weatherTextFive').html("");
        $('#weatherTextUV').html("")
    }
}
