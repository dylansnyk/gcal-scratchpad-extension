const RECORD_TYPE_ID = "0124P000000OLWCQA4"

// display event with checkbox
const displayEvent = (listElement, event) => {
  let li = document.createElement("li")
  const domain = getCustomerDomain(event)
  const activity = inferActivityType(event)
  const record = gcalActivities.oppsMap[domain]

  let eventMarkup = `<div class="form-check"><input class="form-check-input" type="checkbox" id="${event.id}-check" name="${event.id}"><label class="form-check-label" id="${event.id}-label" for="${event.id}-check">${event.summary}</label>`

  if (activity.type || record?.Name) {
    eventMarkup += "<ul>"
  }

  if (activity.type) {
    eventMarkup += `<li>${activity.type}`
  }

  if (activity.subType) {
    eventMarkup += ` / ${activity.subType}</li>`
  } else {
    eventMarkup += `</li>`
  }

  if (record?.Name) {
    eventMarkup += `<li>${record?.Name}</li>`
  }

  if (activity.type || record?.Name) {
    eventMarkup += "</ul>"
  }

  eventMarkup += "</div>"


  li.innerHTML = eventMarkup
  listElement.appendChild(li)
}

/**
 * Infers the type of activity based on summary of the event
 * @param {Google Calendar Event} event 
 * @returns an object with the Scratchpad activity `type` and `subType`
 */
const inferActivityType = (event) => {
  const summary = event.summary.toLowerCase()
  const isInternal = getCustomerDomain(event) == null;

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

  if ((summary.includes("monthly") || summary.includes("quarterly")) && !isInternal) {
    return {
      type: "Account Management",
      subType: "Customer Sync Meeting"
    }
  }

  if (isInternal) {
    return {
      type: "Internal",
      subType: null
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

const constructRequestBody = (date, type, event, record) => {
  return JSON.stringify({
    "attrs": {
      "ActivityDate": date,
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
}

const log = (data) => {
  console.log(data)
  let msg = document.getElementById("log")
  msg.innerHTML = msg.innerHTML + "<br>" + JSON.stringify(data)
}
