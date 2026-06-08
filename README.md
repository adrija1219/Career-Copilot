# AI Career Copilot 🚀

A full-stack Chrome extension sidepanel that securely aggregates active research tabs (LinkedIn, Glassdoor), compares them against a user's resume, and leverages **Mistral AI** to map matching scores, tech gaps, and custom roadmaps.

---

## 🏗️ Core Architecture & Tech

*   **Extension Front-End:** Manifest V3, SidePanel API, Scripting, Runtime Messages.
*   **Application Server:** Node.js, Express.js, Cors.
*   **AI Integration:** `@mistralai/mistralai` SDK (`mistral-large-latest` with native JSON output).
*   **Database:** MongoDB Atlas + Mongoose ODM.

---

## 📂 Quick Project Structure

```text
├── backend/
│   ├── server.js          # Express app server & Mistral logic
│   ├── package.json       # Backend allocations
│   └── .env               # Private API keys (Ignored by Git)
└── extension/
    ├── manifest.json      # Extension V3 rules
    ├── background.js      # Background script (DOM scraping engine)
    └── sidepanel/
        ├── panel.html     # UI panel containing the dynamic Resume Box
        └── panel.js       # Action handler & API communication
```

---
## Workflow

<img width="1536" height="1024" alt="ChatGPT Image Jun 8, 2026, 03_43_00 PM" src="https://github.com/user-attachments/assets/8692db8d-5bb6-4248-9d1b-8d6d16041d7c" />
