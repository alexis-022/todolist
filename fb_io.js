let stationArray = [];
onLoad();


async function onLoad() {
  if (sessionStorage.getItem('uid') !== null && sessionStorage.getItem('uid') !== "null" && sessionStorage.getItem('uid') !== "") {
    fb_authenticate();
  }
  let selectedStopID = document.getElementById('stationSelect').value;

  if (selectedStopID == null || selectedStopID == "null" || selectedStopID == "") {
    selectedStopID = "WELL";
  }

  await formOptions();
  await metlinkAPIGet(selectedStopID.replace(/\d$/, '')); // Remove the last digit from the stop ID
}


/*******************************************************/
// fb_authenticate()
// Authenticates user with Google 
// Stores user info in sessionStorage, DB
/*******************************************************/
function fb_authenticate() {
  let user;
  firebase.auth().onAuthStateChanged(async (user) => {
    user = firebase.auth().currentUser;
    if (user) {
      //Already logged in
      if (user !== null) {
        //UID (from Google)
        let uid = user.uid;
        sessionStorage.setItem('uid', uid);
        //User Display Name (from Google)
        let userDisplayName = user.displayName;
        sessionStorage.setItem('userDisplayName', userDisplayName);
        firebase.database().ref('/userInfo/' + uid + '/displayName').set(userDisplayName);
        //User Email (from Google)
        let userEmail = user.email;
        sessionStorage.setItem('userEmail', userEmail);
        firebase.database().ref('/userInfo/' + uid + '/email').set(userEmail);
        //User Profile Photo URL (from Google)
        let userPhotoURL = user.photoURL;
        sessionStorage.setItem('userPhotoURL', userPhotoURL);
        firebase.database().ref('/userInfo/' + uid + '/photoURL').set(userPhotoURL);

        console.log("User Logged In")
        console.log(uid + "\n" + userDisplayName + "\n" + userEmail + "\n" + userPhotoURL)
        let loginButton = document.getElementById("loginButton");
        loginButton.style.display = "none"
        let profilePhoto = document.getElementById("profilePhoto");
        profilePhoto.innerHTML =
          `<img src="${userPhotoURL}" alt="User profile photo" width="60px" height="60px" style="border-radius:50%">
          <div id="profileInfo"></div>`
      }
    } else {
      //Not logged in, runs Google pop up
      console.log("User Not Logged In")
      let provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      firebase.auth().signInWithPopup(provider).then(function (result) {
        let token = result.credential.accessToken;
      });
    }
  });
}

/*******************************************************/
// getProfileInfo()
// Displays user profile info when profile photo is clicked
/*******************************************************/
function getProfileInfo() {
  let profileInfo = document.getElementById("profileInfo")
  if (profileInfo.style.display !== "block") {
    profileInfo.style.display = "block";
    profileInfo.innerHTML = `
    <img src="${sessionStorage.getItem('userPhotoURL')}" alt="User profile photo" 
    width="50px" height="50px" style="border-radius:50%; display: flex; justify-content: left; align-items: center; position: absolute;">
    ${sessionStorage.getItem('userDisplayName')}<br>
    ${sessionStorage.getItem('userEmail')}`
  } else {
    profileInfo.style.display = "none";
  }
}

/*******************************************************/
// fb_writeForm()
// Writes form data to DB
/*******************************************************/
function fb_writeForm() {
  let firstName = document.getElementById("fname").value;
  let lastName = document.getElementById("lname").value;
  if (firstName === "" || lastName === "") {
    alert("Please fill in all fields");
  } else {
    firebase.database().ref('/userInfo/' + sessionStorage.getItem('uid') + '/firstName').set(firstName);
    firebase.database().ref('/userInfo/' + sessionStorage.getItem('uid') + '/lastName').set(lastName);
  }
}

