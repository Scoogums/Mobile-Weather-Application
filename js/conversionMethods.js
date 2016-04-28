/**
 * @fileOverview Contains code for performing conversions or matching met office data to Strings describing their purpose.
 * To see how the array values correlate with the met office data, consult Page 9, 10 and 11 of http://www.metoffice.gov.uk/media/pdf/3/0/DataPoint_API_reference.pdf
 *
 * There are also methods here for displaying days of the week, months of the year and sixteen point compass directions in String format.
 * @author B00276551
 * @version 1
 */

/** @module Conversion Methods */

var visibility = ["Unknown", "Very poor - Less than 1 km", "Poor - Between 1-4 km", "Moderate - Between 4-10 km",
    "Good - Between 10-20km", "Very good - Between 20-40 km", "Excellent - More than 40km"];
var sixteenPointCompass = ["North", "North-northeast", "Northeast", "East-northeast", "East", "East-southeast", "Southeast", "South-southeast",
    "South", "South-southwest", "Southwest", "West-southwest", "West", "West-northwest", "Northwest", "North-northwest"];
var uvExposure = ["Low", "Moderate", "High", "Very high", "Extreme"];
var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var monthNames = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * This function takes in a string from a weatherLocation object and matches it to the corresponding
 * value in the visibility[] array.
 *
 * @param str The String to be matched.
 * @returns {string} String from the visibility[] array.
 */
function getVisibility(str) {
    switch (str) {
        case "UN":
            return visibility[0];
        case "VP":
            return visibility[1];
        case "PO":
            return visibility[2];
        case "MO":
            return visibility[3];
        case "GO":
            return visibility[4];
        case "VG":
            return visibility[5];
        case "EX":
            return visibility[6];
    }
};

/**
 * This function takes in a string from a weatherLocation object and matches it to the corresponding
 * value in the uvExposure[] Array.
 * @param str The String to be matched.
 * @returns {string} String from the uvExposure[] array.
 */
function getUvExposure(str) {
    switch (str) {
        case "1":
        case "2":
            return uvExposure[0];
        case "3":
        case "4":
        case "5":
            return uvExposure[1];
        case "6":
        case "7":
            return uvExposure[2];
        case "8":
        case "9":
        case "10":
            return uvExposure[3];
        default:
            return uvExposure[4];
    }
}

/**
 * This function takes in a string from a weatherLocation object and matches it to the corresponding
 * value in the sixteenPointCompass[] Array.
 * @param str The String to be matched.
 * @returns {string} String from the sixteenPointCompass[] Array.
 */
function getWindDirection(str) {
    switch (str) {
        case "N":
            return sixteenPointCompass[0];
        case "NNE":
            return sixteenPointCompass[1];
        case "NE":
            return sixteenPointCompass[2];
        case "ENE":
            return sixteenPointCompass[3];
        case "E":
            return sixteenPointCompass[4];
        case "ESE":
            return sixteenPointCompass[5];
        case "SE":
            return sixteenPointCompass[6];
        case "SSE":
            return sixteenPointCompass[7];
        case "S":
            return sixteenPointCompass[8];
        case "SSW":
            return sixteenPointCompass[9];
        case "SW":
            return sixteenPointCompass[10];
        case "WSW":
            return sixteenPointCompass[11];
        case "W":
            return sixteenPointCompass[12];
        case "WNW":
            return sixteenPointCompass[13];
        case "NW":
            return sixteenPointCompass[14];
        case "NNW":
            return sixteenPointCompass[15];
    }
};

/**
 * This function takes in a int value corresponding to the day of the weatherLocation object forecast to be
 * displayed. The function first creates a Date object corresponding to the forecast day and then uses
 * the Date objects getDay() method and passes this value into the daysOfWeek[] Array to get the day
 * of the week.
 *
 * Code for this method from: http://www.w3schools.com/jsref/jsref_getday.asp
 *
 * @param forecastDay Int value ranging from 0-4.
 * @returns {string} A String value holding a day of the week from the daysOfWeek[] Array.
 */
function getCurrentDay(forecastDay) {
    var forecastDate = Date.parse(weatherObject.forecast[forecastDay].value);
    var parsedDate = new Date(forecastDate);
    return daysOfWeek[parsedDate.getDay()];
}

/**
 * Converts Celcius to Fahrenheit.
 *
 * @param temp Celcius value to be converted.
 * @returns {number|*} Returns converted temperature.
 */
function convertToFahrenheit(temp) {
    temp = Math.round(temp * 9 / 5 + 32);
    return temp;
}

/**
 * This function returns a date String to be displayed. When created, the String will look something like:
 * Wednesday 27 April 2016.
 *
 * First the function creates a Date object from the weatherLocation object day to be displayed. A string is then generated
 * using this Date object using the daysOfWeek[] and monthNames[] Arrays. It also calls the Date objects getDate() and
 * getFullYear() functions.
 *
 * @param forecastDay
 * @returns {string}
 */
function dateString(forecastDay) {
    var forecastDate = Date.parse(weatherObject.forecast[forecastDay].value);
    var parsedDate = new Date(forecastDate);
    var dateString = "";
    dateString += daysOfWeek[parsedDate.getDay()] + " " + parsedDate.getDate() + " " + monthNames[parsedDate.getMonth()] + " " + parsedDate.getFullYear();
    return dateString;
}