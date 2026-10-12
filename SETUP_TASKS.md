# Site setup tasks

What's left to get the site fully working after the October 2026 update. Tasks are in the order to do them. Tick each box once it's done.

## Part 1: For Harsh (needs your accounts)

### Go live

- [ ] **1. Merge `claude/busy-albattani-2fjyx4` into `master`.**
  **Why:** production deploys from `master`. The speed fixes, lint fixes and the `middleware.ts` → `proxy.ts` rename are only on this branch, so the live site doesn't have them yet. Vercel should also build a preview of the branch, so you can check it before merging.

### Make the project brief form deliver

The new "Start a project" form sends each brief by email (Resend) and saves a copy in Sanity Studio under **Leads**. Right now neither is set up. Until at least one is, **every submission shows the visitor an error and the brief is lost.**

Add these in **Vercel → Project → Settings → Environment Variables**. Tick both *Production* and *Preview*.

- [ ] **2. Add `SANITY_API_WRITE_TOKEN`.**
  Create it at sanity.io/manage → your project → **API** → **Tokens** → *Add API token*, with **Editor** permission.
  **Why:** the site needs write access to save briefs to Studio → Leads. This gives you a permanent record even if an email goes missing.

- [ ] **3. Add `RESEND_API_KEY`.**
  Create it at resend.com → **API Keys**.
  **Why:** emails you each brief the moment it's sent. The email's reply-to is the client's address, so hitting Reply goes straight to them. With both 2 and 3 set, a brief still gets through if one service is down.

- [ ] **4. Verify `motionbyharsh.com` in Resend, then add `BRIEF_FROM_EMAIL`.**
  In Resend → **Domains**, add the domain and copy the DNS records it gives you into your domain provider. Once it shows *Verified*, set `BRIEF_FROM_EMAIL` to something like `motion by harsh <briefs@motionbyharsh.com>`.
  **Why:** without a verified domain, Resend falls back to its test sender, which only delivers to the email you signed up to Resend with. Briefs to any other inbox would be silently dropped.

- [ ] **5. Make sure `hello@motionbyharsh.com` receives mail, or add `BRIEF_TO_EMAIL`.**
  **Why:** briefs go to `hello@motionbyharsh.com` unless `BRIEF_TO_EMAIL` says otherwise. That address is also the public email button in the contact section and footer, so it needs to work either way.

- [ ] **6. Redeploy in Vercel.**
  Use **Deployments** → latest → *Redeploy*, or just merge task 1 after adding the variables.
  **Why:** Vercel only applies new environment variables to new deployments. The running site won't see them until it's rebuilt.

- [ ] **7. Send yourself a test brief on the live site.**
  Fill in the form at motionbyharsh.com, then check that the email arrives and that the brief appears in Studio → Leads.
  **Why:** the delivery code couldn't be tested end to end, because the build sandbox has no access to Resend or Sanity. This is the only proof it works.

### Content and settings

- [ ] **8. Check the WhatsApp number in Studio → Site Settings.**
  Use digits only, with country code and no `+`, spaces or dashes (e.g. `919876543210`).
  **Why:** the site builds WhatsApp links as `https://wa.me/<number>`, in the contact section, the project popup and the brief form's "WhatsApp me" button. A `+`, a space or a missing country code sends people to the wrong place or an error page. Studio only opens when you run the site locally (`npm run dev` → `localhost:3000/studio`), because `/studio` is blocked on the live site.

- [ ] **9. Keep `NEXT_PUBLIC_SANITY_PROJECT_ID` set in Vercel.** Also set `NEXT_PUBLIC_SANITY_DATASET` if your dataset isn't called `production`.
  **Why:** without the project ID the build stops on purpose (`lib/sanity.ts` throws) and nothing deploys. It's almost certainly set already, since the site has deployed before. This is just a reminder not to remove it.

### After it's live

- [ ] **10. In a few days, check Vercel → Speed Insights and Analytics.**
  **Why:** the before/after speed numbers come from a local build with placeholder content and no showreel video. Speed Insights shows what real visitors experience on their own phones, which is what Google uses for search ranking. Analytics shows actual traffic, which couldn't be checked from here.

## Part 2: Code follow-ups (Claude can do these)

- [ ] **11. Load the first row of thumbnails on `/reels` and `/landscape` right away.**
  **Why:** on phones, the largest thing on `/reels` is the first thumbnail, and `/landscape` uses the same cards. Every card image is set to load lazily, so the browser waits before even requesting it. `/reels` takes about 5.3s to show its main content, against Google's 2.5s "good" target. Loading the first row eagerly is a small change with a direct speed win.

- [ ] **12. Fix the logo link's accessible name in the nav.**
  **Why:** the link shows "motionbyharsh" but tells assistive tech it's called "motion by harsh, home". People using voice control say what they see ("click motionbyharsh"), and that doesn't match, so the command fails. Lighthouse flags this on every page.

- [ ] **13. Fix the heading order on `/reels` and `/landscape`.** *(Minor.)*
  **Why:** the project card titles are `h3`s placed directly under the page's `h1`, skipping `h2`. Screen-reader users jump around pages by heading level, and a skipped level makes the page structure look broken. It's the only reason `/reels` scores 98 rather than 100 for accessibility.
