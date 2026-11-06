# Rotate the shared Editor password

Owner-only runbook. It needs the Contentful account's current password and its
recovery email inbox, neither of which an agent has.

## Why this is necessary

Every Editor logs into Contentful with one shared account (see **Editor** in
`GLOSSARY.md`). The account has administrator rights over the space, so the only
way to take access away from one person is to change the password for everyone.
The account has no two-factor authentication, because a second factor would tie
every login to a single person's phone. That makes the password the only
control, and it has to be rotated:

- whenever an Editor leaves the firm, before or on their last day;
- whenever the password may have been exposed: pasted into a chat or email,
  saved in a shared browser, written down;
- once a year otherwise.

The Delivery and webhook credentials are separate and do not change here. They
have their own runbooks (`rotate-contentful-credential.md`,
`configure-content-webhook.md`).

## Steps

### 1. Generate a new password

Use a password manager's generator: at least 20 characters, random. Do not
derive it from the old one.

### 2. Change it in Contentful

1. Log in at https://app.contentful.com with the shared account.
2. Avatar (top right) > **Account settings** > **Profile** > **Password**.
3. Enter the current and the new password and save.
4. Account settings > **Security** (or **Sessions**, depending on the UI) >
   sign out of all other sessions, if offered. Without this, a browser that is
   already logged in stays logged in.

### 3. Hand it to the remaining Editors

Share the new password through the firm's password manager (a shared vault
entry is best: the next rotation updates it in one place) or in person. Never by
email, chat, SMS or in the Editor guide PDF.

### 4. Verify

1. Log out, then log back in with the new password.
2. Ask one Editor to log in with it.
3. If someone left, confirm with them, or from the sessions list, that their
   session is gone.

## If the password is lost

Use **Forgot password?** on the login page. The reset email goes to the
account's email address, so that inbox must stay under the owner's control.
Check this whenever the account email is considered for change.
