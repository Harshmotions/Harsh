# Site setup tasks

What's left to get the site fully working after the October 2026 update. Tasks are in the order to do them. Tick each box once it's done.

## Part 1: For Harsh (needs your accounts)

### Go live

- [x] **1. Merge `claude/busy-albattani-2fjyx4` into `master`.**
  Done on 2026-10-12 (fast-forward, production build verified).

### Remove AI work (live right now)

The site's code no longer mentions AI, but this content in Sanity still does, so it's still showing on motionbyharsh.com.

- [x] **A. Delete the 5 AI projects in Studio.**
  Studio → Projects → open each → ⋯ → Delete: "AI AD (Following Trend)" (SharkFunded), "AI Ad UGC (Cinematic)" (SharkFunded), "AI Ad UGC (Cinematic)" (MaziFinance), "AI Ad Trailer" (ISGL), "AI Ad Promo" (KYM Yoga). To remove the video files too, delete them in Studio's **Videos** tool.
  **Why:** 3 of these sit in the home page's reels row. Once they're gone, the row fills itself with your latest other reels.

- [x] **B. Edit the About text in Studio → Site Settings.**
  It still says "my focus is on AI creative ads and films". Replace it with what you do now.

- [ ] **C. (Optional) Upload a portrait in Studio → Site Settings → Portrait.**
  **Why:** About shows it automatically. Clients hire a person, and there's no photo of you on the site yet.

### Make the project brief form deliver

The new "Start a project" form sends each brief by email (Resend) and saves a copy in Sanity Studio under **Leads**. Right now neither is set up. Until at least one is, **every submission fails.** The visitor sees an error with WhatsApp and email links instead, so they can still reach you, but whatever they typed isn't sent.

Add these in **Vercel → Project → Settings → Environment Variables**. Tick both *Production* and *Preview*.

- [x] **2. Add `SANITY_API_WRITE_TOKEN`.**
  Create it at sanity.io/manage → your project → **API** → **Tokens** → *Add API token*, with **Editor** permission.
  **Why:** the site needs write access to save briefs to Studio → Leads. This gives you a permanent record even if an email goes missing.

- [x] **3. Add `RESEND_API_KEY`.**
  Create it at resend.com → **API Keys**.
  **Why:** emails you each brief the moment it's sent. The email's reply-to is the client's address, so hitting Reply goes straight to them. With both 2 and 3 set, a brief still gets through if one service is down.

- [x] **4. Verify `motionbyharsh.com` in Resend, then add `BRIEF_FROM_EMAIL`.**
  In Resend → **Domains**, add the domain and copy the DNS records it gives you into your domain provider. Once it shows *Verified*, set `BRIEF_FROM_EMAIL` to something like `motion by harsh <briefs@motionbyharsh.com>`.
  **Why:** without a verified domain, Resend falls back to its test sender, which only delivers to the email you signed up to Resend with. Briefs to any other inbox would be silently dropped.
  **Shortcut:** if you sign up to Resend with `hello@motionbyharsh.com` itself, briefs reach that inbox without verifying the domain. Verifying is still better long term.

- [x] **5. Make sure `hello@motionbyharsh.com` receives mail, or add `BRIEF_TO_EMAIL`.**
  **Why:** briefs go to `hello@motionbyharsh.com` unless `BRIEF_TO_EMAIL` says otherwise. That address is also the public email button in the contact section and footer, so it needs to work either way.

- [x] **6. Redeploy in Vercel.**
  Use **Deployments** → latest → *Redeploy*, or just merge task 1 after adding the variables.
  **Why:** Vercel only applies new environment variables to new deployments. The running site won't see them until it's rebuilt.

- [x] **7. Send yourself a test brief on the live site.**
  Fill in the form at motionbyharsh.com, then check that the email arrives and that the brief appears in Studio → Leads.
  **Why:** the delivery code couldn't be tested end to end, because the build sandbox has no access to Resend or Sanity. This is the only proof it works.

### Content and settings

- [x] **8. Check the WhatsApp number in Studio → Site Settings.**
  Checked on 2026-10-12: it's `918793689965`, which is the right format.
  Use digits only, with country code and no `+`, spaces or dashes (e.g. `919876543210`).
  **Why:** the site builds WhatsApp links as `https://wa.me/<number>`, in the contact section, the project popup and the brief form's "WhatsApp me" button. A `+`, a space or a missing country code sends people to the wrong place or an error page. Studio only opens when you run the site locally (`npm run dev` → `localhost:3000/studio`), because `/studio` is blocked on the live site.

- [x] **9. Fix `NEXT_PUBLIC_SITE_URL` in Vercel.** Confirmed on 2026-10-12: the live site still uses `harshpowar.com`. Set it to `https://www.motionbyharsh.com`, or delete it.
  **Why:** it controls the canonical URL, sitemap and link previews. If it's still set to the old `harshpowar.com`, Google indexes the wrong domain.

