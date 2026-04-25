'use strict'

const output = document.querySelector('#output')
const mapElement = document.querySelector('#deliveryMap')
const pageQrImage = document.querySelector('#pageQrCode')
const pageQrLink = document.querySelector('#pageQrLink')
let directionsService
let map
let bounds
const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
let labelIndex = 0
let marker
const infoWindow = null
let findDistrictQuery
let distance
let distance2
let duration
let maxDuration
let maxDistance
let expressTarif
let Tarif
let Tarif2
let Tarif3
let final_transcript
let speechRecognitionActive
const colors = ['darkorange', 'green', 'dodgerblue', 'orchid', 'darkkhaki']

const searchInfoWindows = document.querySelector('.gm-style-iw')
const directionRenderers = []
const allInfos = []

const originInputRefs = document.getElementById('from')
const destinationInputRefs = document.getElementById('to')

const voiceTriggerOrigin = document.querySelector('.voice-search-button-origin')
const searchInputOrigin = document.querySelector('.input-origin')

const voiceTriggerDestination = document.querySelector('.voice-search-button-destination')
const searchInputDestination = document.querySelector('.input-destination')

const myLatLng = {lat: 50.48690456123504, lng: 30.521461232723393}
const mapOptions = {
  center: myLatLng,

  zoom: 11,
  mapTypeId: 'roadmap'
}

let start = {lat: 50.4851216, lng: 30.5278983}
let end
function getGoogleMapsApiKey() {
  return window.APP_CONFIG && window.APP_CONFIG.GOOGLE_MAPS_API_KEY
}

function loadGoogleMapsApi() {
  const apiKey = getGoogleMapsApiKey()

  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is not configured'))
  }

  if (window.google && window.google.maps) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places&v=weekly`
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = () => reject(new Error('Google Maps API loading failed'))
    document.head.appendChild(script)
  })
}

function renderPageQrCode() {
  if (!pageQrImage || !pageQrLink) {
    return
  }

  const pageUrl = window.location.href
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=12&data=${encodeURIComponent(
    pageUrl
  )}`

  pageQrImage.src = qrUrl
  pageQrLink.href = pageUrl
}

function initialize() {
  if (!mapElement) {
    return
  }

  directionsService = new google.maps.DirectionsService()
  bounds = new google.maps.LatLngBounds()
  map = new google.maps.Map(mapElement, mapOptions)
  autocompleteInput()
  renderPageQrCode()

  google.maps.event.addListener(map, 'dblclick', function (event) {
    addMarker(event.latLng, map)
    end = event.latLng.toString().replace(/[()]/g, '')
    destinationInputRefs.value = end
    destinationInputRefs.focus()
  })
  onfocusSelectElement('.search-text-field')
  speechRecognitionForInput(voiceTriggerOrigin, searchInputOrigin)
  speechRecognitionForInput(voiceTriggerDestination, searchInputDestination)

  pacSelectFirst(originInputRefs)
  pacSelectFirst(destinationInputRefs)

  if (end && start) {
    removeDirectionRenderers()
    output.hidden = true

    plotDirections(start, end)
  } else {
    output.hidden = false
    output.innerHTML =
      "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Необхідно вказати адресу призначення.</div>"
  }
}
function addMarker(location, map) {
  marker && marker.setMap(null)
  marker = new google.maps.Marker({
    map,
    draggable: true,
    animation: google.maps.Animation.DROP,
    position: location,
    label: labels[labelIndex++ % labels.length]
  })
  marker.addListener('dblclick', toggleBounce)
}
function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null)
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE)
  }
}
function autocompleteInput() {
  const options = {
    fields: ['place_id', 'formatted_address', 'geometry', 'name'],
    types: ['address']
  }

  const inputItems = document.querySelectorAll('.search-text-field')
  inputItems.forEach(function (userItem) {
    let autocomplete = new google.maps.places.Autocomplete(userItem, options)
    autocomplete.bindTo('bounds', map)

    autocomplete.addListener('place_changed', function () {
      const place = autocomplete.getPlace()
      if (place.formatted_address) {
        userItem = place.formatted_address
        findDistrictQuery = place.geometry.location.toString().replace(/[()]/g, '')

        start = originInputRefs.value
        end = destinationInputRefs.value
      } else {
        start = originInputRefs.value
        end = destinationInputRefs.value

        findDistrictQuery = end.toString().replace(/[()]/g, '')
      }
      plotDirections(start, end)
    })
  })
}
function onfocusSelectElement(tagName) {
  const entryField = document.querySelectorAll(tagName)
  entryField.forEach(function (element) {
    element.addEventListener('click', () => {
      if (!element.value) {
        output.hidden = true
      }
      element.select()

      element.focus()
    })
  })
}
function fn(arr, num) {
  return arr.map(function (a) {
    return a % num ? a + num - (a % num) : a
  })
}

