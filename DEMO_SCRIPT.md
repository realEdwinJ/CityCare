# OneVoice Na — 4-Minute Demo Script

The brief gives each team **4 minutes**: problem → solution → architecture (brief) → live MVP demo. This script is timed to fit. The Group Leader leads; one person drives the phone, one drives the admin dashboard on a second screen if possible.

**Before you start:** backend running on EC2, `npm run seed` already executed, admin dashboard open and logged in, phone showing the Report screen. Have the public `/map` open in a spare tab.

---

## 0:00 – 0:45 · The problem (Group Leader)

> "In Windhoek today, if you want to report a burst pipe you use one channel; a pothole, another; comment on a new law, somewhere else entirely. People juggle multiple apps and unstructured channels — so most just give up, and critical issues go unreported. Government, meanwhile, gets fragmented, siloed data. We built **OneVoice Na**: one trusted app for every civic action, for the people of Namibia."

## 0:45 – 1:15 · The solution in one line

> "One app: report infrastructure issues, reach emergency services, comment on legislation, and send proposals straight to ministries — with an AI that automatically triages every report by urgency so councils fix the dangerous things first."

## 1:15 – 3:15 · Live demo (the golden path)

**On the phone:**
1. **Report tab** — "I'm a resident. There's raw sewage on my street." Type a title + description, pick the **Sewage** category, tap **Fetch Location**, optionally attach a photo. Submit.
2. When the confirmation pops up: *read it out* — "Notice the app instantly classified this as **CRITICAL** priority. That's our AI triage — no human sorted it."
3. **History tab** — "The resident can track it. Right now it says **Received**."

**Switch to the admin dashboard (municipal side):**
4. **Reports tab** — "This is what the city council sees. Every report, **sorted by AI severity** — critical items float to the top. Here's the sewage report we just filed, with the reporter's name and location." Point at the seeded burst-pipe report showing **"👥 4 citizens reported this"**: "duplicate reports within 60 metres merge automatically, so one real problem is one ticket — not four — and the more people report it, the more the AI escalates its urgency."
5. Change the sewage report's status to **In Progress**.

**Back to the phone:**
6. **History tab** → pull to refresh. "And the resident immediately sees it's now **In Progress**. That closed loop is what rebuilds trust in government responsiveness."

**Fast highlights (30 seconds, don't linger):**
7. **Public map** (spare tab) — "Anyone, no login, can see what's being reported across the city, colour-coded by severity. Radical transparency."
8. **Laws tab** on the phone — "Residents also read and rate proposed legislation," and **Ministries tab** — "or send a proposal straight to a specific ministry."

## 3:15 – 3:45 · Architecture (brief)

> "React Native app, a Node/Express API, deployed on **AWS EC2** behind nginx. The AI triage uses a fast rule engine with a Gemini layer on top — and it degrades gracefully: if the network drops, reports save offline and sync later, and classification still works. Clean, and cheap to run."

## 3:45 – 4:00 · Close

> "OneVoice Na turns four fragmented civic chores into one app, and uses AI to make sure the most dangerous problems get seen first. Built for the people. Thank you."

---

### Backup plan
If venue wifi fails: play the pre-recorded demo video (record one the night before — screen-capture the phone + dashboard doing the golden path above). Always have this ready; live demos on shared wifi are risky.

### If a judge asks "what's next?"
USSD/SMS reporting for feature phones (huge for rural reach), status-change push/SMS via AWS SNS, photo sanity-checks with Rekognition, and per-department analytics (hotspots, average resolution time).
