const directionsService = new google.maps.DirectionsService();
let map;
var labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var labelIndex = 0;
var marker;
var infowindow;
let findDistrictQuery;
const originInputRefs = document.getElementById("from");
const destinationInputRefs = document.getElementById("to");
const voiceTriggerOrigin = document.querySelector(".voiceSearchButtonOrigin");
const searchFormOrigin = document.querySelector(".origin");
const searchInputOrigin = document.querySelector(".inputOrigin");

const voiceTriggerDestination = document.querySelector(
  ".voiceSearchButtonDestination"
);
const searchFormDestination = document.querySelector(".destination");
const searchInputDestination = document.querySelector(".inputDestination");

function initialize() {
  //set map options
  const myLatLng = { lat: 50.48690456123504, lng: 30.521461232723393 };
  const mapOptions = {
    center: myLatLng,
    zoom: 16,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  };

  //create map
  map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);
  
 var infowindow = new google.maps.InfoWindow({
   maxWidth: 30
 });
  
  let start = originInputRefs.value;
  let end = destinationInputRefs.value;
  // This event listener calls addMarker() when the map is clicked.
  google.maps.event.addListener(map, "dblclick", function (event) {
    addMarker(event.latLng, map);
    end = event.latLng.toString().replace(/[()]/g, "");
    destinationInputRefs.value = end;
    destinationInputRefs.focus();
  });
  

  onfocusSelectElement(".searchTextField");
  speechRecognitionForInput(voiceTriggerOrigin, searchInputOrigin);
  speechRecognitionForInput(voiceTriggerDestination, searchInputDestination);
  google.maps.event.addDomListener(window, "load", autocompleteInput);
  pacSelectFirst(originInputRefs);
  pacSelectFirst(destinationInputRefs);
  if (end && start) {
    plotDirections(start, end);
  } else {
    output.innerHTML =
      "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Необходимо указать адрес доставки!!!</div>";
  }
}
function addMarker(location, map) {
  // Add the marker at the clicked location, and add the next-available label
  // from the array of alphabetical characters.
  marker && marker.setMap(null);
  marker = new google.maps.Marker({
    map,
    draggable: true,
    animation: google.maps.Animation.DROP,
    position: location,
    label: labels[labelIndex++ % labels.length],
  });
  marker.addListener("dblclick", toggleBounce);
}
function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}
function autocompleteInput() {
  const options = {
    fields: ["place_id,formatted_address,geometry,name"],
    types: ["geocode"],
    componentRestrictions: {
      country: "ua",
    },
  };

  const inputItems = document.querySelectorAll(".searchTextField");
  inputItems.forEach(function (userItem) {
    const autocomplete = new google.maps.places.Autocomplete(userItem, options);
    autocomplete.bindTo("bounds", map);
    autocomplete.addListener("place_changed", function () {
     var place = autocomplete.getPlace();
      const checkInputTo = userItem;
      console.log("userItem :", userItem);
      userItem = place.formatted_address;
      const latNew = place.geometry.location.lat();
      console.log("latNew :", latNew);
      const lngNew = place.geometry.location.lng();
      console.log("lngNew :", lngNew);
      console.log(`🚀  ~ checkInputTo.id`, checkInputTo.id);
      if (checkInputTo.id === "to") {
        findDistrictQuery = `${latNew},  ${lngNew}`;
      }

      console.log("userItem :", userItem);
      console.log(`🚀  ~ findDistrictQuery`, findDistrictQuery);

      
    });
  });
}
function onfocusSelectElement(tagName) {
  const entryField = document.querySelectorAll(tagName);
  console.log(
    `🚀  ~ AutocompleteDirectionsHandler ~ onfocusSelectElement ~ entryField`,
    entryField
  );
  entryField.forEach(function (element) {
    element.addEventListener("focus", () => {
      element.select();
    });
    console.log("input : ", element);
  });
}
function fn(arr, num) {
  return arr.map(function (a) {
    return a % num ? a + num - (a % num) : a;
  });
}
function pacSelectFirst(input) {
  // store the original event binding function
  const _addEventListener = input.addEventListener
    ? input.addEventListener
    : input.attachEvent;
  function addEventListenerWrapper(type, listener) {
    // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected,
    // and then trigger the original listener.
    if (type == "keydown") {
      const orig_listener = listener;
      listener = function (event) {
        console.log(document.querySelectorAll(".pac-item-selected"));
        const suggestion_selected =
          document.querySelectorAll(".pac-item-selected").length > 0;
        if (
          (event.which == 13 && !suggestion_selected) ||
          (event.which == 9 && !suggestion_selected)
        ) {
          const simulated_downarrow = input.dispatchEvent(
            new KeyboardEvent("keydown", {
              keyCode: 40, // example values.
              which: 40,
            })
          );
          orig_listener.apply(input, [simulated_downarrow]);
          initialize();
        }
        orig_listener.apply(input, [event]);
      };
    }
    _addEventListener.apply(input, [type, listener]);
  }
  input.addEventListener = addEventListenerWrapper;
  input.attachEvent = addEventListenerWrapper;
}
function plotDirections(start, end) {
  const method = "DRIVING";

  const request = {
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

  directionsService.route(request, function (response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      const routes = response.routes;
      console.log("routes", routes);
      const colors = ["red", "green", "blue", "orange", "yellow", "black"];
      const directionsDisplays = [];
      
      // Reset the start and end variables to the actual coordinates
      start = response.routes[0].legs[0].start_location;
      end = response.routes[0].legs[0].end_location;

      findDistrictQuery = end.toString().replace(/[()]/g, "");
      console.log(`🚀  ~ findDistrictQuery`, findDistrictQuery);
      // Loop through each route
      for (let i = 0; i < routes.length; i++) {
        var directionsDisplay = new google.maps.DirectionsRenderer({
          map: map,
          directions: response,
          routeIndex: i,
          draggable: true,
          polylineOptions: {
            strokeColor: colors[i],
          },
        });
       
        originInputRefs.value = response.routes[0].legs[0].start_address;
        destinationInputRefs.value = response.routes[0].legs[0].end_address;
        let maxDistance = response.routes[0].legs[0].distance.value;
        console.log(`🚀  ~ maxDistance`, maxDistance);
        let iterationDistance = response.routes[i].legs[0].distance.value;
        console.log(`🚀  ~ iterationDistance`, iterationDistance);
        if (iterationDistance > maxDistance) {
          maxDistance = iterationDistance;
          console.log(`🚀  ~ maxDistanceFinal`, maxDistance);
        }
        let maxDuration = response.routes[0].legs[0].duration_in_traffic.text;

        let iterationDuration =
          response.routes[i].legs[0].duration_in_traffic.text;

        if (iterationDuration > maxDuration) {
          maxDuration = iterationDuration;
        }
        
         /*********** INFOWINDOW *****************/
        var steps = response.routes[i].legs[0].steps;
        console.log("steps :", steps)
        var stepPath = [];
        for (j = 0; j < steps.length; j++) {
          var nextSegment = steps[j].path;
          for (k = 0; k < nextSegment.length; k++) {
            stepPath.push(nextSegment[k]);
          }
        }
        var center = stepPath[Math.floor(stepPath.length / 2)];
        var stepIW = new google.maps.InfoWindow();
        stepIW.setPosition(center);
        stepIW.setContent(response.routes[i].legs[0].duration_in_traffic.text + "<br>" + response.routes[i].legs[0].distance.text);
        stepIW.open(directionsDisplay.map);

        // Push the current renderer to an array
        directionsDisplays.push(directionsDisplay);

        // Listen for the directions_changed event for each route
        google.maps.event.addListener(
          directionsDisplay,
          "directions_changed",
          (function (directionsDisplay, i) {
            return function () {
              var directions = directionsDisplay.getDirections();
              var new_start = directions.routes[0].legs[0].start_location;
              console.log("new_start", new_start);
              var new_end = directions.routes[0].legs[0].end_location;
              console.log("new_end", new_end);
              originInputRefs.value =
                directions.routes[0].legs[0].start_address;

              destinationInputRefs.value =
                directions.routes[0].legs[0].end_address;

              // Remove every route from map
              for (var j = 0; j < directionsDisplays.length; j++) {
                directionsDisplays[j].setMap(null);
              }
              //show error message

              // Redraw routes with new start/end coordinates
              plotDirections(new_start, new_end);
            };
          })(directionsDisplay, i)
        ); // End listener
        const distance = Math.round(
          response.routes[0].legs[0].distance.value / 1000
        );
        let Tarif = Math.round(300 + distance * 18);
        Tarif = fn([Tarif], 10);
        let expressTarif = Math.round(150 + 300 + distance * 18);
        expressTarif = fn([expressTarif], 10);

        const distance2 = Math.round(maxDistance / 1000);
        let Tarif2 = Math.round(distance2 * 40 + 720);
        let Tarif3 = Math.round(distance2 * 60 + 1200);
        async function findDistrict() {
          console.log(findDistrictQuery);

          const query = findDistrictQuery;

          console.log(query);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&addressdetails=4&countrycodes=UA`
          );

          const { display_name, lat, lon, address } = (
            await response.json()
          )[0];
          console.log(address);
          var arr = [
            "district",
            "borough",
            "shop",
            "amenity",
            "building",
            "neighbourhood",
            "quarter",
            "suburb",
            "allotments",
            "postcode",
            "residential",
            "village",
          ];
          hash = {};

          arr.forEach(function (itemArray) {
            Object.keys(address).some(function (itemObject) {
              if (itemArray == itemObject) {
                hash[itemArray] = address[itemObject];
              }
            });
          });
          console.log("!!!!! HASH!!!!", hash);
          const district = Object.values(hash).join(", ") + ", ";
          return district;
        }
        findDistrict()
          .then((district) => {
            // got value district
            console.log(district);

            output.innerHTML =
              "<div><b>Адрес доставки : </b>" +
              district +
              "<b>" +
              document.getElementById("to").value +
              "</b>" +
              ". <br /> <b>Растояние <i class='fas fa-road'></i> : </b>" +
              distance +
              " км. <b>Время пути <i class='fas fa-hourglass-start'></i> : </b>" +
              response.routes[0].legs[0].duration.text +
              " <br /> <b>Растояние 3, 5 - 12т <i class='fas fa-road' ></i> :</b> " +
              distance2 +
              " км. <b>Время пути <i class='fas fa-hourglass-start'></i> : </b>" +
              maxDuration +
              "<br /><br /> <b>Тариф до 1,5т <i class='fas fa-dollar-sign'></i> :</b> " +
              new Intl.NumberFormat("ru-RU").format(Tarif) +
              " грн. <b>Экспресс <i class='fas fa-dollar-sign'></i> :</b> " +
              new Intl.NumberFormat("ru-RU").format(expressTarif) +
              " грн.<br /> <b>Тариф до 3,5т <i class='fas fa-dollar-sign'></i> :</b> " +
              new Intl.NumberFormat("ru-RU").format(Tarif2) +
              " грн. <b>Экспресс <i class='fas fa-dollar-sign'></i> :</b> " +
              new Intl.NumberFormat("ru-RU").format(Tarif2 + 150) +
              " грн.<br /> <b>Тариф до 12т с манипулятором <i class='fas fa-dollar-sign'></i> :</b> " +
              new Intl.NumberFormat("ru-RU").format(Tarif3) +
              " грн. <b>Экспресс <i class='fas fa-dollar-sign'></i> :</b> " +
              new Intl.NumberFormat("ru-RU").format(Tarif3 + 150) +
              " грн.</div>";
          })
          .catch((e) => {
            // error
            output.innerHTML =
              "<div><b>Адрес доставки : </b>" +
              document.getElementById("to").value +
              ". <br /> Растояние <i class='fas fa-road'></i> : " +
              distance +
              " км. <br />Растояние 3,5-12т <i class='fas fa-road'></i> : " +
              distance2 +
              " км. <br />Время пути <i class='fas fa-hourglass-start'></i> : " +
              response.routes[0].legs[0].duration.text +
              "<br /> <br /><b>Тариф до 1,5т <i class='fas fa-dollar-sign'></i> :</b> " +
              new Intl.NumberFormat("ru-RU").format(Tarif) +
              " грн. <b>Экспресс <i class='fas fa-dollar-sign'></i> :</b> " +
              new Intl.NumberFormat("ru-RU").format(expressTarif) +
              " грн.<br /> <b>Тариф до 3,5т <i class='fas fa-dollar-sign'></i> :</b> " +
              new Intl.NumberFormat("ru-RU").format(Tarif2) +
              " грн. <b>Экспресс <i class='fas fa-dollar-sign'></i> :</b> " +
              new Intl.NumberFormat("ru-RU").format(Tarif2 + 150) +
              " грн.<br /> <b>Тариф до 12т с манипулятором <i class='fas fa-dollar-sign'></i> :</b> " +
              new Intl.NumberFormat("ru-RU").format(Tarif3) +
              " грн. <b>Экспресс <i class='fas fa-dollar-sign'></i> :</b> " +
              new Intl.NumberFormat("ru-RU").format(Tarif3 + 150) +
              " грн.</div>";
          });
      } // End route loop
    } else {
      //delete route from map
      directionsDisplays = [];
      //center map
      //map.setCenter(myLatLng);

      //show error message
      output.innerHTML =
        "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Необходимо указать адрес доставки!!!</div>";
    }
  });
}

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

    speechRecognition.onresponse = (event) => {
      for (let i = event.responseIndex; i < event.responses.length; ++i) {
        const final_transcript = event.responses[i][0].transcript;
        if (event.responses[i].isFinal) {
          let mobileRepeatBug =
            i == 1 && final_transcript == event.responses[0][0].transcript;
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
