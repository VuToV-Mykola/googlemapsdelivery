//javascript.js
$("body").on('focus', '.searchTextField', function() { 
  $(this).select();
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
    drivingOptions: {
      departureTime: new Date(/* now, or future date */),
      trafficModel: "pessimistic",
    },
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
      const distance = Math.round(
        result.routes[0].legs[0].distance.value / 1000
      );
      const distance2 =
        Math.round(result.routes[0].legs[0].distance.value / 1000) + 5;
      const Tarif2 = Math.round(distance2 * 40 + 720);
      const Tarif3 = Math.round(distance2 * 60 + 1200);
      output.innerHTML =
        "<div>Растояние <i class='fas fa-road'></i> : " +
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
    } else {
      //delete route from map
      directionsDisplay.setDirections({ routes: [] });
      //center map
      map.setCenter(myLatLng);

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

    var pac_input = document.getElementById('to');

    (function pacSelectFirst(input) {
        // store the original event binding function
        var _addEventListener = (input.addEventListener) ? input.addEventListener : input.attachEvent;

        function addEventListenerWrapper(type, listener) {
            // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected,
            // and then trigger the original listener.
            if (type == "keydown") {
                var orig_listener = listener;
                listener = function(event) {
                    var suggestion_selected = $(".pac-item-selected").length > 0;
                    if (event.which == 13 && !suggestion_selected) {
                        var simulated_downarrow = $.Event("keydown", {
                            keyCode: 40,
                            which: 40
                        });
                        orig_listener.apply(input, [simulated_downarrow]);
                    }

                    orig_listener.apply(input, [event]);
                };
            }

            _addEventListener.apply(input, [type, listener]);
        }

        input.addEventListener = addEventListenerWrapper;
        input.attachEvent = addEventListenerWrapper;

        var autocomplete = new google.maps.places.Autocomplete(input,options);

    })(pac_input);

//Voice SearchOrigin
/* setup vars for our trigger, form, text input and result elements */
var $voiceTriggerOrigin = $(".voiceSearchButtonOrigin");
var $searchFormOrigin = $(".origin");
var $searchInputOrigin = $(".inputOrigin");
var $resultOrigin = $("#result");

/*  set Web Speech API for Chrome or Firefox */
window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

/* Check if browser support Web Speech API, remove the voice trigger if not supported */
if (window.SpeechRecognition) {
  /* setup Speech Recognition */

  var recognitionOrigin = new SpeechRecognition();
  recognitionOrigin.interimResults = false;
  recognitionOrigin.lang = "uk-UA";
  recognitionOrigin.addEventListener("result", _transcriptHandlerOrigin);

  recognitionOrigin.onerror = function (event) {
    console.log(event.error);

    /* Revert input and icon CSS if no speech is detected */
    if (event.error) {
     
      $searchInputOrigin.attr("placeholder", "Поиск...");
    }
  };
} 

jQuery(document).ready(function () {
  /* Trigger listen event when our trigger is clicked */
  $voiceTriggerOrigin.on("click touch", listenStartOrigin);
});

/* Our listen event */
function listenStartOrigin(e) {
  e.preventDefault();
  /* Update input and icon CSS to show that the browser is listening */
  $searchInputOrigin.attr("value", "");
  $searchInputOrigin.attr("placeholder", "Говорите...");
  $voiceTriggerOrigin.addClass("active");
  /* Start voice recognition */
  recognitionOrigin.start();
}

/* Parse voice input */
function _parseTranscriptOrigin(e) {
  return Array.from(e.results)
    .map(function (result) {
      return result[0];
    })
    .map(function (result) {
      return result.transcript;
    })
    .join("");
}

/* Convert our voice input into text and submit the form */
function _transcriptHandlerOrigin(e) {
  var speechOutputOrigin = _parseTranscriptOrigin(e);
  $searchInputOrigin.val(speechOutputOrigin);
   recognitionOrigin.onspeechend = function() {
  recognitionOrigin.stop();
}
  //$result.html(speechOutput);
  if (e.results[0].isFinal) {
    $searchFormOrigin.submit();
  }
}
//Voice SearchDestination
/* setup vars for our trigger, form, text input and result elements */
var $voiceTriggerDestination = $(".voiceSearchButtonDestination");
var $searchFormDestination = $(".destination");
var $searchInputDestination = $(".inputDestination");
var $resultDestination = $("#result");

/*  set Web Speech API for Chrome or Firefox */
window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

/* Check if browser support Web Speech API, remove the voice trigger if not supported */
if (window.SpeechRecognition) {
  /* setup Speech Recognition */
 
  var recognitionDestination = new SpeechRecognition();
  recognitionDestination.interimResults = false;
  recognitionDestination.lang = "uk-UA";
  recognitionDestination.addEventListener(
    "result",
    _transcriptHandlerDestination
  );

  recognitionDestination.onerror = function (event) {
    console.log(event.error);

    /* Revert input and icon CSS if no speech is detected */
    if (event.error) {
     
      $searchInputDestination.attr("placeholder", "Поиск...");
    }
  };
}


jQuery(document).ready(function () {
  /* Trigger listen event when our trigger is clicked */
  $voiceTriggerDestination.on("click touch", listenStartDestination);
});

/* Our listen event */
function listenStartDestination(e) {
  e.preventDefault();
  /* Update input and icon CSS to show that the browser is listening */
  $searchInputDestination.attr("value", "");
  $searchInputDestination.attr("placeholder", "Говорите...");
  $voiceTriggerDestination.addClass("active");
  /* Start voice recognition */
  recognitionDestination.start();
}

/* Parse voice input */
function _parseTranscriptDestination(e) {
  return Array.from(e.results)
    .map(function (result) {
      return result[0];
    })
    .map(function (result) {
      return result.transcript;
    })
    .join("");
}

/* Convert our voice input into text and submit the form */
function _transcriptHandlerDestination(e) {
  var speechOutputDestination = _parseTranscriptDestination(e);
  $searchInputDestination.val(speechOutputDestination);
  recognitionDestination.onspeechend = function() {
  recognitionDestination.stop();
}
  //$result.html(speechOutput);
 if (e.results[0].isFinal) {
    $searchFormDestination.submit();
 }
}

