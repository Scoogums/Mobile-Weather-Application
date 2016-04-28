/**
 * @fileOverview Constructors and methods for the weatherLocation object.
 * @author B00276551
 * @version 1
 */
var updatedForecast;

/**
 * @constructor
 * @param name Name of the location
 * @param id ID of the location
 * @param forecast 5 day forecast, contains REP object from Met Office
 */
function weatherLocation(name, id, forecast) {
    this.name = name;
    this.id = id;
    this.forecast = forecast;
    this.nameAsFavourite = "";
}


/**
 * This function deals with updating the forecast held by a weatherLocation object. Firstly, it checks if the user
 * has an internet connection. If they do, it makes a JSON call to the met office data feed and updates the currently
 * held forecast with a newer one.
 *
 * I had to update the weather object directly in this function. I'll have to look into it more, but when using a JSON call
 * or function in an objects prototype method the "this." doesn't seem to work. I also tried adding this.forecast = updatedForecast
 * at the end, but it fires off before the JSON call is finished, so was an unacceptable solution.
 *
 * As the program only ever uses one weatherLocation object at once, called weatherObject, this is alright for now. But if there
 * were multiple weatherLocations to be updated, this function would be useless. Unfortunately, I was unable to discover a
 * solution before the submission date.
 *
 * @param isFavourite A boolean value that determines whether the weatherPagePopup displays.
 */
weatherLocation.prototype.updateWeather = function (isFavourite) {
    if (checkNetConnection()) {
        console.log("Internet connection detected");
        var id = this.id;
        var req = $.getJSON('http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/' + id + '?res=daily&key=63ec69c4-2dcb-4455-bb14-b4a02c2a2c96', function (jd) {
            updatedForecast = jd.SiteRep.DV.Location.Period;
        });
        req.success(function (response) {
            console.log(updatedForecast);
            // this.forecast == updatedForecast  ---- The preferred method, but doesn't work.
            weatherObject.forecast = updatedForecast;
            console.log("Updated weather.");
            generateWeatherHtml(currentSelectedDate, selectDayOrNight);
            if (isFavourite == false) {
                $('#weatherUpdateText').html('The forecast for ' + weatherObject.name + ' has been succesfully updated.');
                $("#weatherPagePopup").popup("open");
            }
        });
    } else {
        $('#weatherUpdateText').html('Sorry, there appears to be a problem with your internet connection. Please try again when you have a stable connection.');
        $("#weatherPagePopup").popup("open");
        console.log("No internet connection detected.");
    }
};
