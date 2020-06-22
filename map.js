
// ID of the Google Spreadsheet. Replace this value with your ID.
const spreadsheetID = "1F3Oc5CDl2FFab8F_iYxvV9gq41ZXyWi6sTHBsT9o-sQ";

// A link to a Google Sheets JSON access point
// Make sure it is public or set to Anyone with link can view.
const DATA_SERVICE_URL = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/default/public/values?alt=json";
let info;
let map;

function addMarker(avalue) {
  let lat = parseFloat(avalue.gsx$latitude.$t);
  let lng = parseFloat(avalue.gsx$longitude.$t);
  let latLng;
  if (!isNaN(lat) && !isNaN(lng)) {
    latLng = new google.maps.LatLng(lat, lng);
  }
  if (!latLng) {
    return;
  }

  let marker = new google.maps.Marker({
    animation: google.maps.Animation.DROP,
    map: map,
    position: latLng,
  });

  google.maps.event.addListener(marker, 'click', function(){
      showInfo(marker, avalue);
  });

  return marker;
}

function showInfo(aMarker, avalue){
  let content = "<h3>"+avalue.gsx$locatie.$t+"</h3>";
  content += "<p>Wie: "+avalue.gsx$namen.$t+"</p>";
  content += "<p>Wanneer: "+avalue.gsx$periodestarteneinddatum.$t+"</p>";
  content += "<p>Wat: "+avalue.gsx$activiteitenwandelensportklimmenalpienetc.$t+"</p>";
  info.setContent(content);
  info.open(map, aMarker);
}

function initMap() {
  info = new google.maps.InfoWindow();
  map = new google.maps.Map(document.getElementById("map_canvas"), {
    center: new google.maps.LatLng(46, 9),
    zoom: 6,
    maxZoom: 20,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      },
      {
        featureType: "road",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{visibility: 'off'}]
      },
      {
        featureType: 'road.highway',
        stylers: [{visibility: 'off'}]
      },
      {
        featureType: 'transit',
        stylers: [{visibility: 'off'}]
      },
    ],
  });

  // Perform request
  let request = new XMLHttpRequest();
  request.open('GET', DATA_SERVICE_URL, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      let data = JSON.parse(request.responseText);
      let markers = [];
      for (var i = 0; i < data.feed.entry.length; i++) {
        let value = data.feed.entry[i];
        //var keys = Object.keys(value)
        //window.alert(keys)
        markers.push(addMarker(value));
        if (i === data.feed.entry.length - 1) {
          let lat = parseFloat(value.gsx$latitude.$t);
          let lng = parseFloat(value.gsx$longitude.$t);
          if (!isNaN(lat) && !isNaN(lng)) {
            let latLng = new google.maps.LatLng(lat, lng);
            if (latLng) {
              map.panTo(latLng);
            }
          } 
        }
      }
    } else {
      console.error("Error fetching spreadsheet data.");
    }
  };


  request.onerror = function() {
    console.error("Error fetching spreadsheet data.");
  };

  request.send();
}

// Focus map to the most recently-added pin.
window.addEventListener("load", function () {
  function sendData() {
    let a = document.querySelector('input#location').value;
    const geo = new google.maps.Geocoder();
    geo.geocode({"address" : a }, function(result, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        let lat = result[0].geometry.location.lat();
        let lng = result[0].geometry.location.lng();
  
        if (isNaN(lat) || isNaN(lng)) {
          alert("Something's gone wrong. Try entering a different location for your book.");
          return;
        }
  
        document.querySelector("input#latitude").value = lat;
        document.querySelector("input#longitude").value = lng;

        form.submit();
      } else {
        alert("Something's gone wrong. Try entering a different location for your book.");
      }
    });
  }
 
  // Access the form element...
  var form = document.getElementById("bookForm");

  // ...and take over its submit event.
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    sendData();
  });
});

/** 
 * Set up form autocomplete
 */
let autocomplete = new google.maps.places.Autocomplete(
  /** @type {!HTMLInputElement} */(document.getElementById('location')),
  {types: ['geocode']});
