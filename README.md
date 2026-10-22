# JobSparkMiner

## Phase 1
The title/header should be: "Enter to win a SICTC t-shirt - and other fun things!"
We need the form to include fields for the following information:
  - Email address
  - School
  - Shirt size
  - 3 programs that sound interesting
  - Did you see us at the options fair? (only if EVSC student)
Data Storage Method:  Google Sheets

## Connect the form to Google Sheets

The form uses `google-apps-script.gs` as a small web-app receiver. To connect it to the giveaway spreadsheet:

1. Open [Google Apps Script](https://script.google.com/) and create a project.
2. Replace the starter code with the contents of `google-apps-script.gs` and save.
3. Select `initializeSheet` in the function menu and click **Run**. Authorize access to the spreadsheet and confirm the header row looks right.
4. Select **Deploy > New deployment**, choose **Web app**, set **Execute as** to **Me**, and set access to **Anyone**.
5. Deploy and copy the web app URL ending in `/exec`.
6. In `index.html`, set `googleAppsScriptUrl` to that URL.
7. Submit a test entry and verify it appears in the first sheet tab (the tab with ID `0`) of the linked spreadsheet.

The web app writes a timestamp, email, school, shirt size, three program choices, EVSC status, and Options Fair response. It creates and formats a header row if the target sheet is empty. The public web-app URL accepts unauthenticated form submissions, so keep it out of unrelated pages and monitor the sheet for spam.

## Phase 2
 - Website runs through Flask Server
 - Save data to a local DB (perferably MariaDB)
