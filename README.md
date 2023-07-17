# Activity Extension

![clip-gif](https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/0efaa8a4-ed8d-452b-9b82-7c4b3824d232)

## Getting Started (Test)

1. `git clone https://github.com/dylansnyk/gcal-scratchpad-extension`
2. At `chrome://extensions`, enable Developer mode, click "Load unpacked" and select the root directory of the cloned repo.
3. Pin the extension for easy access.
4. Slack Dylan Havelock your email to add you as a test user, and share your chrome extension ID:
   <p align="center"><img width="400" alt="image" src="https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/3d1407de-bdce-4c33-abce-817542b1a7a1"></p>
5. Swap the `oauth2.client_id` with the Client ID from Dylan
6. Reload the extension

## Auto-opportunity linking

Opportunity linking is based on the email domains of the attendees and the "Website Domain" field in Salesforce. To do so, we'll need to reference an opps view in Scratchpad with the necessary fields.

1. Create an Opportunity view with the following fields: Opportunity Name, Account Name, Website Domain, Sales Engineer:
<p align="center"><img width="600" alt="image" src="https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/2fdf44af-e410-4352-8a93-2fb6a4b70bcf"></p>

2. Open the Developer Console in Chrome and run `window.location.href`
4. Copy the ID at the end of the URL:
<p align="center"><img width="600" alt="Screen Shot 2023-07-10 at 11 15 18 AM" src="https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/1c0602ea-5a74-4963-b72a-f7a9a5683947"></p>

5. Paste the ID into the extension:
<p align="center"><img width="600" alt="Screen Shot 2023-06-30 at 11 49 13 AM" src="https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/8baa06ee-01ad-49f7-91e2-d2203f4e1ef4"></p>

## How it works

The extension authenticates with Google Calendar through a standard OAuth flow to fetch the list of calendar events from the given date. The Scratchpad auth token is fetched from the cookies to make Scratchpad API calls.

First, the list of calendar events are fetched. There is some filtering that will happen to only display relevant events. For example, only accepted events are displayed.

When the events are fetched, the extension attempts to infer the activity type and link the opportunity. The activity type is based on the title of the event and the opportunity is linked based on the email domain of the attendees. If either of those could not be determined you can still create the event, but you'll need to manually fill in these fields afterward. A preview will be given so you know what these fields will be:

<p align="center"><img width="421" alt="image" src="https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/88ae9034-dbb0-4c6a-b5e8-9f918c9e5984"></p>

Once you select which calendar events you want to create activities for, clicking Create activities will iterate over the selected activities making a separate Scratchpad API call for each activity creation.
