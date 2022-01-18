var directionsService = new google.maps.DirectionsService();
var map;
let findDistrictQuery;
var fromInput = document.getElementById("from");
var toInput = document.getElementById("to");

//Select on click
const output = document.querySelector("#output");
$("body").on("focus", ".searchTextField", function () {
  $(this).select();
  output.innerHTML = "";
});

function initialize() {

 //set map options
var myLatLng = { lat: 50.48690456123504, lng: 30.521461232723393 };
var mapOptions = {
  center: myLatLng,
  zoom: 15,
  mapTypeId: google.maps.MapTypeId.ROADMAP,
};

//create map
map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);

  var start = document.getElementById("from").value;
  var end = document.getElementById("to").value;
speechRecognitionForInput(voiceTriggerOrigin, searchInputOrigin);
speechRecognitionForInput(voiceTriggerDestination, searchInputDestination);	
  google.maps.event.addDomListener(window, "load", autocompleteInput);
  pacSelectFirst(fromInput);
  pacSelectFirst(toInput);	
  plotDirections(start, end);
}
function autocompleteInput() {
  var options = {
  fields: ["place_id,formatted_address,geometry,name"],
  types: ["geocode"],
  componentRestrictions: {
    country: "ua",
  },
};

  var inputItems = document.querySelectorAll(".searchTextField");
  inputItems.forEach(function (userItem) {
    var autocomplete = new google.maps.places.Autocomplete(userItem, options);
    autocomplete.bindTo("bounds", map);
    autocomplete.addListener("place_changed", function () {
      var place = autocomplete.getPlace();
      const checkInputTo =userItem;
        console.log("userItem :", userItem);
      userItem = place.formatted_address;
      const latNew = place.geometry.location.lat();
      console.log("latNew :", latNew);
      const lngNew = place.geometry.location.lng();
      console.log("lngNew :", lngNew);
      console.log(`🚀  ~ checkInputTo.id`, checkInputTo.id);
      if (checkInputTo.id === "to"){
      findDistrictQuery = `${latNew},  ${lngNew}`;
      }
      
      console.log("userItem :", userItem);
      console.log(`🚀  ~ findDistrictQuery`, findDistrictQuery);

      //plotDirections(start, end)
    });
  });
}
function pacSelectFirst(input) {
  // store the original event binding function
  var _addEventListener = input.addEventListener
    ? input.addEventListener
    : input.attachEvent;

  function addEventListenerWrapper(type, listener) {
    // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected,
    // and then trigger the original listener.
    if (type == "keydown" || type === "click") {
      console.log("START");
      var orig_listener = listener;
      listener = function (event) {
        var suggestion_selected = $(".pac-item-selected").length > 0;
        if (event.which == 13 && !suggestion_selected) {
          var simulated_downarrow = $.Event("keydown", {
            keyCode: 40,
            which: 40,
          });
          orig_listener.apply(input, [simulated_downarrow]);
          console.log("autocomplete : 1 ");
          console.log("input after Enter press : ", input);
          
        }
        console.log("autocomplete : 2 ");
        orig_listener.apply(input, [event]);
      };
      console.log("autocomplete : 3 ");
    }
    console.log("autocomplete : 4 ");
    _addEventListener.apply(input, [type, listener]);
  }
  console.log("autocomplete : 5 ");
  input.addEventListener = addEventListenerWrapper;
  input.attachEvent = addEventListenerWrapper;
}
function plotDirections(start, end) {

  var method = 'DRIVING';
  
  var request = {
    origin: start,
    destination: end,
    travelMode: google.maps.DirectionsTravelMode[method],
    provideRouteAlternatives: true,
     drivingOptions: {
      departureTime: new Date(/* now, or future date */),
      trafficModel: "pessimistic",
    },
    region: "UA",
  };

  directionsService.route(request, function(response, status) {

    if (status == google.maps.DirectionsStatus.OK) {

      var routes = response.routes;
      var colors = ['red', 'green', 'blue', 'orange', 'yellow', 'black'];
      var directionsDisplays = [];

      // Reset the start and end variables to the actual coordinates
      start = response.routes[0].legs[0].start_location;
      end = response.routes[0].legs[0].end_location;

			// Loop through each route
      for (var i = 0; i < routes.length; i++) {

        var directionsDisplay = new google.maps.DirectionsRenderer({
          map: map,
          directions: response,
          routeIndex: i,
          draggable: true,
          polylineOptions: {

            strokeColor: colors[i],
          }
        });

        // Push the current renderer to an array
        directionsDisplays.push(directionsDisplay);

        // Listen for the directions_changed event for each route
        google.maps.event.addListener(directionsDisplay, 'directions_changed', (function(directionsDisplay, i) {

          return function() {

            var directions = directionsDisplay.getDirections();
            var new_start = directions.routes[0].legs[0].start_location;
            var new_end = directions.routes[0].legs[0].end_location;
	    fromInput=new_start;  
            toInput=new_end;
            if ((new_start.toString() !== start.toString()) || (new_end.toString() !== end.toString())) {

              // Remove every route from map
              for (var j = 0; j < directionsDisplays.length; j++) {

                directionsDisplays[j].setMap(null);
              }

              // Redraw routes with new start/end coordinates
              plotDirections(new_start, new_end);
            }
          }
        })(directionsDisplay, i)); // End listener
      } // End route loop
    }
  });
}
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

    let speechRecognitionActive;

    speechRecognition.onstart = () => {
      searchInput.placeholder = "Говорите...";
      searchInput.value = "";
      voiceTrigger.classList.add("voiceSearchButtonAnimate");
      speechRecognitionActive = true;
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
          let mobileRepeatBug =
            i == 1 && final_transcript == event.results[0][0].transcript;
          if (!mobileRepeatBug) {
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

initialize();
