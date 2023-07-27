const INTERNAL_ACTIVITY_OPP_ID = "0066Q000029PZeeQAG"

let list = document.getElementById("events")
let createActivitiesButton = document.getElementById("createActivities")

// global variables
let gcalActivities = {
  events: [],
  oppsMap: {},
  config: {},
  email: "",
  date: "",
  oppsViewId: ""
}

// set default value of opps view id and config
chrome.storage.local.get(["oppsViewId", "config"]).then((result) => {
  console.log('loaded...', result);
  gcalActivities.oppsViewId = result.oppsViewId;
  gcalActivities.config = result.config ? result.config : defaultConfig;
  document.getElementById("oppsViewIdInput").value = result.oppsViewId
});

// get opps view ID
document.getElementById("oppsViewIdInput").addEventListener("change", e => {
  gcalActivities.oppsViewId = e.target.value
  chrome.storage.local.set({ oppsViewId: e.target.value }).then(() => {
    console.log("Value is set", { oppsViewId: e.target.value });
  });
})

// default date picker to today
document.getElementById('activityDatePicker').valueAsDate = new Date();

// Get List of Calendar Events
document.getElementById('getCalendarEvents').addEventListener("click", () => {
  getScratchpadAuthToken((token) => {
    getAllOpps(token, () => {
      chrome.identity.getProfileUserInfo({accountStatus: "ANY"}, userInfo => {
        gcalActivities.email = userInfo.email
        chrome.identity.getAuthToken({ interactive: true }, fetchEvents)
      })
    })
  })
})

// add spinner on file upload
document.getElementById('configFileLabel').addEventListener('click', () => {
  document.getElementById('configFileInput').value = null;
  document.getElementById('configFileLabel').innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`
})

// accept config file upload and save it
document.getElementById('configFileInput').addEventListener('change', uploadEvent => {
  const fileReader = new FileReader()
  fileReader.onload = (event) => {
    const config = JSON.parse(event.target.result)
    chrome.storage.local.set({ config: config }).then(() => {
      console.log("Value is set", { config: config });
      document.getElementById('configFileLabel').innerHTML = "📁"
    });
  }
  fileReader.readAsText(uploadEvent.target.files[0])
});

// Create Activities in Scratchpad
createActivitiesButton.addEventListener("click", () => {
  createActivitiesButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
  createActivitiesButton.disabled = true
  getScratchpadAuthToken((token) => {
    createActivities(token)
  })
})

// Fetch list of Google Calendar Events
const fetchEvents = (token) => {

  gcalActivities.date = document.getElementById('activityDatePicker').value
  const url = `https://www.googleapis.com/calendar/v3/calendars/${gcalActivities.email}/events?singleEvents=True&timeMin=${gcalActivities.date}T00:00:00-05:00&timeMax=${gcalActivities.date}T23:59:59-05:00`;

  // clear previous events
  list.innerHTML = ""
  createActivitiesButton.style.display = "none"

  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((response) => response.json())
  .then((data) => {

    // filter only for relevant events
    gcalActivities.events = data.items
      .filter(event => event.status === "confirmed") // only include confirmed events
      .filter(event => event.summary) // ensure event has a summary
      .filter(event => !event.summary.includes("Canceled")) // filter our cancelled events
      .filter(event => event.start.dateTime && event.end.dateTime) // filter out all day events that don't have dateTimes
      .filter(event => event.organizer.self || (event.attendees && event.attendees.find(a => a.self && a.responseStatus === "accepted"))) // only events where you organize or have accepted

    // sort by start time
    gcalActivities.events.sort((e1, e2) =>  e1.start.dateTime.split("T")[1].localeCompare(e2.start.dateTime.split("T")[1]))

    // display events in popup
    gcalActivities.events.forEach(event => {
      displayEvent(list, event)
    });

    // make create activities button visible
    createActivitiesButton.style.display = "block"
  })
  .catch((error) => {
    log(error)
  });
}

// get scratchpad token from cookies
const getScratchpadAuthToken = (callback) => {
  chrome.cookies.get(
    {
      name: "auth",
      url: "https://app.scratchpad.com/"
    }, 
    cookie => {
      let authToken = cookie.value.split("+")[1]
      callback(authToken)
    }
  )
}

// get opportunities from scratchpad all opps view for autolinking
const getAllOpps = async (token, callback) => {

  let xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.open("GET", `https://api.scratchpad.com/api/salesforce/query_by_view/${gcalActivities.oppsViewId}`);
  xhr.setRequestHeader("Authorization", `Bearer ${token}`);
  xhr.onload = () => {
    const res = JSON.parse(xhr.response)
  
    res.records?.forEach(record => {
      gcalActivities.oppsMap[record.Account.Website_Domain__c] = record
    })
  };

  xhr.send();

  callback()
}

// asynchronously create activities from GCal events
const createActivities = async (token) => {

  const promises = []

  gcalActivities.events
    .filter(event => document.getElementById(`${event.id}-check`)?.checked)
    .forEach(async event => {
      const promise = createActivity(event, token)
      promises.push(promise)
    })

  // wait for all events to complete
  Promise.all(promises).then((values) => {
    createActivitiesButton.innerHTML = "Create Activities"
    createActivitiesButton.disabled = false
  }).catch(err => {
    log(err)
  })
}

// Creates an Activity in Scratchpad if checkbox is checked
const createActivity = async (event, token) => {
  return new Promise((resolve, reject) => {
    const type = inferActivityType(event)

    // get salesforce record based on customer email domain
    const customerDomain = getCustomerDomain(event)  
    const record = type.type === "Internal" ? { Id: INTERNAL_ACTIVITY_OPP_ID, Name: "Internal" } : gcalActivities.oppsMap[customerDomain]

    // construct request body
    var data = constructRequestBody(gcalActivities.date, type, event, record)
    
    // create xhr request
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.open("POST", "https://api.scratchpad.com/api/salesforce/create/Task");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {

      const label = document.getElementById(`${event.id}-label`)
      if (xhr.status === 200) {
        
        label.innerHTML = `✅ ${event.summary}` 
        resolve("done")
      } else {

        // creating more than 4ish events at a time for a single record can fail due to too many
        //   update attempts for the same record at once. Here we perform a single retry to account 
        //   for this. It's dirty, I know.
        let xhrRetry = new XMLHttpRequest();
        xhrRetry.withCredentials = true;

        xhrRetry.open("POST", "https://api.scratchpad.com/api/salesforce/create/Task");
        xhrRetry.setRequestHeader("Authorization", `Bearer ${token}`);
        xhrRetry.setRequestHeader("Content-Type", "application/json");
        xhrRetry.onload = () => {

          const label = document.getElementById(`${event.id}-label`)
          if (xhrRetry.status === 200) {
            label.innerHTML = `✅ ${event.summary}` 
            resolve("done")
          } else {
            label.innerHTML = `❌ ${event.summary}` 
            resolve("failed")
          }
        }

        // If first attempt fails, update with construction emoji
        label.innerHTML = `🚧 ${event.summary}` 

        xhrRetry.send(data);
      }
    }

    xhr.send(data);
  })
}
