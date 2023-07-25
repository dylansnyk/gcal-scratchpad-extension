const RECORD_TYPE_ID = "0124P000000OLWCQA4"
const INTERNAL_ACTIVITY_OPP_ID = "0066Q000029PZeeQAG"

let list = document.getElementById("events")
let createActivitiesButton = document.getElementById("createActivities")

// global variables
let gcalActivities = {
  events: [],
  oppsMap: {},
  email: "",
  date: "",
  oppsViewId: ""
}

// set default value of opps view id
chrome.storage.local.get(["oppsViewId"]).then((result) => {
  console.log(result.oppsViewId)
  gcalActivities.oppsViewId = result.oppsViewId
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
      displayEvent(event)
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
  
    res.records.forEach(record => {
      gcalActivities.oppsMap[record.Account.Website_Domain__c] = record
    })
  };

  xhr.send();

  callback()
}

// iteratively create activities from GCal events
const createActivities = async (token) => {

  const promises = []

  gcalActivities.events
    .filter(event => document.getElementById(`${event.id}-check`)?.checked)
    .forEach(async event => {
      const promise = createActivity(event, token)
      promises.push(promise)
    })

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
    var data = JSON.stringify({
      "attrs": {
        "ActivityDate": gcalActivities.date,
        "Subject": event.summary,
        "Activity_Type__c": type.type,
        "Activity_Subtype__c": type.subType,
        "OwnerId": record?.Sales_Engineer__c,
        "RecordTypeId": RECORD_TYPE_ID,
        "WhatId": record?.Id,
        "Status": "Completed"
      },
      "fields": [
          "Id",
          "RecordType.Id",
          "RecordType.Name",
          "Subject",
          "Description",
          "Priority",
          "ActivityDate",
          "Status",
          "SystemModstamp",
          "WhoId",
          "Who.Id",
          "Who.Name",
          "Who.Type",
          "WhatId",
          "What.Id",
          "What.Name",
          "What.Type",
          "OwnerId",
          "Owner.Id",
          "Owner.Name",
          "Owner.Type",
          "IsRecurrence",
          "IsHighPriority",
          "RecurrenceActivityId",
          "Activity_Type__c",
          "Activity_Subtype__c"
      ]
    });
    
    // execute request
    var promise = new Promise(() => {});
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.open("POST", "https://api.scratchpad.com/api/salesforce/create/Task");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      // log(`${xhr.status} - ${event.summary}`)
      if (xhr.status === 200) {
        const label = document.getElementById(`${event.id}-label`)
        label.innerHTML = `✅ ${event.summary}` 
        resolve("done")
      } else {
        reject("failed")
      }
    }

    xhr.send(data);
  })
}

// display event with checkbox
const displayEvent = (event) => {
  let li = document.createElement("li")
  const domain = getCustomerDomain(event)
  const activity = inferActivityType(event)
  const record = gcalActivities.oppsMap[domain]

  let eventMarkup = `<div class="form-check"><input class="form-check-input" type="checkbox" id="${event.id}-check" name="${event.id}"><label class="form-check-label" id="${event.id}-label" for="${event.id}-check">${event.summary}</label>`

  if (activity.type || record?.Name) {
    eventMarkup += "<ul>"
  }

  if (activity.type) {
    eventMarkup += `<li>${activity.type} / ${activity.subType}</li>`
  }

  if (record?.Name) {
    eventMarkup += `<li>${record?.Name}</li>`
  }

  if (activity.type || record?.Name) {
    eventMarkup += "</ul>"
  }

  eventMarkup += "</div>"


  li.innerHTML = eventMarkup
  list.appendChild(li)
}

/**
 * Infers the type of activity based on summary of the event
 * @param {Google Calendar Event} event 
 * @returns an object with the Scratchpad activity `type` and `subType`
 */
const inferActivityType = (event) => {
  const summary = event.summary.toLowerCase()

  if (summary.includes("demo")) {
    return {
      type: "Discovery",
      subType: "Qualified Demo/Discovery Call"
    }
  }

  if (summary.includes("intro")) {
    return {
      type: "Discovery",
      subType: "Unqualified Demo/Discovery Call"
    }
  }

  if (summary.includes("kickoff") || summary.includes("kick off") || summary.includes("kick-off")) {
    return {
      type: "Evaluation",
      subType: "Pilot Kickoff"
    }
  }

  if (summary.includes("planning")) {
    return {
      type: "Evaluation",
      subType: "Success Planning"
    }
  }

  if (summary.includes("check in") || summary.includes("check-in") || summary.includes("checkin")) {
    return {
      type: "Evaluation",
      subType: "Pilot Status Call"
    }
  }

  if (summary.includes("wrapup") || summary.includes("wrap up") || summary.includes("wrap-up")) {
    return {
      type: "Evaluation",
      subType: "Pilot Close & Success Criteria Validation"
    }
  }
  if (summary.includes("working session") || summary.includes("troubleshoot") || summary.includes("debug")) {
    return {
      type: "Evaluation",
      subType: "Troubleshooting (Tech Support)"
    }
  }

  if (summary.includes("followup") || summary.includes("follow up") || summary.includes("follow-up")) {
    return {
      type: "Evaluation",
      subType: "Troubleshooting (Tech Support)"
    }
  }

  if (summary.includes("poc") || summary.includes("pilot")) {
    return {
      type: "Evaluation",
      subType: "Pilot Status Call"
    }
  }

  if (summary.includes("lessonly") || summary.includes("enablement")) {
    return {
      type: "Internal",
      subType: "Enablement"
    }
  }

  if (summary.includes("team meeting") || summary.includes("amer se - monthly")) {
    return {
      type: "Internal",
      subType: "Team and Peer Meetings"
    }
  }

  return {
    type: null,
    subType: null
  }
}

/**
 * Based on the list of attendees, the first non snyk.io domain is returned
 * @param {Google Calendar Event} event 
 * @returns the email domain of the customer, null otherwise
 */
const getCustomerDomain = (event) => {
  if (!event.attendees) {
    return null
  }
  
  const attendees = event.attendees;

  // get customer domain
  for (var i = 0; i < attendees.length; i++) {
    const email = attendees[i].email
    const domain = email?.split("@")[1]
    if (domain != "snyk.io") {
      return domain
    }
  }

  return null // if could not determine email
}

const log = (data) => {
  console.log(data)
  let msg = document.getElementById("log")
  msg.innerHTML = msg.innerHTML + "<br>" + JSON.stringify(data)
}