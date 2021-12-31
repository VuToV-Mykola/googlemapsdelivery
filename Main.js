let district;
const output = document.querySelector("#output");
$("body").on("focus", ".searchTextField", function () {
  $(this).select();
  output.innerHTML="";
});

//set map options
var myLatLng = { lat: 50.48690456123504, lng: 30.521461232723393 };
var mapOptions = {
  center: myLatLng,
  zoom: 14,
  mapTypeId: google.maps.MapTypeId.ROADMAP,
};

//create map
var map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);

//create a DirectionsService object to use the route method and get a result for our request
var directionsService = new google.maps.DirectionsService();

//create a DirectionsRenderer object which we will use to display the route
var directionsDisplay = new google.maps.DirectionsRenderer({
  preserveViewport: true,
  suppressMarkers: false,
  map: map,
});

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
    drivingOptions: {
      departureTime: new Date(/* now, or future date */),
      trafficModel: "pessimistic",
    },
    region: "UA",
  };
  //pass the request to the route method
  directionsService.route(request, function (result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
        
(async () => {
    const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${document.getElementById("to").value}&format=json&limit=1&addressdetails=4`
  );

  const { display_name, lat, lon, address} = (await response.json())[0];
 
  district = address.borough;
});
      //Get distance and time
      
      const Tarif = Math.round(
        300 + (Math.round(result.routes[0].legs[0].distance.value) / 1000) * 18
      );
      const distance = Math.round(
        result.routes[0].legs[0].distance.value / 1000
      );
      const distance2 =
        Math.round(result.routes[0].legs[0].distance.value / 1000) + 5;
      const Tarif2 = Math.round(distance2 * 40 + 720);
      const Tarif3 = Math.round(distance2 * 60 + 1200);
      output.innerHTML =
        "<div><b>Адрес доставки : </b>" + district  + document.getElementById("to").value + ". <br /> Растояние <i class='fas fa-road'></i> : " +
        distance +
        " км. <br />Растояние 3,5-12т <i class='fas fa-road'></i> : " +
        distance2 +
        " км. <br />Время пути <i class='fas fa-hourglass-start'></i> : " +
        result.routes[0].legs[0].duration.text +
        "<br /> <br /><b>Тариф до 1,5т <i class='fas fa-dollar-sign'></i> :</b> " +
        new Intl.NumberFormat("ru-RU").format(Tarif) +
        " грн. <b>Экспресс <i class='fas fa-dollar-sign'></i> :</b> " +
        new Intl.NumberFormat("ru-RU").format(Tarif + 150) +
        " грн.<br /> <b>Тариф до 3,5т <i class='fas fa-dollar-sign'></i> :</b> " +
        new Intl.NumberFormat("ru-RU").format(Tarif2) +
        " грн. <b>Экспресс <i class='fas fa-dollar-sign'></i> :</b> " +
        new Intl.NumberFormat("ru-RU").format(Tarif2 + 150) +
        " грн.<br /> <b>Тариф до 12т с манипулятором <i class='fas fa-dollar-sign'></i> :</b> " +
        new Intl.NumberFormat("ru-RU").format(Tarif3) +
        " грн. <b>Экспресс <i class='fas fa-dollar-sign'></i> :</b> " +
        new Intl.NumberFormat("ru-RU").format(Tarif3 + 150) +
        " грн.</div>";
      //display route
      directionsDisplay.setDirections(result);
      map.fitBounds(directionsDisplay.getDirections().routes[0].bounds);
    } else {
      //delete route from map
      directionsDisplay.setDirections({ routes: [] });
      //center map
      //map.setCenter(myLatLng);

      //show error message
      output.innerHTML =
        "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Не удалось получить расстояние за рулем.</div>";
    }
  });
}

//create autocomplete objects for all inputs
var options = {
  types: ["geocode"],
  componentRestrictions: {
    country: "ua",
  },
};
var fromInput = document.getElementById("from");
var toInput = document.getElementById("to");
function pacSelectFirst(input) {
  // store the original event binding function
  var _addEventListener = input.addEventListener
    ? input.addEventListener
    : input.attachEvent;

  function addEventListenerWrapper(type, listener) {
    // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected,
    // and then trigger the original listener.
    if (type == "keydown") {
      var orig_listener = listener;
      listener = function (event) {
        var suggestion_selected = $(".pac-item-selected").length > 0;
        if (event.which == 13 && !suggestion_selected) {
          var simulated_downarrow = $.Event("keydown", {
            keyCode: 40,
            which: 40,
          });
          orig_listener.apply(input, [simulated_downarrow]);
          calcRoute();
        }

        orig_listener.apply(input, [event]);
        
      };
    }

    _addEventListener.apply(input, [type, listener]);
  }

  input.addEventListener = addEventListenerWrapper;
  input.attachEvent = addEventListenerWrapper;

  var autocomplete = new google.maps.places.Autocomplete(input, options);
}
pacSelectFirst(fromInput);
pacSelectFirst(toInput);

const voiceTriggerOrigin = document.querySelector(".voiceSearchButtonOrigin");
const searchFormOrigin = document.querySelector(".origin");
const searchInputOrigin = document.querySelector(".inputOrigin");

const voiceTriggerDestination = document.querySelector(
  ".voiceSearchButtonDestination"
);
const searchFormDestination = document.querySelector(".destination");
const searchInputDestination = document.querySelector(".inputDestination");


function speechRecognitionForInput(voiceTrigger, searchInput) {

window.SpeechRecognition = window.webkitSpeechRecognition;

if (window.SpeechRecognition) {
    let speechRecognition = new SpeechRecognition();
    
    let speechRecognitionActive ;

    speechRecognition.onstart = () => {
      searchInput.placeholder = "Говорите...";
      searchInput.value = "";
      voiceTrigger.classList.add("voiceSearchButtonAnimate");
      speechRecognitionActive=true;
    };
    speechRecognition.onerror = () => {
      searchInput.placeholder = "Error...";
      speechRecognitionActive = false;
      voiceTrigger.classList.remove("voiceSearchButtonAnimate");
      console.log("Speech Recognition Error");
    };
    speechRecognition.onend = () => {
      searchInput.placeholder = "Адрес доставки";
      speechRecognitionActive = false;
      voiceTrigger.classList.remove("voiceSearchButtonAnimate");
      console.log("Speech Recognition Ended");
    };

    speechRecognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const final_transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
        let mobileRepeatBug = (i == 1 && final_transcript == event.results[0][0].transcript);
        if(!mobileRepeatBug) {
          searchInput.value = final_transcript;
          searchInput.focus();
           }
        }
      }
    };

    voiceTrigger.onclick = () => {
      if (speechRecognitionActive) {
        
        speechRecognition.stop();
   
      } else {
        speechRecognition.start();
      }
    };
  } else {
    alert("Speech Recognition Not Available ");
  }
}
speechRecognitionForInput(voiceTriggerOrigin, searchInputOrigin);
speechRecognitionForInput(voiceTriggerDestination, searchInputDestination);

