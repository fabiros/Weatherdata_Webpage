const search_btn = $("#search_btn"), 
    owmapikey = "f4391175549a4fd94effb8fc8e04d02a", //API Key from OpenWeatherMap
    timezonedbapikey = '6JCH0DO00H1M', //API Key from TimeZoneDB
    btn2 = $("#btn2"),
    btn3 = $("#btn3")

let search_input = $("#searchbox_input"), 
    err_msg = $("#error_msg").hide(), //Error Message
    content = $("#content"), 
    coordinates = $("#coordinates").hide(),
    general = $("#general"), 
    wind = $("#wind"), 
    temperature = $("#temperature"), 
    date_time = $("#date_time"),
    input = '' //Store string when onkeyup at searchbox

content.hide() //Only show searchbox when no city is searched

search_btn.on("click", () => {
    weatherdata(search_input.val())
})

async function weatherdata(city) {
    let response = await makeWeatherRequest(city)
    let response2 = await makeDateTimeRequest(city, response.coord.lat, response.coord.lon)
    
    //Clear
    clearSearchResult()

    //Append Elements
    if(input.length <= 14) { //See Img when underneath 14 characters
        search_input.after(`<img id="countryflag" draggable="false" class="countryflag" src="https://www.countryflags.io/${response.sys.country.toLowerCase()}/flat/32.png" alt="Coutryflag">`) //Get Countryflag from choosen City
        $("#countryflag").css('margin-left', ((search_input.width()/2 - 32) + 'px')) //Position right edge of Input (32 comes from Img size)
    } else { //Remove Img when more then 14 characters
        $("#countryflag").remove()
    }
    
    coordinates.append(`<ul class="text">
        <li><b>Lon: </b>${response.coord.lon}</li>
        <li><b>Lat: </b>${response.coord.lat}</li>
        </ul>`).show()
    general.append(`<ul class="text">
        <li class="weather_condition">${response.weather[0].description}</li>
        <li class="weather_icon"><img src="http://openweathermap.org/img/w/${response.weather[0].icon}.png" alt="Current Weather"</li>
        <li><b>humidity: </b>${response.main.humidity}%</li>
        </ul>`)
    wind.append(`<ul class="text">
        <li><b>Speed: </b>${parseFloat(response.wind.speed * 3.6).toFixed(2)}km/h</li>
        <li><b>Direction: </b>${windDirection(response.wind.deg)}</li>
        </ul>`)

    temperature.append(calcTemperatur(response)) //Temperature is appended in Function

    let fomatted_date_time = response2.formatted.split(' ').join(' / ') //Add Slash
    date_time.append(`<p class="text">${fomatted_date_time}</p>`)
   
    content.show()
}