### After it's live

- [ ] **10. Check Speed Insights in a few days (Desktop and Mobile tabs).** It is already enabled and collecting (desktop score 80 on 2026-10-12, mostly from visits before that day's speed fixes). Compare after a few days of new traffic; the per-metric breakdown needs Vercel's paid Plus add-on, the free score is enough.
  **Why:** the before/after speed numbers come from a local build with placeholder content and no showreel video. Speed Insights shows what real visitors experience on their own phones, which is what Google uses for search ranking. Analytics shows actual traffic, which couldn't be checked from here.

## Part 2: Code follow-ups (Claude can do these)

- [x] **11. Load the first row of thumbnails on `/reels` and `/landscape` right away.**
  **Why:** on phones, the largest thing on `/reels` is the first thumbnail, and `/landscape` uses the same cards. Every card image is set to load lazily, so the browser waits before even requesting it. `/reels` takes about 5.3s to show its main content, against Google's 2.5s "good" target. Loading the first row eagerly is a small change with a direct speed win.

- [x] **12. Fix the logo link's accessible name in the nav.**
  **Why:** the link shows "motionbyharsh" but tells assistive tech it's called "motion by harsh, home". People using voice control say what they see ("click motionbyharsh"), and that doesn't match, so the command fails. Lighthouse flags this on every page.

- [x] **13. Fix the heading order on `/reels` and `/landscape`.** *(Minor.)*
  **Why:** the project card titles are `h3`s placed directly under the page's `h1`, skipping `h2`. Screen-reader users jump around pages by heading level, and a skipped level makes the page structure look broken. It's the only reason `/reels` scores 98 rather than 100 for accessibility.

## Part 3: Speed follow-ups (for Harsh)

- [x] **14. Switch the site's DNS records in Cloudflare to "DNS only" (grey cloud).**
  Cloudflare → motionbyharsh.com → **DNS** → the `A`/`CNAME` records for `motionbyharsh.com` and `www` → click the orange cloud so it turns grey. Leave the MX, TXT and Resend (`send`, `rsend`, `resend._domainkey`) records as they are.
  **Why:** right now every visit goes through Cloudflare's proxy and then Vercel's. That's an extra network hop, and Cloudflare also injects an email-protection script into every page. Vercel recommends DNS only for domains it hosts; it already provides the CDN and SSL. Email forwarding isn't affected.

- [x] **15. Find out why some deploys failed within seconds.**
  Cause (from the Vercel error, 2026-10-12): *"Git information retrieval failed for this deployment"*. Vercel couldn't fetch the commit from GitHub, so it stopped before building. Root cause: a platform outage, not this project. On 2026-10-12 Vercel had an open incident "Increased build and deployment failures" (from 13:35 UTC; Builds and Git Integrations in partial outage) and GitHub had an API incident (from ~12:33 UTC). Reconnecting Git in Vercel (task 19) did not change it. It's not a code problem: the next push or a **Redeploy** always succeeded with identical code, and nothing was lost. It happened during a burst of quick pushes. If it starts happening often, reconnect the repo in Vercel → **Settings → Git**, and check GitHub → **Settings → Applications → Vercel** still has access to `Harshmotions/Harsh`.

- [x] **16. (Optional) Make the `motionbyharsh.com` → `www` redirect permanent.**
  Vercel → project `harsh` → **Settings → Domains** → `motionbyharsh.com` → Edit → redirect to `www.motionbyharsh.com` with **308 Permanent** (it's currently 307 Temporary).
  **Why:** a permanent redirect tells Google the `www` address is the real one, so ranking signals aren't split between the two.

## Part 4: Don't miss briefs (for Harsh)

- [x] **17. Make brief emails always land in Primary with a Gmail filter.**
  Gmail on a computer → search bar → **Show search options** (the sliders icon) → *From:* `briefs@motionbyharsh.com` → **Create filter** → tick *Never send it to Spam*, *Always mark it as important*, *Categorize as: Primary* → **Create filter**. Also add `briefs@motionbyharsh.com` to your contacts.
  **Why:** Gmail filed the test brief under Promotions, where the phone app doesn't notify you. The email subject no longer contains a price (a strong Promotions signal), which helps, but only a filter guarantees Primary.

- [ ] **18. Check Resend open/click tracking is off.** Resend → **Domains** → motionbyharsh.com → **Configuration**.
  **Why:** tracking pixels and rewritten links are typical of marketing email and push Gmail towards Promotions. Briefs don't need either.

- [x] **19. Reconnect the GitHub repo in Vercel if deploys keep failing in seconds.** Vercel → `harsh` → **Settings → Git** → Disconnect, then **Connect Git Repository** → GitHub → `Harshmotions/Harsh`.
  **Why:** by 13:45 on 2026-10-12, 4 pushes had failed with "Git information retrieval failed" and each worked on retry. Reconnecting refreshes Vercel's access to GitHub, the usual fix for this error.
