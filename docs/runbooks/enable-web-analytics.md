# Enable Web Analytics

Owner-only runbook. It needs the Vercel dashboard for the production project,
which an agent cannot reach.

## Why this is necessary

Every page renders `<Analytics />` from `@vercel/analytics` (in
`components/SiteDocument.tsx`). The component loads its script from the site's
own origin, `/_vercel/insights/script.js`, and reports page views to
`/_vercel/insights/view`. Vercel only serves those paths once Web Analytics is
enabled for the project. Until then the script request returns 404 and no page
views are recorded. The site itself works either way.

Web Analytics sets no cookies and stores no personal data. Visitors are counted
by a hash of the request that changes daily. That is why the site shows no
consent banner. Keep it that way: do not enable any Vercel feature or add any
other analytics that sets a cookie or identifies visitors without first
revisiting the consent question.

## Steps

### 1. Enable Web Analytics

1. Open the production project in the [Vercel dashboard](https://vercel.com/dashboard).
2. Go to **Analytics** in the project's sidebar.
3. Click **Enable** and confirm.

Enabling it adds the `/_vercel/insights/*` routes on the **next** deployment.

### 2. Redeploy

Redeploy production: either push to `main` or use **Deployments → ⋯ → Redeploy**
on the current production deployment.

### 3. Verify

1. Open https://www.mrsassessors.com in a private window and visit a couple of
   pages.
2. In the browser's network tab, confirm `/_vercel/insights/script.js` returns
   `200` and a request to `/_vercel/insights/view` is sent on each navigation.
3. Confirm the site set no cookie: the Application (or Storage) tab lists none
   for the domain.
4. After a few minutes, the project's **Analytics** tab shows the visits.

## Plan limits

The Hobby plan includes a monthly quota of events. Data beyond the quota is not
recorded until the next cycle. Check the current limit on the Analytics tab
before relying on the numbers.
