require("dotenv").config();
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const { url } = require("inspector");


const app = express();


// Generating Day and Date
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var today = new Date();
var day = weekdays[today.getDay()];
var date = today.getDate();
var month = months[today.getMonth()];
var year = today.getFullYear();
today = day + ", " + date + " " + month + " " + year;


// Declaring Variables
var cityName = '';
var temp = '-';
var tempMax = '-';
var tempMin = '-';
var tempFeels = '-';
var windSpeed = '-';
var humidity = '-';
var imageUrl = '';
var currentWeather = '---';
var errorMsg = '';


// Function for Rounding-off Temperature
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}



app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static("public"));

app.set('view engine', 'ejs');


// Get Request
app.get("/", function (req, res) {
    res.render('index', { city_name: cityName, temp: temp, weatherCondition: currentWeather, maxTemp: tempMax, minTemp: tempMin, weatherIcon: imageUrl, feels: tempFeels, humid: humidity, todaysDetail: today, speed: windSpeed, error: errorMsg });
});


// Post Request
app.post("/", function (req, res) {

    cityName = req.body.city.toUpperCase();

    const apiKey = process.env.Weather_Api_Key;
    const unit = "metric";
    const url = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey + "&units=" + unit;

    https.get(url, function (response) {
        console.log(response.statusCode);

        if (response.statusCode === 200) {
            errorMsg = '';
            response.on("data", function (data) {

                const weatherData = JSON.parse(data);

                // Sending Temperatures
                const temp_round = round(weatherData.main.temp, 1);
                temp = temp_round + '°C';
                const tmax_round = round(weatherData.main.temp_max, 1);
                tempMax = tmax_round + '°C';
                const tmin_round = round(weatherData.main.temp_min, 1);
                tempMin = tmin_round + '°C';
                tempFeels = round(weatherData.main.feels_like, 1) + '°C';

                // Sendng Humidity
                humidity = weatherData.main.humidity + ' %';

                // Sending Wind Speed
                windSpeed = round(weatherData.wind.speed, 1) + ' kmph';


                // Sending Current Weather
                const mySentence = weatherData.weather[0].description;
                const words = mySentence.split(" ");
                for (let i = 0; i < words.length; i++) {
                    words[i] = words[i][0].toUpperCase() + words[i].substr(1);
                }
                currentWeather = words.join(" ");

                // Sending Weather Icon
                const icon = weatherData.weather[0].icon;
                imageUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";

                res.redirect("/");
                res.send();
            });
        }
        else {
            temp = '-';
            tempMax = '-';
            tempMin = '-';
            tempFeels = '-';
            windSpeed = '-';
            humidity = '-';
            imageUrl = '';
            currentWeather = '---'
            errorMsg = "Weather seems unavailable for this city. Please check city name.";
            res.redirect("/");
            res.send();
        }
    });
});

app.get("/about", function (req, res) {
    res.render("about");
});

let port = process.env.PORT;
if(port == null || port == "") {
    port = 4000;
}

app.listen(port, function () {
    console.log("Server has started succesfully.");
});