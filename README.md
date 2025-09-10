# Amplitude POC – User Activity & Insights Demo

This Proof of Concept shows how product teams can capture and review key user actions in a lightweight user management app. It focuses on the journey from first visit to ongoing engagement, and gives an in‑app view of the events being produced (without needing to open an external analytics dashboard).

## What This Demo Illustrates
* Tracking the basic sign up / sign in journey (including successes and failures)
* Recording everyday user management actions (create, view, update, delete)
* Seeing how different user groups ("teams") behave
* Viewing a simple funnel of login attempts vs. outcomes
* Offering a quick internal analytics screen for validation and stakeholder demos

## How to Explore the Demo
1. Open the app and register a new user.
2. Log in and perform a few actions: create or edit users, switch groups, log out and back in.
3. Visit the internal Analytics page (navigate to the analytics section) to see events populate in near real time.
4. Repeat actions with different groups to compare patterns.

## Internal Analytics View Shows
* Total captured events
* A miniature login funnel (attempted → succeeded → failed)
* Breakdown of events by user group

Use this to quickly answer: Are events firing? Do we distinguish failure reasons? Are certain groups more active?

## Why This Matters
Early validation of event design avoids rework later. Product, data, and engineering can align on naming, coverage, and usefulness before deeper instrumentation or dashboards are built.

## Intended Audience
* Product managers validating an event model
* Analysts checking if required context is present
* Engineers needing a quick reference of what’s emitted
* Stakeholders wanting a tangible walkthrough of the user journey

## Future Possibilities (Not Included Yet)
* More detailed performance/latency tracking
* Enrichment of user/group attributes for richer segmentation
* Scheduled or background event examples
* Feature flag / experiment hooks
* Exporting or forwarding captured events to other tools

## Notes
The app uses an analytics key (not included here). Provide a valid key before expecting events to land in an external analytics workspace. The internal analytics screen will still reflect locally captured actions for demo purposes.

---
Need a version with technical setup instructions again? Just ask and we can reintroduce them in an appendix.
 - Performance timing events (e.g., form submit latency).

 - Experiments / feature flag hooks.
