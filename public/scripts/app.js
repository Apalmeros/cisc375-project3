

let app;
let map;
let table;
let neighborhood_markers = 
[
    {location: [44.942068, -93.020521], marker: "Southeast"},
    {location: [44.977413, -93.025156], marker: "Greater East Side"},
    {location: [44.931244, -93.079578], marker: "West Side"},
    {location: [44.956192, -93.060189], marker: "Dayton's Bluff"},
    {location: [44.978883, -93.068163], marker: "Payne - Phalen"},
    {location: [44.975766, -93.113887], marker: "North End"},
    {location: [44.959639, -93.121271], marker: "Frogtown"},
    {location: [44.947700, -93.128505], marker: "Summit - University"},
    {location: [44.930276, -93.119911], marker: "West Seventh - Fort Road"},
    {location: [44.982752, -93.147910], marker: "Como Park"},
    {location: [44.963631, -93.167548], marker: "Hamline - Midway"},
    {location: [44.973971, -93.197965], marker: "Saint Anthony Park"},
    {location: [44.949043, -93.178261], marker: "Union Park"},
    {location: [44.934848, -93.176736], marker: "Macalester - Groveland"},
    {location: [44.913106, -93.170779], marker: "Highland"},
    {location: [44.937705, -93.136997], marker: "Summit Hill"},
    {location: [44.949203, -93.093739], marker: "Downtown"}
];