function pacSelectFirst(input) {
  const _addEventListener = input.addEventListener ? input.addEventListener : input.attachEvent

  function addEventListenerWrapper(type, listener) {
    if (type === 'keydown') {
      const orig_listener = listener
      listener = event => {
        const suggestion_selected = document.getElementsByClassName('pac-item-selected').length > 0

        if (
          (event.keyCode === 13 && !suggestion_selected) ||
          (event.keyCode === 9 && !suggestion_selected)
        ) {
          const simulated_downarrow = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            keyCode: 40
          })

          orig_listener.apply(input, [simulated_downarrow])
        }

        orig_listener.apply(input, [event])
      }
    }

    _addEventListener.apply(input, [type, listener])
  }

  if (input.addEventListener) input.addEventListener = addEventListenerWrapper
  else if (input.attachEvent) input.attachEvent = addEventListenerWrapper
}
function plotDirections(start, end) {
  const method = 'DRIVING'

  const request = {
    origin: start,
    destination: end,
    travelMode: google.maps.DirectionsTravelMode[method],
    waypoints: [],
    avoidTolls: true,
    provideRouteAlternatives: true,
    drivingOptions: {
      departureTime: new Date(),
      trafficModel: 'pessimistic'
    }
  }

  directionsService.route(request, function (response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      closeAllInfoWindows(allInfos)
      start = response.routes[0].legs[0].start_location

      end = response.routes[0].legs[0].end_location

      findDistrictQuery = end.toString().replace(/[()]/g, '')
      removeDirectionRenderers()

      for (let i = 0; i < response.routes.length; i++) {
        const directionRenderer = new google.maps.DirectionsRenderer({
          map: map,
          directions: response,
          routeIndex: i,
          draggable: true,
          preserveViewport: false,

          polylineOptions: {
            strokeColor: colors[i],
            strokeOpacity: 0.5,
            strokeWeight: 6
          }
        })
        directionRenderers.push(directionRenderer)
        google.maps.event.addListener(
          directionRenderer,
          'directions_changed',
          (function (directionRenderer, i) {
            return function () {
              const directions = directionRenderer.getDirections()
              bounds = directionRenderer.map.getBounds()

              const newStart = directions.routes[0].legs[0].start_location
              const newEnd = directions.routes[0].legs[0].end_location

              const index = i
              const indexRoute = 0
              originInputRefs.value = directions.routes[0].legs[0].start_address

              destinationInputRefs.value = directions.routes[0].legs[0].end_address
              findDistrictQuery = newEnd.toString().replace(/[()]/g, '')
              allInfos[i].close()

              if (
                newStart.toString() !== start.toString() ||
                newEnd.toString() !== end.toString()
              ) {
                closeAllInfoWindows(allInfos)
                removeDirectionRenderers()
                plotDirections(newStart, newEnd)
              } else {
                computeTotal(directions, index, indexRoute)
                findDistrictA()
              }
            }
          })(directionRenderer, i)
        )

        computeTotal(response, i, i)
      }

      findDistrictA()
    } else {
      removeDirectionRenderers()
      closeAllInfoWindows(allInfos)
      output.hidden = false
      output.innerHTML =
        "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Необхідно вказати адресу призначення.</div>"
    }
  })
}
function findDistrictA() {
  async function findDistrict() {
    const query = findDistrictQuery
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&addressdetails=4`
    )

    const {address} = (await response.json())[0]
    const district = address.borough
    const arr = [
      'district',
      'borough',
      'shop',
      'amenity',
      'building',
      'neighbourhood',
      'quarter',
      'suburb',
      'allotments',
      'postcode',
      'residential',
      'village'
    ]
    const hash = {}

    arr.forEach(function (itemArray) {
      Object.keys(address).some(function (itemObject) {
        if (itemArray == itemObject) {
          hash[itemArray] = address[itemObject]
        }
      })
    })
    const districtDetails = Object.values(hash).join(', ') + ', '
    return {district, districtDetails}
  }
  findDistrict()
    .then(districtDetailsNew => {
      const {district, districtDetails} = districtDetailsNew

      if (district === 'Подільський район' || district === 'Шевченківський район') {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: true
        })

        swalWithBootstrapButtons
          .fire({
            title: `Увага!<br><b style="color:red;">${district}</b>`,
            html:
              `<b>Для клієнта діє акційна доставка в районі </b><b style="color:red;">` +
              district +
              `</b><b> без розвантаження товару з автомобіля. Якщо сума товару в одному документі більша за 5 000 грн, вага менша ніж 1,5 т, доставка не експрес і внесено 2 артикули А0101377 на 600 грн, натисніть "ТАК".</b>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ТАК!',
            cancelButtonText: 'НІ!',
            confirmButtonColor: '#00ff55',
            cancelButtonColor: '#999999',
            reverseButtons: true,
            showClass: {
              popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
            }
          })
          .then(result => {
            if (result.isConfirmed) {
              Tarif = 0
              swalWithBootstrapButtons.fire(
                'Акційна безкоштовна доставка',
                'Вартість становить 0 грн.',
                'success'
              )
              showOutput(districtDetails)
              scrollToEnd('hidden', 1000)
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              swalWithBootstrapButtons.fire(
                'Відмінено',
                'Артикул безкоштовної доставки не внесено.',
                'error'
              )
              scrollToEnd('hidden', 1000)
            }
          })
      }
      showOutput(districtDetails)
    })
    .catch(() => {
      showOutput('')
    })
}
function computeTotal(result, index, indexRoute) {
  originInputRefs.value = result.routes[0].legs[0].start_address
  destinationInputRefs.value = result.routes[0].legs[0].end_address

  maxDistance = result.routes[0].legs[0].distance.value
  const iterationDistance = result.routes[indexRoute].legs[0].distance.value
  if (iterationDistance > maxDistance) {
    maxDistance = iterationDistance
  }

  maxDuration = result.routes[0].legs[0].duration_in_traffic.text

  const iterationDuration = result.routes[indexRoute].legs[0].duration_in_traffic.text

  if (iterationDuration > maxDuration) {
    maxDuration = iterationDuration
  }

  const steps = result.routes[indexRoute].legs[0].steps
  const stepPath = []
  for (let j = 0; j < steps.length; j++) {
    const nextSegment = steps[j].path
    for (let k = 0; k < nextSegment.length; k++) {
      stepPath.push(nextSegment[k])
    }
  }
  const positionInfoWindow =
    stepPath[
      Math.floor(
        result.routes.length === 1
          ? stepPath.length / 2
          : index * (stepPath.length / 3.8) + stepPath.length / 3.8
      )
    ]

  const stepIW = new google.maps.InfoWindow()

  stepIW.setPosition(positionInfoWindow)
  stepIW.setContent(
    `<div style="border-radius: 25% 10%;color:red; background:` +
      colors[index] +
      `;opacity: 0.7;"><img src="./Images/directions_car_grey800_24dp.png" alt="авто"><b style="color:black;">` +
      result.routes[indexRoute].legs[0].duration_in_traffic.text +
      `</b><br/><b>` +
      result.routes[indexRoute].legs[0].distance.text +
      `</b></div>`
  )
  allInfos[index] = stepIW
  stepIW.open(map)
  distance = Math.round((result.routes[0].legs[0].distance.value / 1000) * 10) / 10
  duration = result.routes[0].legs[0].duration_in_traffic.text
  Tarif = Math.round(300 + distance * 18)
  Tarif = fn([Tarif], 10)
  expressTarif = Math.round(150 + 300 + distance * 18)
  expressTarif = fn([expressTarif], 10)

  distance2 = Math.round((maxDistance / 1000) * 10) / 10
  Tarif2 = Math.round(distance2 * 40 + 720)
  Tarif3 = Math.round(distance2 * 60 + 1200)
}

