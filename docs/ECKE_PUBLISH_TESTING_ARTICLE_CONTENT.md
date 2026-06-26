# ECKE Publish testing article — paste into kink.social education writer

Use this content for the public alpha announcement education article. Replace the Discord-style paste with structured article HTML.

After updating the article on kink.social, **Sync** the ECKE publish target so the public page picks up the new excerpt, body, and hero image.

---

## Title

**ECKE Publish is online and ready for testing**

## Excerpt (1–2 sentences only)

Alpha organizers can now preview, publish, sync, and unpublish public ECKE listings directly from kink.social. Please only test with content you are comfortable making public.

## Suggested slug

`ecke-publish-alpha-testing`

## Body HTML

Paste into the article body editor (HTML/source mode) or recreate with headings and lists in the rich-text editor:

```html
<p>ECKE Publish is now ready for controlled alpha testing.</p>
<p>This feature lets you preview what will appear on East Coast Kink Events before anything goes public.</p>

<h2>What you can test publishing</h2>
<ul>
  <li>Public group listings</li>
  <li>Public group events</li>
  <li>Education articles</li>
  <li>Vendor profiles</li>
  <li>Organization listings</li>
  <li>Dungeon profiles</li>
  <li>Community places and venues</li>
  <li>Conventions</li>
  <li>Presenter profiles</li>
</ul>

<h2>What each ECKE panel should show</h2>
<ul>
  <li>Preview</li>
  <li>What will publish</li>
  <li>What will not publish</li>
  <li>What is public-safe but not displayed yet</li>
  <li>Publish, Sync, and Unpublish controls when you have permission</li>
</ul>

<h2>Who should test</h2>
<ul>
  <li>Group moderators</li>
  <li>Organization moderators</li>
  <li>Convention admins</li>
  <li>Vendors</li>
  <li>Presenters</li>
  <li>Place submitters</li>
  <li>Education authors</li>
</ul>

<h2>What to check</h2>
<ol>
  <li>Open the ECKE panel for something you manage.</li>
  <li>Click Preview.</li>
  <li>Confirm private information is listed under “will not publish.”</li>
  <li>Publish and open the ECKE URL.</li>
  <li>Confirm the public page looks correct.</li>
  <li>Edit a public field on kink.social.</li>
  <li>Confirm the listing becomes stale.</li>
  <li>Sync it.</li>
  <li>Unpublish when testing is done.</li>
</ol>

<h2>What should never appear publicly</h2>
<p>Member lists, RSVP lists, attendee lists, private addresses, hidden access information, staff notes, private contact details, legal names unless intentionally public, payment data, application answers, runner-only presenter materials, or anything marked private or member-only should never appear on ECKE.</p>
<p>If you see private information on ECKE, stop testing and report it immediately.</p>

<h2>How to report issues</h2>
<p>Post in the alpha channel with:</p>
<ul>
  <li>Entity type</li>
  <li>kink.social URL</li>
  <li>ECKE URL</li>
  <li>What you expected</li>
  <li>What actually happened</li>
</ul>
<p>Mark it urgent if private data may have appeared publicly.</p>

<h2>Reminder</h2>
<p>This is alpha testing. ECKE pages are public and may be indexed by search engines, so only publish things you actually intend to make public.</p>
```

## Hero image notes

- ECKE only displays hero images that resolve to a **public, ECKE-reachable URL**.
- kink.social media proxy URLs are resolved at publish time when the upload is promoted for anonymous public access.
- If Preview lists the hero under **deferred**, promote the upload or use a public CDN URL, then Sync.

## After editing

1. Save and publish the article on kink.social (PUBLIC visibility, ECKE opt-in on).
2. Open the ECKE panel → Preview → confirm hero and body fields match expectations.
3. Sync to ECKE.
4. Open the ECKE education URL and verify hero image, excerpt length, and section spacing.
