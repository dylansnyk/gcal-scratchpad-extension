# GCal Scratchpad Extension

![extension-gif](https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/0388eff8-6a6e-4d4e-a7d7-60b8f882f15c)

## Getting Started

1. Go to the [GCal Scratchpad Extension](https://chrome.google.com/webstore/detail/gcal-scratchpad-extension/kcnphkoihmmfmpfnogogajojfmigemhf) in the chrome web store.
2. Click Add to Chrome and pin the extension.
<p align="center"><img width="250" alt="Screen Shot 2023-07-21 at 10 02 14 AM" src="https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/662a57f6-e7db-41ec-9602-32fe0cc59d1d"></p>

3. Open the extension and click "Get Calendar Events" which will initiate the OAuth flow.

4. After selecting your Snyk Google account, Google will tell you the app isn't verified (cause it's not, yet). Click 'Advanced' then 'Go to GCal Scratchpad Extension (unsafe)'.
<p align="center"><img width="500" alt="Screen Shot 2023-07-21 at 9 57 02 AM" src="https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/636c3e21-f305-4dce-a371-6ef8df524fca">
</p>

5. Click Allow when prompted.
<p align="center"><img width="400" alt="Screen Shot 2023-07-21 at 9 57 37 AM" src="https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/5e7430c2-c1c9-4783-9848-4a48bff42b94"></p>

6. Select the calendar events that you'd like to create activities from and click 'Create Activities'.

## Auto-opportunity linking

Opportunity linking is based on the email domains of the attendees and the "Website Domain" field in Salesforce. To do so, we'll need to reference an opps view in Scratchpad with the necessary fields.

1. Create an Opportunity view with the following fields: Opportunity Name, Account Name, Website Domain, Sales Engineer:
<p align="center"><img width="600" alt="image" src="https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/52aeb619-5215-4fbe-af0a-3a8900db30f6"></p>

2. Open the Developer Console in Chrome and run `window.location.href`
4. Copy the ID at the end of the URL:
<p align="center"><img width="600" alt="Screen Shot 2023-07-18 at 3 19 33 PM" src="https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/58e0d53b-b441-492c-9a1b-aaccf86f8ff8">
</p>
5. Paste the ID into the extension:
<p align="center"><img width="600" alt="Screen Shot 2023-07-18 at 3 20 57 PM" src="https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/27dcd673-9a22-4b98-b87f-1aaa0a111229">
</p>

## How it works

The extension authenticates with Google Calendar through a standard OAuth flow to fetch the list of calendar events from the given date. The Scratchpad auth token is fetched from the cookies to make Scratchpad API calls.

First, the list of calendar events are fetched. There is some filtering that will happen to only display relevant events. For example, only accepted events are displayed.

When the events are fetched, the extension attempts to infer the activity type and link the opportunity. The activity type is based on the title of the event and the opportunity is linked based on the email domain of the attendees. If either of those could not be determined you can still create the event, but you'll need to manually fill in these fields afterward. A preview will be given so you know what these fields will be:

<p align="center"><img width="421" alt="Screen Shot 2023-07-18 at 3 21 47 PM" src="https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/06887cbd-5056-4638-909b-0e0014f4b9bb">
</p>

Once you select which calendar events you want to create activities for, clicking Create activities will iterate over the selected activities making a separate Scratchpad API call for each activity creation.
