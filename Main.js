//javascript.js
//set map options
var myLatLng = { lat: 50.48690456123504, lng: 30.521461232723393 };
var mapOptions = {
  center: myLatLng,
  zoom: 11,
  mapTypeId: google.maps.MapTypeId.ROADMAP,
};

//create map
var map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);

//create a DirectionsService object to use the route method and get a result for our request
var directionsService = new google.maps.DirectionsService();

//create a DirectionsRenderer object which we will use to display the route
var directionsDisplay = new google.maps.DirectionsRenderer();

//bind the DirectionsRenderer to the map
directionsDisplay.setMap(map);

//define calcRoute function
function calcRoute() {
  //create request
  var request = {
    origin: document.getElementById("from").value,
    destination: document.getElementById("to").value,
    travelMode: google.maps.TravelMode.DRIVING, //WALKING, BYCYCLING, TRANSIT
    unitSystem: google.maps.UnitSystem.METRIC,
    provideRouteAlternatives: true,
    region: "UA",
  };

  //pass the request to the route method
  directionsService.route(request, function (result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      //Get distance and time
      const output = document.querySelector("#output");
      const Tarif = Math.round(
        300 + (Math.round(result.routes[0].legs[0].distance.value) / 1000) * 18
      );
      const Tarif2 = Math.round(
        720 + (Math.round(result.routes[0].legs[0].distance.value) / 1000) * 40
      );
      const Tarif3 = Math.round(
        1900 + (Math.round(result.routes[0].legs[0].distance.value) / 1000) * 60
      );
      output.innerHTML =
        "<div>Растояние <i class='fas fa-road'></i> : " +
        result.routes[0].legs[0].distance.text +
        ". <br />Время пути <i class='fas fa-hourglass-start'></i> : " +
        result.routes[0].legs[0].duration.text +
        "<br /> <br /><b>Тариф до 1,5т:</b> " +
        new Intl.NumberFormat("ru-RU").format(Tarif) +
        " грн.<br /> <b>Тариф до 3,5т:</b> " +
        new Intl.NumberFormat("ru-RU").format(Tarif2) +
        " грн.<br /> <b>Тариф до 12т с манипулятором:</b> " +
        new Intl.NumberFormat("ru-RU").format(Tarif3) +
        " грн.</div>";
      //display route
      directionsDisplay.setDirections(result);
      bounds.union(result.routes[0].bounds);
      console.log(result.routes[0]);
    } else {
      //delete route from map
      directionsDisplay.setDirections({ routes: [] });
      //center map
      map.setCenter(myLatLng);

      //show error message
      output.innerHTML =
        "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Could not retrieve driving distance.</div>";
    }
  });
}

//create autocomplete objects for all inputs
var options = {
  fields: ["formatted_address", "geometry", "name"],
  strictBounds: false,
  types: ["establishment"],
};

var input1 = document.getElementById("from");
var autocomplete1 = new google.maps.places.Autocomplete(input1, options);

var input2 = document.getElementById("to");
var autocomplete2 = new google.maps.places.Autocomplete(input2, options);
