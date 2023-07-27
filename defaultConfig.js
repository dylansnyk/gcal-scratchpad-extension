const defaultConfig = 
{
    "mappings": [
        {
            "summary": ["demo"],
            "activity": {
                "type": "Discovery",
                "subType": "Qualified Demo/Discovery Call"
            }
        },
        {
            "summary": ["intro"],
            "activity": {
                "type": "Discovery",
                "subType": "Unqualified Demo/Discovery Call"
            }
        },
        {
            "summary": ["kickoff", "kick off", "kick-off"],
            "activity": {
                "type": "Evaluation",
                "subType": "Pilot Kickoff"
            }
        },
        {
            "summary": ["planning"],
            "activity": {
                "type": "Evaluation",
                "subType": "Success Planning"
            }
        },
        {
            "summary": ["check in", "check-in", "checkin"],
            "activity": {
                "type": "Evaluation",
                "subType": "Pilot Status Call"
            }
        },
        {
            "summary": ["wrapup", "wrap up", "wrap-up"],
            "activity": {
                "type": "Evaluation",
                "subType": "Pilot Close & Success Criteria Validation"
            }
        },
        {
            "summary": ["monthly", "quarterly"],
            "isInternal": false,
            "activity": {
                "type": "Account Management",
                "subType": "Customer Sync Meeting"
              }
        },
        {
            "summary": [""],
            "isInternal": true,
            "activity": {
                "type": "Internal",
                "subTybe": null
            }
        }
    ]
}