function makeWeatherRequest(city) { //API Call
    return new Promise((resolve, reject) => {
        console.log("Making Request to openweathermap API")
        $.getJSON(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${owmapikey}`, (data => resolve(data))) //API call
        .fail(err => { //Error
            (err_msg.text('Enter valid City!')).show() //Show it on UI
            reject(new Error(`Enter valid City! ${err}`))
        })
    }).then((result) => {
        console.log('Finished Request for Weather\n')
        return result //Return data
    }) 
}

function makeDateTimeRequest(city, lat, lon) {
    return new Promise((resolve, reject) => {
        console.log("Making Request to timezonedb API")
        $.getJSON(`http://api.timezonedb.com/v2.1/get-time-zone?key=${timezonedbapikey}&format=json&by=position&lat=${lat}&lng=${lon}`, (data => resolve(data))) //API call
        .fail(err => { //Error
            date_time.append(`<p class="text">Couldn't get access to Date and Time!</p>`)
            reject(new Error(`Couldn't find Date and Time for ${city}! ${err}`))
        })
    }).then((result) => {
        console.log('Finished Request for Date and Time')
        return result //Return data
    }) 
}

function windDirection(wind_deg) { //@param: Wind direction in Degrees
    let direction = ''
    if(wind_deg == 360) {
        wind_deg = 0
    }
    else {
        if(wind_deg >= 0 && wind_deg < 45) {
            direction = 'North'
        } else if (wind_deg >= 45 && wind_deg < 90) {
            direction = 'North East'
        } else if (wind_deg >= 90 && wind_deg < 135) {
            direction = 'East'
        } else if (wind_deg >= 135 && wind_deg < 180) {
            direction = 'South East'
        } else if (wind_deg >= 180 && wind_deg < 225) {
            direction = 'South'
        } else if (wind_deg >= 225 && wind_deg < 270) {
            direction = 'South West'
        } else if (wind_deg >= 270 && wind_deg < 315) {
            direction = 'West'
        } else if (wind_deg >= 315 && wind_deg < 360) {
            direction = 'North West'
        }
    }
    return direction
}

function calcTemperatur(response) { //@param: Weatherdata from OpenWeatherMap API
    let temp_cur = response.main.temp //Current Temperatur
    let temp_min = response.main.temp_min //Min Temperatur
    let temp_max = response.main.temp_max //Max Temperatur
    let temp_cur_array = ""
    let temp_min_array = ""
    let temp_max_array = ""

    //Btn2 (Celsius) is active by default => Calculate Kelvin to Celsius
    temp_cur = parseFloat((temp_cur - 273.15).toFixed(2)) + '°C'
    temp_min = parseFloat((temp_min - 273.15).toFixed(2)) + '°C'
    temp_max = parseFloat((temp_max - 273.15).toFixed(2)) + '°C'

    $('.temp_btn').on('click', function() {
        if($(this).attr('id') == 'btn2') {
            if(!btn2.hasClass("active")) { //Fahrenheit was active => Calculate Fahrenheit to Celsius
                 btn2.addClass("active")
                 btn3.removeClass("active")
               
                //Get only Numbers of String
                temp_cur_array = $("#temp_cur").text().match(/(\d+)/g)
                temp_min_array = $("#temp_min").text().match(/(\d+)/g)
                temp_max_array = $("#temp_max").text().match(/(\d+)/g)

                //Convert into Float
                temp_cur = parseFloat((temp_cur_array[0] + '.' + temp_cur_array[1]).replace('/°F',''))
                temp_min = parseFloat(temp_min_array[0] + '.' + temp_min_array[1])
                temp_max = parseFloat(temp_max_array[0] + '.' + temp_max_array[1])

                //Calculate Celisis
                //(73,4 °F − 32) × 5/9
                temp_cur = parseFloat((temp_cur - 32) / 1.8).toFixed(2) + '°C'
                temp_min = parseFloat((temp_min - 32) / 1.8).toFixed(2) + '°C'
                temp_max =  parseFloat((temp_max - 32) / 1.8).toFixed(2) + '°C'
            }
        } else {
            if(!btn3.hasClass("active")) { //Celsius was active => Calculate Celsius to Fahrenheit
                btn3.addClass("active")
                btn2.removeClass("active")
                
                //Get only Numbers of String
                temp_cur_array = $("#temp_cur").text().match(/(\d+)/g)
                temp_min_array = $("#temp_min").text().match(/(\d+)/g)
                temp_max_array = $("#temp_max").text().match(/(\d+)/g)

                //Convert into Float
                temp_cur = parseFloat(temp_cur_array[0] + '.' + temp_cur_array[1])
                temp_min = parseFloat(temp_min_array[0] + '.' + temp_min_array[1])
                temp_max = parseFloat(temp_max_array[0] + '.' + temp_max_array[1])

                //Calculate Fahrenheit
                temp_cur = parseFloat((temp_cur * 1.8) + 32).toFixed(2) + '°F'
                temp_min = parseFloat((temp_min * 1.8) + 32).toFixed(2) + '°F'
                temp_max = parseFloat(temp_max * 1.8 + 32).toFixed(2) + '°F'

                
            }
        }
        //Remove all Temperatures
        $(".temp_class").remove() 

        //Append temperatures new
        $(".temperature > .text").append(`<li class="temp_class" id="temp_cur"><b>Current: </b>${temp_cur}</li>
        <li class="temp_class" id="temp_min"><b>Min: </b>${temp_min}</li>
        <li class="temp_class" id="temp_max"><b>Max: </b>${temp_max}</li>`
        ) 
    })
    return `<ul class="text">
        <li class="temp_class" id="temp_cur"><b>Current: </b>${temp_cur}</li>
        <li class="temp_class" id="temp_min"><b>Min: </b>${temp_min}</li>
        <li class="temp_class" id="temp_max"><b>Max: </b>${temp_max}</li>
        </ul>`
}

function clearSearchResult() { //Clear everything appended
    $(".text").remove()
    $(".countryflag").remove()
    err_msg.hide()
}

function checkInput(value) { //Count string and remove Img of country
    content.hide()
    $(".text").remove()
    $("#countryflag").remove()
    input = value
}
