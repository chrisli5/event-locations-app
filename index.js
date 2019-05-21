const apiKey = `hLtKEoDHw7xeJ7OGajzvlcQEamDaxEDetjJ5aVka`;
const searchURL = `https://developer.nps.gov/api/v1/parks`;

let states = [ "AK",
                      "AL",
                      "AR",
                      "AS",
                      "AZ",
                      "CA",
                      "CO",
                      "CT",
                      "DC",
                      "DE",
                      "FL",
                      "GA",
                      "GU",
                      "HI",
                      "IA",
                      "ID",
                      "IL",
                      "IN",
                      "KS",
                      "KY",
                      "LA",
                      "MA",
                      "MD",
                      "ME",
                      "MI",
                      "MN",
                      "MO",
                      "MS",
                      "MT",
                      "NC",
                      "ND",
                      "NE",
                      "NH",
                      "NJ",
                      "NM",
                      "NV",
                      "NY",
                      "OH",
                      "OK",
                      "OR",
                      "PA",
                      "PR",
                      "RI",
                      "SC",
                      "SD",
                      "TN",
                      "TX",
                      "UT",
                      "VA",
                      "VI",
                      "VT",
                      "WA",
                      "WI",
                      "WV",
                      "WY"]

var map;
var markers = [];
var listeners = [];
var prevInfoWindow = false;

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
  return queryItems.join('&');
};

function makeContent(item) {
  const contentString = `
  <div class="content">
    <h1>${item.name}</h1>
    <h2>${item.designation}</h2>
    <p>${item.description}</p>
    <h3>Weather Conditions</h3>
    <p>${item.weatherInfo}</p>
    <h3>Driving Information</h3>
    <p>${item.directionsInfo}</p>
  </div>
  `;

  return new google.maps.InfoWindow({
    content: contentString,
  });
}

function addMarker(item) {
  const image = {
    url: 'mountain-solid.svg',
    size: new google.maps.Size(65, 65),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(23, 23)
  };

  const marker = new google.maps.Marker({
    position: formatLatLong(item.latLong),
    icon: image,
    map: map,
  });

  const content = makeContent(item);

  const listener = google.maps.event.addDomListener(marker, 'click', function() {
    if(prevInfoWindow) {
      prevInfoWindow.close();
    }
    prevInfoWindow = content;
    content.open(map, marker);
  });

  markers.push(marker);
  listeners.push(listener);
}

function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function removeListeners() {
  for( var i = 0; i < listeners.length; i++) {
    listeners[i].remove();
  }
  listeners = [];
}

function deleteMarkers() {
  setMapOnAll(null);
  markers = [];
}

function geocodeAddress(address) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'address': address }, function(results, status) {
    if (status == 'OK') {
      map.setCenter(results[0].geometry.location);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  })
}

function getCoord(str, char) {
  const start = str.indexOf(char) + 1;
  return parseFloat(str.slice(start));
}

function formatLatLong(latLong) {
  if (latLong) {
    const arr = latLong.split(', ');
    const lat = getCoord(arr[0], ':');
    const lng = getCoord(arr[1], ':');
    
    return {
      lat,
      lng,
    }
  }

  return null;
}

function getParks(stateCode) {
  const params = {
    stateCode,
    api_key: apiKey,
  }

  const queryString = formatQueryParams(params);
  const url = searchURL + '?' + queryString;

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
    })
    .then(responseJson => {
      responseJson.data.forEach(item => {
        addMarker(item);
      });
      setMapOnAll(map);
    })
    .catch (e => {
      alert('Error searching for parks!');
    });
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 10
  });

  $('form').submit(function(event) {
    event.preventDefault();
    deleteMarkers();
    removeListeners();

    const city = $('#city').val();
    const stateCode = $('#state').val().toUpperCase();
    const address = `${city}, ${stateCode}`;

    if (states.indexOf(stateCode) > -1) {
      geocodeAddress(address);
      getParks(stateCode);
    } else {
      alert('Invalid state code!');
    }
  });
}

function closeIntro() {
  $('#intro-button').click(function(event) {
    event.preventDefault();
    $('#intro').hide();
  })
}

$(closeIntro);