function metlinkAPIGet(_stopID) {
  const url = `https://api.opendata.metlink.org.nz/v1/stop-predictions?stop_id=${(_stopID)}`;
  const apiKey = 'dItDXPZfr0aeK9f8McupL3E4JiwkC8M3d1fj1ZZc';

  fetch(url, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'Accept': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // You can process the bus/train arrival times here

      let stop = stationArray.find(item => item.stop_id.replace(/\d$/, '') === _stopID);

      //document.getElementById("departureHeader").innerHTML = `Departures at <br> ${stop?.stop_name}`;

      let nextDeparture = data.departures[0];
      let nextDeparture2 = data.departures[1];
      let nextDeparture3 = data.departures[2];
      let departure1 = document.getElementById("singleDeparture")
      let departure2 = document.getElementById("singleDeparture2")
      let departure3 = document.getElementById("singleDeparture3")
      // Add a class name to the parent container itself
      departure1.classList.add('transit-card');
      departure2.classList.add('transit-card');
      departure3.classList.add('transit-card');

      departure1.innerHTML = `
      <h4 class="top-right">${nextDeparture.trip_headsign} | ${nextDeparture.destination.name.substring(nextDeparture.destination.name.indexOf('-') + 1)}</h4>
      <p class="top-left lineIcon" data-alert="${nextDeparture.service_id}" >${nextDeparture.service_id}</p>
      <p class="bottom-left">${nextDeparture.departure.expected === null ?
          convertTo12Hour(nextDeparture.departure.aimed) :
          convertTo12Hour(nextDeparture.departure.expected)}</p>
      ${nextDeparture.wheelchair_accessible ? '<img src="https://www.metlink.org.nz/assets/Icons/Mobility-park.svg" alt="Mobility Park" width="30px" height="30px" id="wheelchair"/>' : ''}
      <p class="bottom-right">${nextDeparture.stop_id.replace(/\D/g, '') === '' ? '' : 'Platform ' + nextDeparture.stop_id.replace(/\D/g, '')}</p>
      `;

      departure2.innerHTML = `
      <h4 class="top-right">${nextDeparture2.trip_headsign} | ${nextDeparture2.destination.name.substring(nextDeparture2.destination.name.indexOf('-') + 1)}</h4>
      <p class="top-left lineIcon" data-alert="${nextDeparture2.service_id}" >${nextDeparture2.service_id}</p>
      <p class="bottom-left">${nextDeparture2.departure.expected === null ?
          convertTo12Hour(nextDeparture2.departure.aimed) :
          convertTo12Hour(nextDeparture2.departure.expected)}</p>
      ${nextDeparture2.wheelchair_accessible ? '<img src="https://www.metlink.org.nz/assets/Icons/Mobility-park.svg" alt="Mobility Park" width="30px" height="30px" id="wheelchair"/>' : ''}
      <p class="bottom-right">${nextDeparture2.stop_id.replace(/\D/g, '') === '' ? '' : 'Platform ' + nextDeparture2.stop_id.replace(/\D/g, '')}</p>
      `;

      departure3.innerHTML = `
      <h4 class="top-right">${nextDeparture3.trip_headsign} | ${nextDeparture3.destination.name.substring(nextDeparture3.destination.name.indexOf('-') + 1)}</h4>
      <p class="top-left lineIcon" data-alert="${nextDeparture3.service_id}" >${nextDeparture3.service_id}</p>
      <p class="bottom-left">${nextDeparture3.departure.expected === null ?
          convertTo12Hour(nextDeparture3.departure.aimed) :
          convertTo12Hour(nextDeparture3.departure.expected)}</p>
      ${nextDeparture3.wheelchair_accessible ? '<img src="https://www.metlink.org.nz/assets/Icons/Mobility-park.svg" alt="Mobility Park" width="30px" height="30px" id="wheelchair"/>' : ''}
      <p class="bottom-right">${nextDeparture3.stop_id.replace(/\D/g, '') === '' ? '' : 'Platform ' + nextDeparture3.stop_id.replace(/\D/g, '')}</p>
      `;
      /* Uncomment the following lines to log the next departure details to the console
      console.log('Next Departure:');
      console.log(`Delay: ${convertDuration(nextDeparture.delay)}`);
      console.log(`Aimed Time: ${convertTo12Hour(nextDeparture.departure.aimed)}`);
      console.log(`Expected Time: ${convertTo12Hour(nextDeparture.departure.expected)}`);
      console.log(`Destination Name: ${nextDeparture.destination.name}`);
      console.log(`Destination ID: ${nextDeparture.destination.stop_id}`);
      console.log(`Direction: ${nextDeparture.direction}`);
      console.log(`Monitored: ${nextDeparture.monitored}`);
      console.log(`Name: ${nextDeparture.name}`);
      console.log(`Operator: ${nextDeparture.operator}`);
      console.log(`Origin Stop ID: ${nextDeparture.origin.stop_id}`);
      console.log(`Origin Name: ${nextDeparture.origin.name}`);
      console.log(`Service ID: ${nextDeparture.service_id}`);
      console.log(`Status: ${nextDeparture.status}`);
      console.log(`Stop ID: ${nextDeparture.stop_id}`);
      console.log(`Trip Headsign: ${nextDeparture.trip_headsign}`);
      console.log(`Trip ID: ${nextDeparture.trip_id}`);
      console.log(`Vehicle ID: ${nextDeparture.vehicle_id}`);
      console.log(`Wheelchair Accessible: ${nextDeparture.wheelchair_accessible}`);
      */
    })
    .catch(error => {
      console.error('Error fetching Metlink data:', error);
    });
}

