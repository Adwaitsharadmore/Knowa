# KNOWA
**Your team’s knowledge, anytime you work.**

## Architecture
<img width="3240" height="3240" alt="Knowa UML" src="https://github.com/user-attachments/assets/33b7e1a8-5b76-4a1f-b5c7-14f83c074d5e" />


---

## Introduction
Knowa is a Slack-first knowledge assistant that turns your organization’s onboarding materials into instant, reliable answers. Admins upload docs (PDFs, docs, text, audio/video transcripts), Knowa indexes them with Supermemory, and new hires can ask natural-language questions in Slack to get cited, contextual responses.

---

## Problem Statement
- **Onboarding takes time** — new employees need answers quickly to become productive.  
- **Managers are busy** — they can’t stay available 24/7 for repetitive questions.  
- **Document management is tedious** — content is scattered across files, versions, and folders, making it hard to find the right information when it’s needed.

---

## Approach

### Workflow (as in the diagram)
1. **Upload knowledge:** Admins use the Knowa UI to ingest organizational docs (txt, pdf, audio/video transcripts).
2. **Org & user management:** Supabase Auth verifies users/orgs and enforces multi-tenant security (RLS).
3. **Connect Slack:** Admin securely links the Slack workspace and installs the Knowa bot.
4. **Push to Supermemory:** Knowa sends cleaned/normalized content to **Supermemory**, which:
   - Adds metadata and container tags  
   - Generates **embeddings** and builds a **memory graph** for higher recall and better context
5. **Ask in Slack:** A new hire @mentions the app or uses a slash command to ask a question.
6. **Retrieve relevant chunks:** Knowa queries the **memory graph** to fetch the most relevant chunks (scoped by org and permissions).
7. **Answer with context:** Knowa composes a response from the retrieved chunks and replies in Slack (with citations/back-links when available).


---

## Impact
- **Saves time for managers:** Offloads repetitive onboarding Q&A so leaders can focus on high-value work.  
- **Makes onboarding easy:** New hires get instant, accurate answers with context and sources.  
- **Always available:** Employees can ask questions anytime in Slack and get reliable, organization-specific responses.

---
