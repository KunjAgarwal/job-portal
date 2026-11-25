# CareerConnect — Job and Internship Management Portal

A browser-based demo portal for browsing jobs and internships, submitting applications, and tracking application status. The sample user, opportunities, and initial applications live in `data/db.json`. Account details, employer listings, and applications are saved in this browser's local storage; `db.json` is seed data, not a writable database, so changes are not shared across browsers or devices.

## Run locally

The pages load the JSON seed with `fetch`, so open the project through a local HTTP server rather than directly as a `file://` URL. From the project folder, run:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Demo flow

1. Browse the home board, **Jobs**, or **Internships**. Filter by category, keyword, location, or opportunity type; use the pager to browse additional cards.
2. Select **View details**, then **Apply now** to submit an application. The demo profile pre-fills the form.
3. Use **My applications** to filter and review submitted applications.
4. Open an application to view its details or withdraw it.
5. Sign in, then select **For Employers** to complete the personal and organization steps. Employer listings are saved in this browser and appear with the seeded opportunities. Before posting, submit a business registration number for employer review; a pending or unverified account cannot publish.

The demo stores employer verification status in local storage and does not send OTPs, upload documents, or provide a review service. An authorized review process must set an employer account's `employerVerificationStatus` to `verified` before the posting step will accept a listing.

To restore the original dummy data in a browser, clear the site's local storage.