// This function runs every 10 seconds (10000 milliseconds)
const updateInterval = setInterval(function () {
  console.log("Updating data...");
  selectedStopID = document.getElementById('stationSelect').value;
  if (selectedStopID == null || selectedStopID == "null" || selectedStopID == "") {
    selectedStopID = "WELL";
  }
  metlinkAPIGet(selectedStopID.replace(/\d$/, '')); // Remove the last digit from the stop ID
}, 10000);

// To stop the loop later, use clearInterval:
// clearInterval(updateInterval);










function convertTo12Hour(timeString) {
  if (!timeString) return null;

  const now = new Date();
  const date = new Date(timeString);

  // Calculate exact difference in minutes, then round using standard rules
  const diffMs = date - now;
  const diffMinutes = Math.round(diffMs / 1000 / 60);

  // Check the relative time window (0 to 9 minutes)
  if (diffMinutes >= 0 && diffMinutes < 10) {
    if (diffMinutes < 1) {
      return 'Due';
    }

    // Fallback manual formatting ensures perfect pluralization and capitalization
    const unit = diffMinutes === 1 ? 'Minute' : 'Minutes';
    return `${diffMinutes} ${unit}`;
  }

  // Otherwise, fallback to standard 12-hour format
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}



function convertDuration(isoDuration) {
  const regex = /P(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
  const matches = isoDuration.match(regex) || [];

  const hours = parseInt(matches[1] || 0, 10);
  const minutes = parseInt(matches[2] || 0, 10);
  const seconds = parseInt(matches[3] || 0, 10);

  // Convert hours into minutes
  const totalMinutes = (hours * 60) + minutes;

  const parts = [];

  // Build the minutes part
  if (totalMinutes > 0) {
    const minText = totalMinutes === 1 ? "1 minute" : `${totalMinutes} minutes`;
    parts.push(minText);
  }

  // Build the seconds part
  if (seconds > 0) {
    const secText = seconds === 1 ? "1 second" : `${seconds} seconds`;
    parts.push(secText);
  }

  // Join parts with a comma, or return "0 seconds" if completely empty
  return parts.length > 0 ? parts.join(", ") : "0 seconds";
}





async function formOptions() {
  document.getElementById("stationSelect").innerHTML = ``;

  const url = 'https://api.opendata.metlink.org.nz/v1/gtfs/routes?stop_id=WELL';
  const apiKey = 'dItDXPZfr0aeK9f8McupL3E4JiwkC8M3d1fj1ZZc';

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    console.log('Metlink Routes Data:', data);

    const fetchPromises = data.map(async (route) => {
      let route_id = route.route_id;
      const url2 = `https://api.opendata.metlink.org.nz/v1/gtfs/stops?route_id=${route_id}`;

      try {
        const stopResponse = await fetch(url2, {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
            'Accept': 'application/json'
          }
        });
        if (!stopResponse.ok) throw new Error(`HTTP error! Status: ${stopResponse.status}`);
        const stopData = await stopResponse.json();

        for (let j = 0; j < stopData.length; j++) {
          stationArray.push({ stop_id: stopData[j].stop_id, stop_name: stopData[j].stop_name });
        }
      } catch (error) {
        console.error('Error fetching stop data:', error);
      }
    });

    await Promise.all(fetchPromises);

    let optionsHTML = "";

    // 1. Remove duplicates based ONLY on the 'stop_name' property
    const seenNames = new Set();
    stationArray = stationArray.filter(station => {
      if (seenNames.has(station.stop_name)) {
        return false; // Skip this duplicate
      }
      seenNames.add(station.stop_name);
      return true; // Keep this unique station
    });

    // 2. Sort alphabetically by stop_name
    stationArray.sort((a, b) => a.stop_name.localeCompare(b.stop_name));

    for (let k = 0; k < stationArray.length; k++) {
      optionsHTML += "<option value='" + stationArray[k].stop_id + "'>" + stationArray[k].stop_name + "</option>";
    }
    document.getElementById("stationSelect").innerHTML = optionsHTML;
    document.getElementById("originSelect").innerHTML = optionsHTML;
    document.getElementById("destinationSelect").innerHTML = optionsHTML;

  } catch (error) {
    console.error('Error fetching Metlink data:', error);
  }
  console.log('Station Array:', stationArray);
  // Event listener for a change in the dropdown
  document.getElementById('stationSelect').addEventListener('change', (_value) => {
    selectedStopID = document.getElementById('stationSelect').value;
    if (selectedStopID == null || selectedStopID == "null" || selectedStopID == "") {
      selectedStopID = "WELL";
    }
    console.log('Selected Stop ID:', selectedStopID);
    metlinkAPIGet(selectedStopID.replace(/\d$/, '')); // Remove the last digit from the stop ID
  });
}


