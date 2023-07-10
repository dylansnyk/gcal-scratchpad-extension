# Activity Extension

![gcal-spag-clip](https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/23590190-ab96-44b9-abb2-cca0afed7b0f)

## Getting Started (Test)

1. `git clone https://github.com/dylansnyk/gcal-scratchpad-extension`
2. At `chrome://extensions`, enable Developer mode, click "Load unpacked" and select the root directory of the cloned repo.
3. Pin the extension for easy access.
4. Slack Dylan Havelock your email to add you as a test user.

## Auto-opportunity linking

Opportunity linking is based on the email domains of the attendees and the "Website Domain" field in Salesforce. To do so, we'll need to reference an opps view in Scratchpad with the necessary fields.

1. Create an Opportunity view with the following fields: Opportunity Name, Account Name, Website Domain, Sales Engineer:
<p align="center"><img width="600" alt="image" src="https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/2fdf44af-e410-4352-8a93-2fb6a4b70bcf"></p>

2. Open the Developer Console in Chrome and run `window.location.href`
4. Copy the ID at the end of the URL:
<p align="center"><img width="600" alt="Screen Shot 2023-07-10 at 11 15 18 AM" src="https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/1c0602ea-5a74-4963-b72a-f7a9a5683947"></p>

5. Paste the ID into the extension:
<p align="center"><img width="600" alt="Screen Shot 2023-06-30 at 11 49 13 AM" src="https://github.com/dylansnyk/gcal-scratchpad-extension/assets/94395157/8baa06ee-01ad-49f7-91e2-d2203f4e1ef4"></p>