function speechRecognitionForInput(voiceTrigger, searchInput) {
  if (!voiceTrigger || !searchInput) {
    return
  }

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition

  if (!SpeechRecognition) {
    voiceTrigger.hidden = true
    return
  }

  const recognition = new SpeechRecognition()

  let isRecognizing = false
  let ignoreEndProcess = false
  let finalTranscript = ''

  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'uk-UA'

  recognition.onstart = function () {
    searchInput.value = ''
    finalTranscript = ''
    searchInput.placeholder = 'Назвіть адресу...'
    voiceTrigger.classList.add('voice-search-button-animate')
    isRecognizing = true
  }

  recognition.onend = function () {
    isRecognizing = false
    voiceTrigger.classList.remove('voice-search-button-animate')
    searchInput.placeholder = 'Адреса доставки'
    readOutLoud(searchInput.value)
    if (ignoreEndProcess) {
      return false
    }
    if (!finalTranscript) {
      recognition.onend = null
      recognition.stop()
      return
    }
  }

  recognition.onresult = function (event) {
    searchInput.placeholder = 'Йде розпізнавання голосу...'
    let interimTranscript = ''
    if (typeof event.results === 'undefined') {
      recognition.onend = null
      recognition.stop()
      return
    }

    if (finalTranscript == undefined) {
      finalTranscript = ''
    }

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      let transcript = editInterim(event.results[i][0].transcript)

      if (event.results[i].isFinal || event.results[i][0]['final']) {
        if (transcript) {
          finalTranscript += transcript
        }

        searchInput.placeholder = 'Адреса доставки'
        voiceTrigger.classList.remove('voice-search-button-animate')
        searchInput.value = editFinal(finalTranscript)
        searchInput.focus()
        finalTranscript = ''
        recognition.stop()
      } else {
        interimTranscript += transcript
        searchInput.value = interimTranscript
      }
    }
  }

  recognition.onerror = function (event) {
    if (event.error.match(/no-speech|audio-capture|not-allowed/)) {
      ignoreEndProcess = true
    }
  }

  voiceTrigger.onclick = () => {
    if (isRecognizing) {
      isRecognizing = false
      recognition.stop()
      recognition.onend = null
      voiceTrigger.classList.remove('voice-search-button-animate')
    } else {
      recognition.start()
    }
  }
}
function editInterim(s) {
  const DICTIONARY = {
    крапка: '.',
    кома: ',',
    питання: '?',
    оклик: '!',
    двокрапка: ':',
    тире: '-',
    абзац: '\n',
    відступ: '\t'
  }
  return s
    .split(' ')
    .map(word => {
      word = word.trim()
      return DICTIONARY[word] ? DICTIONARY[word] : word
    })
    .join(' ')
}
function editFinal(s) {
  return s.replace(/\s([\.+,?!:-])/g, '$1')
}
function readOutLoud(message) {
  const speech = new SpeechSynthesisUtterance()

  speech.text = `Пошук ${message}`
  speech.volume = 1
  speech.rate = 1
  speech.pitch = 1

  window.speechSynthesis.speak(speech)
}
function removeDirectionRenderers() {
  directionRenderers.forEach(directionRenderer => {
    directionRenderer.setMap(null)
  })
  directionRenderers.length = 0
}

