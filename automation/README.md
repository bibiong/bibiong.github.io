# Weekly report automation

`WeeklyReport.gs` emails a Monday digest combining GA4 traffic for brendaong.com
with new CV download requests.

It runs as a Google Apps Script **bound to the "CV Downloads" response
spreadsheet**, on Google's servers — your Mac does not need to be on.

## Install (once, ~5 minutes)

1. Open the [CV Downloads spreadsheet](https://docs.google.com/spreadsheets/d/1URmK4zXcHjbxZgqw5vs-cpWYbr9oe1ReO2nPqy9W0Sc/edit).
2. **Extensions → Apps Script.** A new tab opens with an empty `Code.gs`.
3. Select everything in the editor and paste in the whole of `WeeklyReport.gs`.
4. At the top of the script, set `GA4_PROPERTY_ID` to your numeric GA4 property ID.
   Find it in Google Analytics under **Admin → Property Settings → Property ID**.
   It is a number like `123456789` — *not* the `G-GTC8QREPKN` measurement ID.
5. In the left sidebar click **Services (+)**, find **Google Analytics Data API**,
   and click **Add**. The identifier must stay as `AnalyticsData`.
6. Save (⌘S). Choose `testRun` from the function dropdown and click **Run**.
   Google will ask for permission — it is your own script reading your own data.
   On the "Google hasn't verified this app" screen choose **Advanced → Go to
   (project name)**. Check your inbox.
7. Choose `createWeeklyTrigger` from the dropdown and **Run** once. Done —
   it now sends every Monday around 08:00.

## Changing it later

| Want to | Do this |
|---|---|
| Different day or time | Edit `createWeeklyTrigger` and run it again |
| Different recipient | Change `EMAIL_TO` |
| Skip silent weeks | Set `SEND_WHEN_QUIET = false` |
| Send one now | Run `testRun` |
| Stop entirely | Apps Script → Triggers (clock icon) → delete the trigger |

## Notes

- The 30-day trend chart is built from HTML table cells, not an image or SVG:
  Gmail strips SVG and most clients block remote images by default. The last
  seven bars are in the accent colour — the week the email reports on.
- **Hover tooltips** on the chart use the HTML `title` attribute. They work in
  Outlook.com, Apple Mail and most desktop clients; **Gmail strips them**. That is
  why the reported week's counts are printed above the bars and a week-by-week
  total table sits underneath — the numbers are readable without hovering.
- Traffic figures cover the last 7 full days, ending yesterday, because GA4 data
  takes up to 48 hours to finalise.
- CV requests are read from the first sheet, matched by column *header* name, so
  reordering columns is safe. Renaming them is not.
- Numbers undercount: anyone who declines cookies or runs a tracking blocker is
  invisible to GA4. The email says so in its footer. CV requests are exact.
- `MailApp` allows 100 emails/day on a consumer Google account. This uses one a week.
