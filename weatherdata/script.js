

const content = $("#content"), search_btn = $("#search_btn"), appid = "f4391175549a4fd94effb8fc8e04d02a"
let search_input = $("#searchbox_input"), err_msg = $("#error_msg")

content.hide(); //Only show searchbox when no city is searched

search_btn.on("click", () => {
    ((search_input.val() == "")) ? err_msg.append('<p>Please enter a City</p>') : err_msg.append('dfss')
    weatherdata(search_input.val())
})

async function weatherdata(city) {
    await makeRequest(city)
    console.log('Request done')
}

function makeRequest (city) {
    let promise = new Promise(function(resolve, reject) {
        resolve("done");

        reject(new Error("…")); // ignored
        console.log("Making Request to openweathermap API");
        $.getJSON(`http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${appid}`, (data) => {
            console.log('sadadas')
            
        }).fail(() => reject(`Request for data of ${city} failed`))
        resolve(`Request for data of ${city} finished`)
    })
}


//err_msg.append(`<p>${} is wrong spelled or not available</p>`)"api.openweathermap.org/data/2.5/weather?q=London&APPID=f4391175549a4fd94effb8fc8e04d02a"