function init() {
    let crime_url = 'http://localhost:8000';

    app = new Vue({
        el: '#app',
        data: {
            map: {
                center: {
                    lat: 44.955139,
                    lng: -93.102222,
                    address: "Minnesota State Capitol"
                },
                zoom: 12,
                bounds: {
                    nw: {lat: 45.008206, lng: -93.217977},
                    se: {lat: 44.883658, lng: -92.993787}
                }
                // add fields for our table
            },
            table: {
                items: []    
            }
            //get request for url lat and long address
            //https://nominatim.openstreetmap.org/search?q=University%20of%20St.%20Thomas&format=json&accept-language=en           
         
        }
    });
    
    let json_codes = getJSON(crime_url + "/codes");
    let json_neighborhoods = getJSON(crime_url + "/neighborhoods");
    let json_incidents = getJSON(crime_url + "/incidents?limit=5");
    //let coords = getJSON("https:nominatim.openstreetmap.org/search?q=" "&format=json&accept-language=en")
    /*
    Promise.all([json_incidents]).then((data) => {
        
        for(let i = 0; i<data[0].length; i++)
        {
            app.table.items.push(data[0][i]);
            
        }
    });
    */
    //create vue on-click button with address input.
    //change app.map.center.lat and app.map.center.lng to new lat and lng of address
    //change bounds
    map = L.map('leafletmap').setView([app.map.center.lat, app.map.center.lng], app.map.zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 11,
        maxZoom: 18
    }).addTo(map);
    map.setMaxBounds([[44.883658, -93.217977], [45.008206, -92.993787]]);

   /* this was an attempt to make a dynamic table
    map.on('moveend', function() {
        let bounds = map.getBounds();
        //console.log(bounds);
        Promise.all([json_incidents]).then((data) => {
            for(let i = 0; i<data[0].length; i++)
            {
                //app.table.items.push(data[0][i]);
                let coords = getJSON("https:nominatim.openstreetmap.org/search?q=" + data[0][i].block + "&format=json&accept-language=en");
                coords.then((values) => {
                    if(bounds.contains([values[0].lat, values[0].lon]))
                    {
                        app.table.items.push(data[0][i]);
                    }
                });
            }
        });
    });
    */
    map.on('moveend', function() {
        let center = map.getCenter();
        app.map.center.lat = center.lat;
        app.map.center.lng = center.lng;

        let request = {
            url: "https:nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" + app.map.center.lat + "&lon=" + app.map.center.lng,
            dataType: "json",
            success: moveCenter
            // use getJson for url's
        };
        $.ajax(request);
        function moveCenter(data)
        {
            app.map.center.address = data.display_name.substr(0, data.display_name.indexOf(','));
        }
        // incidents query
    });

    
    
    let district_boundary = new L.geoJson();
    district_boundary.addTo(map);

    getJSON('data/StPaulDistrictCouncil.geojson').then((result) => {
        // St. Paul GeoJSON
        $(result.features).each(function(key, value) {
            district_boundary.addData(value);
        });
    }).catch((error) => {
        console.log('Error:', error);
    });

    var map_marker = L.icon({
        iconUrl: 'images/map-marker.png',
    
        iconSize:     [(30), (50)], // size of the icon
        iconAnchor:   [(15), (50)], // point of the icon which will correspond to marker's location
        popupAnchor:  [(0), (0)] // point from which the popup should open relative to the iconAnchor
    }); 
    let i;
    for(i = 0; i < neighborhood_markers.length; i++)
    {
        L.marker(neighborhood_markers[i].location, {icon: map_marker}).addTo(map).bindPopup(neighborhood_markers[i].marker);
    }

    let neighborhood_count = getJSON(crime_url + "/incidents");
    neighborhood_count.then((data) => {
        console.log(data);
        let id_1 = 0;
        let id_2 = 0;
        let id_3 = 0;
        let id_4 = 0;
        let id_5 = 0;
        let id_6 = 0;
        let id_7 = 0;
        let id_8 = 0;
        let id_9 = 0;
        let id_10 = 0;
        let id_11 = 0;
        let id_12 = 0;
        let id_13 = 0;
        let id_14 = 0;
        let id_15 = 0;
        let id_16 = 0;
        let id_17 = 0;

        for(let i=0; i<data.length; i++)
        {
            if(data[i].neighborhood_number === 1)
            {
                id_1 ++;
            }
            if(data[i].neighborhood_number === 2)
            {
                id_2 ++;
            }
            if(data[i].neighborhood_number === 3)
            {
                id_3 ++;
            }
            if(data[i].neighborhood_number === 4)
            {
                id_4 ++;
            }
            if(data[i].neighborhood_number === 5)
            {
                id_5 ++;
            }
            if(data[i].neighborhood_number === 6)
            {
                id_6 ++;
            }
            if(data[i].neighborhood_number === 7)
            {
                id_7 ++;
            }
            if(data[i].neighborhood_number === 8)
            {
                id_8 ++;
            }
            if(data[i].neighborhood_number === 9)
            {
                id_9 ++;
            }
            if(data[i].neighborhood_number === 10)
            {
                id_10 ++;
            }
            if(data[i].neighborhood_number === 11)
            {
                id_11 ++;
            }
            if(data[i].neighborhood_number === 12)
            {
                id_12 ++;
            }
            if(data[i].neighborhood_number === 13)
            {
                id_13 ++;
            }
            if(data[i].neighborhood_number === 14)
            {
                id_14 ++;
            }
            if(data[i].neighborhood_number === 15)
            {
                id_15 ++;
            }
            if(data[i].neighborhood_number === 16)
            {
                id_16 ++;
            }
            if(data[i].neighborhood_number === 17)
            {
                id_17 ++;
            }

        }
    });
    
}
function getJSON(url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            dataType: "json",
            url: url,
            success: function(data) {
                resolve(data);
            },
            error: function(status, message) {
                reject({status: status.status, message: status.statusText});
            }
        });
    });
}

function nominationSearch(event){
    let request = {
        url: "https:nominatim.openstreetmap.org/search?q=" + app.map.center.address + "&format=json&accept-language=en",
        dataType: "json",
        success: searchData
    };
    $.ajax(request);
    function searchData(data)
    {
        app.map.center.lat= data[0].lat;
        app.map.center.lng = data[0].lon;
        map.panTo(new L.LatLng(data[0].lat, data[0].lon));
    }
}

function nominationReverse(event)
{
    let request = {
        url: "https:nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" + app.map.center.lat + "&lon=" + app.map.center.lng,
        dataType: "json",
        success: searchCoord
    };
    $.ajax(request);
    function searchCoord(data)
    {
        app.map.center.address = data.display_name.substr(0, data.display_name.indexOf(','));
        map.panTo(new L.LatLng(app.map.center.lat, app.map.center.lng));
    }
};






// convert address to latitude and longitude
//create a function that updates lat/long when map is panned and zoomed
