

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
                items: [],
                codes_incident_types: [],
                neighborhood_names: []

            }
            //get request for url lat and long address
            //https://nominatim.openstreetmap.org/search?q=University%20of%20St.%20Thomas&format=json&accept-language=en           
         
        },
        methods: {
            getIncidentType(item){
                let i;
                for(i = 0; i <app.table.codes_incident_types.length; i++ )
                {
                    if(item == app.table.codes_incident_types[i].code)
                    {
                        return app.table.codes_incident_types[i].type;
                    }
                }
            },
            getNeighborhoodName(item){
                let i;
                for(i = 0; i <app.table.neighborhood_names.length; i++)
                {
                    if(item == app.table.neighborhood_names[i].id)
                    {
                        return app.table.neighborhood_names[i].name;
                    }
                }
            },
            getTableClass(item)
            {
                if(item <= 453 && item >= 400)
                {
                    return "redRow";
                }

                if(item <= 982 && item >= 900)
                {
                    return "redRow";
                }
                if(item <= 220 && item >= 210)
                {
                    return "redRow";
                }
                if(item <= 863 && item >= 810)
                {
                    return "redRow";
                }
                if(item <= 566 && item >= 500)
                {
                    return "yellowRow"
                }
                if(item <= 613 && item >= 600)
                {
                    return "yellowRow";
                }
                if(item <= 722 && item >= 621)
                {
                    return "yellowRow";
                }
                else{

                    return "blueRow";
                }
            },
            addMarker(event)
            {
                let i;
                let value =  event.target.id;
                //console.log(value);
                let num = parseInt(value);
                //console.log(num);
                let marker_string = '';
                let btn = document.createElement('button');
                for(i = 0; i < app.table.items.length; i++)
                {
                    if(i == num)
                    {
                        //console.log(app.table.items[i].block);
                        marker_string = 'Date: ' + app.table.items[i].date + ' Time: ' + app.table.items[i].time + ' Incident: ' + app.table.items[i].incident;
                        let url = getJSON("https:nominatim.openstreetmap.org/search?q=" + app.table.items[i].block + "&format=json&accept-language=en");
                        url.then((data) => {


                            app.map.center.lat = data[0].lat;
                            app.map.center.lng = data[0].lon;
                            map.panTo(new L.LatLng(app.map.center.lat, app.map.center.lng));

                            var mp = L.marker([app.map.center.lat,app.map.center.lng], {icon: incident_marker}).addTo(map).bindPopup(marker_string + '</br>' + btn);

                            btn.innerText = 'Delete Marker';
                            btn.onclick =  function() {
                                map.removeLayer(mp);
                            }


                        });
                    }

                }
            }
            
        }
    });
    
    let json_codes = getJSON(crime_url + "/codes");
    let json_neighborhoods = getJSON(crime_url + "/neighborhoods");
    let json_incidents = getJSON(crime_url + "/incidents?limit=100");
    
    Promise.all([json_codes, json_neighborhoods]).then((data) => {
        for(let i=0; i<data[0].length; i++)
        {
            app.table.codes_incident_types.push(data[0][i]);
        }
        for(let i=0; i<data[1].length; i++)
        {
            app.table.neighborhood_names.push(data[1][i]);
        }
    });

    
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

   //this was an attempt to make a dynamic table
    map.on('moveend', function() {
        app.table.items = [];
        let temp = [];
        let bounds = map.getBounds();
        let search = 'X';
        let replaceWith = '0';
        json_incidents.then((data) =>{
            //console.log(data);

            for(let i=0; i<data.length; i++)
            {
                if(bounds.contains(neighborhood_markers[0].location) && data[i].neighborhood_number == 1)
                {
                    temp.push(data[i]);
                }
                if(bounds.contains(neighborhood_markers[1].location) && data[i].neighborhood_number == 2)
                {
                    temp.push(data[i]);
                }
                if(bounds.contains(neighborhood_markers[2].location) && data[i].neighborhood_number == 3)
                {
                    temp.push(data[i]);
                }
                if(bounds.contains(neighborhood_markers[3].location) && data[i].neighborhood_number == 4)
                {
                    temp.push(data[i]);
                }
                if(bounds.contains(neighborhood_markers[4].location) && data[i].neighborhood_number == 5)
                {
                    temp.push(data[i]);
                }
                if(bounds.contains(neighborhood_markers[5].location) && data[i].neighborhood_number == 6)
                {
                    temp.push(data[i]);
                }
                if(bounds.contains(neighborhood_markers[6].location) && data[i].neighborhood_number == 7)
                {
                    temp.push(data[i]);
                }
                if(bounds.contains(neighborhood_markers[7].location) && data[i].neighborhood_number == 8)
                {
                    temp.push(data[i]);
                }
                if(bounds.contains(neighborhood_markers[8].location) && data[i].neighborhood_number == 9)
                {
                    temp.push(data[i]);
                }
                if(bounds.contains(neighborhood_markers[9].location) && data[i].neighborhood_number == 10)
                {
                    temp.push(data[i]);
                }
                if(bounds.contains(neighborhood_markers[10].location) && data[i].neighborhood_number == 11)
                {
                    temp.push(data[i]);
                }
                if(bounds.contains(neighborhood_markers[11].location) && data[i].neighborhood_number == 12)
                {
                    temp.push(data[i]);
                }
                if(bounds.contains(neighborhood_markers[12].location) && data[i].neighborhood_number == 13)
                {
                    temp.push(data[i]);
                }
                if(bounds.contains(neighborhood_markers[13].location) && data[i].neighborhood_number == 14)
                {
                    temp.push(data[i]);
                }
                if(bounds.contains(neighborhood_markers[14].location) && data[i].neighborhood_number == 15)
                {
                    temp.push(data[i]);
                }
                if(bounds.contains(neighborhood_markers[15].location) && data[i].neighborhood_number == 16)
                {
                    temp.push(data[i]);
                }
                if(bounds.contains(neighborhood_markers[16].location) && data[i].neighborhood_number == 17)
                {
                    temp.push(data[i]);
                }
            }
        });
        app.table.items = temp;
    });
    
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

    var incident_marker = L.icon({
        iconUrl: "images/map-marker-2.png",

        iconSize:       [(30), (50)], // size of incident icon
        iconAnchor:     [(15), (50)], // point of the icon which will correspond to marker's location
        popupAnchor:    [(0), (0)]    // point from which the popup should open relative to the iconAnchor
    });

    let neighborhood_count = getJSON(crime_url + "/incidents");
    neighborhood_count.then((data) => {
        //console.log(data);
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
                id_1++;
            }
            if(data[i].neighborhood_number === 2)
            {
                id_2++;
            }
            if(data[i].neighborhood_number === 3)
            {
                id_3++;
            }
            if(data[i].neighborhood_number === 4)
            {
                id_4++;
            }
            if(data[i].neighborhood_number === 5)
            {
                id_5++;
            }
            if(data[i].neighborhood_number === 6)
            {
                id_6++;
            }
            if(data[i].neighborhood_number === 7)
            {
                id_7++;
            }
            if(data[i].neighborhood_number === 8)
            {
                id_8++;
            }
            if(data[i].neighborhood_number === 9)
            {
                id_9++;
            }
            if(data[i].neighborhood_number === 10)
            {
                id_10++;
            }
            if(data[i].neighborhood_number === 11)
            {
                id_11++;
            }
            if(data[i].neighborhood_number === 12)
            {
                id_12++;
            }
            if(data[i].neighborhood_number === 13)
            {
                id_13++;
            }
            if(data[i].neighborhood_number === 14)
            {
                id_14++;
            }
            if(data[i].neighborhood_number === 15)
            {
                id_15++;
            }
            if(data[i].neighborhood_number === 16)
            {
                id_16++;
            }
            if(data[i].neighborhood_number === 17)
            {
                id_17++;
            }
        }

        marker_string_1 = neighborhood_markers[0].marker + ', Crimes: ' + id_1;
        marker_string_2 = neighborhood_markers[1].marker + ', Crimes: ' + id_2;
        marker_string_3 = neighborhood_markers[2].marker + ', Crimes: ' + id_3
        marker_string_4 = neighborhood_markers[3].marker + ', Crimes: ' + id_4;
        marker_string_5 = neighborhood_markers[4].marker + ', Crimes: ' + id_5;
        marker_string_6 = neighborhood_markers[5].marker + ', Crimes: ' + id_6;
        marker_string_7 = neighborhood_markers[6].marker + ', Crimes: ' + id_7;
        marker_string_8 = neighborhood_markers[7].marker + ', Crimes: ' + id_8;
        marker_string_9 = neighborhood_markers[8].marker + ', Crimes: ' + id_9;
        marker_string_10 = neighborhood_markers[9].marker + ', Crimes: ' + id_10;
        marker_string_11 = neighborhood_markers[10].marker + ', Crimes: ' + id_11;
        marker_string_12 = neighborhood_markers[11].marker + ', Crimes: ' + id_12;
        marker_string_13 = neighborhood_markers[12].marker + ', Crimes: ' + id_13;
        marker_string_14 = neighborhood_markers[13].marker + ', Crimes: ' + id_14;
        marker_string_15 = neighborhood_markers[14].marker + ', Crimes: ' + id_15;
        marker_string_16 = neighborhood_markers[15].marker + ', Crimes: ' + id_16;
        marker_string_17 = neighborhood_markers[16].marker + ', Crimes: ' + id_17;

        L.marker(neighborhood_markers[0].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_1);
        L.marker(neighborhood_markers[1].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_2);
        L.marker(neighborhood_markers[2].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_3);
        L.marker(neighborhood_markers[3].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_4);
        L.marker(neighborhood_markers[4].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_5);
        L.marker(neighborhood_markers[5].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_6);
        L.marker(neighborhood_markers[6].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_7);
        L.marker(neighborhood_markers[7].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_8);
        L.marker(neighborhood_markers[8].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_9);
        L.marker(neighborhood_markers[9].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_10);
        L.marker(neighborhood_markers[10].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_11);
        L.marker(neighborhood_markers[11].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_12);
        L.marker(neighborhood_markers[12].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_13);
        L.marker(neighborhood_markers[13].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_14);
        L.marker(neighborhood_markers[14].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_15);
        L.marker(neighborhood_markers[15].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_16);
        L.marker(neighborhood_markers[16].location, {icon: map_marker}).addTo(map).bindPopup(marker_string_17);
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
