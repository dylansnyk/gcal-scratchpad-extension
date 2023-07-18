# Activity Extension

![extension-gif](https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/0388eff8-6a6e-4d4e-a7d7-60b8f882f15c)

## Getting Started (Test)

1. `git clone https://github.com/dylansnyk/gcal-scratchpad-extension`
2. At `chrome://extensions`, enable Developer mode, click "Load unpacked" and select the root directory of the cloned repo.
3. Pin the extension for easy access.
4. Slack Dylan Havelock your email to add you as a test user, and share your chrome extension ID:
   <p align="center"><img width="400" alt="image" src="https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/4f2e0b64-524a-4b8b-bd8d-cc9ac3c51c76"></p>

5. Swap the `oauth2.client_id` with the Client ID from Dylan
6. Reload the extension

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