function closeAllInfoWindows(allInfosconst) {
  for (let i = 0; i < allInfosconst.length; i++) {
    marker && marker.setMap(null)
    bounds = new google.maps.LatLngBounds()
    allInfosconst[i].close()
  }
}
function showOutput(districtDetailsconst) {
  output.hidden = false
  output.innerHTML =
    '<div><b>Адреса доставки: </b>' +
    districtDetailsconst +
    '<b>' +
    destinationInputRefs.value +
    '</b>' +
    ". <br /> <b>Відстань <i class='fas fa-road'></i>: </b>" +
    distance +
    " км. <b>Час у дорозі <i class='fas fa-hourglass-start'></i>: </b>" +
    duration +
    " <br /> <b>Відстань 3,5-12 т <i class='fas fa-road' ></i>:</b> " +
    distance2 +
    " км. <b>Час у дорозі <i class='fas fa-hourglass-start'></i>: </b>" +
    maxDuration +
    "<br /> <br /><b>Тариф до 1,5 т <i class='fas fa-dollar-sign'></i>:</b> " +
    new Intl.NumberFormat('ru-RU').format(Tarif) +
    " грн. <b>Експрес <i class='fas fa-dollar-sign'></i>:</b> " +
    new Intl.NumberFormat('ru-RU').format(expressTarif) +
    " грн.<br /> <b>Тариф до 3,5 т <i class='fas fa-dollar-sign'></i>:</b> " +
    new Intl.NumberFormat('ru-RU').format(Tarif2) +
    " грн. <b>Експрес <i class='fas fa-dollar-sign'></i>:</b> " +
    new Intl.NumberFormat('ru-RU').format(Tarif2 + 150) +
    " грн.<br /> <b>Тариф до 12 т з маніпулятором <i class='fas fa-dollar-sign'></i>:</b> " +
    new Intl.NumberFormat('ru-RU').format(Tarif3) +
    " грн. <b>Експрес <i class='fas fa-dollar-sign'></i>:</b> " +
    new Intl.NumberFormat('ru-RU').format(Tarif3 + 150) +
    ' грн.</div>'
}
function scrollToEnd(id, timeout) {
  const hiddenElement = document.getElementById(id)
  setTimeout(() => {
    hiddenElement.scrollIntoView({
      block: 'end',
      behavior: 'smooth'
    })
  }, timeout)
}
function scrollToTop(id, timeout) {
  const hiddenElement = document.getElementById(id)
  setTimeout(() => {
    hiddenElement.scrollIntoView({
      block: 'start',
      inline: 'nearest',
      behavior: 'smooth'
    })
  }, timeout)
}
function showStartupError() {
  output.hidden = false
  output.innerHTML =
    "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Не налаштовано ключ Google Maps API.</div>"
}

loadGoogleMapsApi().then(initialize).catch(showStartupError)