/**************************/
// journeyPlanner()
/**************************/
async function journeyPlanner() {
  let originStopID = (document.getElementById("originSelect").value).replace(/\d$/, '');
  let destinationStopID = (document.getElementById("destinationSelect").value).replace(/\d$/, '');
  let destinationStopName = document.getElementById("destinationSelect").options[document.getElementById("destinationSelect").selectedIndex].text;
  
  console.log(`Origin Stop ID: ${originStopID}, Destination Stop ID: ${destinationStopID}`);
  
  let originRoutes = [];
  let destinationRoutes = [];
  let validTrips = [];

  const originRouteurl = `https://api.opendata.metlink.org.nz/v1/gtfs/routes?stop_id=${originStopID}`;
  const destinationRouteurl = `https://api.opendata.metlink.org.nz/v1/gtfs/routes?stop_id=${destinationStopID}`;
  const originStopPredictionsUrl = `https://api.opendata.metlink.org.nz/v1/stop-predictions?stop_id=${originStopID}`;

  const apiKey = 'dItDXPZfr0aeK9f8McupL3E4JiwkC8M3d1fj1ZZc';

  await fetch(originRouteurl, {
    method: 'GET',
    headers: { 'x-api-key': apiKey, 'Accept': 'application/json' }
  })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => { originRoutes = data.map(route => route.route_short_name); })
    .catch(error => console.error('Error fetching Metlink data:', error));

  await fetch(destinationRouteurl, {
    method: 'GET',
    headers: { 'x-api-key': apiKey, 'Accept': 'application/json' }
  })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => { destinationRoutes = data.map(route => route.route_short_name); })
    .catch(error => console.error('Error fetching Metlink data:', error));

  let commonRoutes = originRoutes.filter(route => destinationRoutes.includes(route));

  await fetch(originStopPredictionsUrl, {
    method: 'GET',
    headers: { 'x-api-key': apiKey, 'Accept': 'application/json' }
  })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(async data => {
      const departures = data.departures || [];
      
      // Filter departures down to only routes heading the right way
      let relevantDepartures = departures.filter(departure => 
        commonRoutes.includes(departure.service_id) && 
        (departure.direction === 'outbound' || departure.direction === 'inbound')
      );

      // Loop through all upcoming predictions instead of just the first one
      for (const departure of relevantDepartures) {
        let stopsUrl = `https://api.opendata.metlink.org.nz/v1/gtfs/stops?trip_id=${departure.trip_id}`;

        await fetch(stopsUrl, {
          method: 'GET',
          headers: { 'x-api-key': apiKey, 'Accept': 'application/json' }
        })
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
          })
          .then(stopsData => {
            let originPos = stopsData.findIndex(item => item.stop_id.replace(/\d+$/, '') === originStopID.replace(/\d+$/, ''));
            let destPos = stopsData.findIndex(item => item.stop_id.replace(/\d+$/, '') === destinationStopID.replace(/\d+$/, ''));

            // Check if train travels from origin to destination and stops at both
            if (originPos > -1 && destPos > -1 && (destPos - originPos > 0)) {
              let stopCount = destPos - originPos;
              let departureTime = departure.departure.aimed || departure.departure.expected;
              
              validTrips.push({
                tripData: departure,
                time: departureTime,
                stops: stopCount
              });
            }
          })
          .catch(error => console.error('Error fetching stops data:', error));
      }
    })
    .catch(error => console.error('Error fetching Metlink data:', error));

  // Sort trips chronologically so the soonest trips are first
  validTrips.sort((a, b) => (a.time < b.time ? -1 : 1));

  // Clear previous displays
  let res1 = document.getElementById("journeyResult");
  let info1 = document.getElementById("journeyInfo");
  let res2 = document.getElementById("journeyResult2");
  let info2 = document.getElementById("journeyInfo2");

  res1.style.display = "none";
  info1.style.display = "none";
  if (res2) res2.style.display = "none";
  if (info2) info2.style.display = "none";

  if (validTrips.length === 0) {
    res1.innerHTML = `<p>No stopping services found for this selection.</p>`;
    res1.style.display = "block";
    return;
  }

  // Render First Journey Choice
  let trip1 = validTrips[0].tripData;
  res1.classList.add('transit-card');
  res1.style.display = "block";
  info1.style.display = "block";
  res1.innerHTML = `
    <h4 class="top-right">${trip1.trip_headsign} | ${trip1.destination.name.substring(trip1.destination.name.indexOf('-') + 1)}</h4>
    <p class="top-left lineIcon" data-alert="${trip1.service_id}" >${trip1.service_id}</p>
    <p class="bottom-left">${trip1.departure.expected === null ? convertTo12Hour(trip1.departure.aimed) : convertTo12Hour(trip1.departure.expected)}</p>
    ${trip1.wheelchair_accessible ? '<img src="https://www.metlink.org.nz/assets/Icons/Mobility-park.svg" alt="Mobility Park" width="30px" height="30px" id="wheelchair"/>' : ''}
    <p class="bottom-right">${trip1.stop_id.replace(/\D/g, '') === '' ? '' : 'Platform ' + trip1.stop_id.replace(/\D/g, '')}</p>
  `;
  info1.innerHTML = `Ride ${validTrips[0].stops} ${validTrips[0].stops !== 1 ? 'stops' : 'stop'} to ${destinationStopName}`;

  // Render Second Journey Choice (if it exists)
  if (validTrips.length > 1 && res2 && info2) {
    let trip2 = validTrips[1].tripData;
    res2.classList.add('transit-card');
    res2.style.display = "block";
    info2.style.display = "block";
    res2.innerHTML = `
      <h4 class="top-right">${trip2.trip_headsign} | ${trip2.destination.name.substring(trip2.destination.name.indexOf('-') + 1)}</h4>
      <p class="top-left lineIcon" data-alert="${trip2.service_id}" >${trip2.service_id}</p>
      <p class="bottom-left">${trip2.departure.expected === null ? convertTo12Hour(trip2.departure.aimed) : convertTo12Hour(trip2.departure.expected)}</p>
      ${trip2.wheelchair_accessible ? '<img src="https://www.metlink.org.nz/assets/Icons/Mobility-park.svg" alt="Mobility Park" width="30px" height="30px" id="wheelchair"/>' : ''}
      <p class="bottom-right">${trip2.stop_id.replace(/\D/g, '') === '' ? '' : 'Platform ' + trip2.stop_id.replace(/\D/g, '')}</p>
    `;
    info2.innerHTML = `Ride ${validTrips[1].stops} ${validTrips[1].stops !== 1 ? 'stops' : 'stop'} to ${destinationStopName}`;
  }
}





/**************************
 * 
 * Types of displays:
 * In Vehicle Display 
 * Platform Display 
 * Station Display
 * Single Trip Display 
 * Line Display
 * Live travel like what you actually want to know
 * *****************************/