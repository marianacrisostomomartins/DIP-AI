# DIP-AI

**LLM-assisted requirements discovery for AI innovation projects.**

DIP-AI is a web tool that guides multidisciplinary teams through the early *discovery* phase of an AI project. It turns the **DIP-AI Canvas**, a structured set of 28 questions, into a collaborative workspace. A large language model (LLM) acts as a co-pilot: it rewrites technical questions in plain language and drafts editable answer suggestions. People always review and decide.

> Accompanying paper: *ICSE 2027, Tool Demonstration and Data Showcase track.* <!-- TODO: add title / DOI once public -->

| | |
|---|---|
| 🌐 **Live tool** | https://dip-ai.vercel.app |
| 🎬 **Demo video** | <!-- TODO: YouTube URL --> |
| 📦 **Archived artifacts** | https://doi.org/10.5281/zenodo.20360055 |

![DIP-AI Canvas](docs/screenshots/02-canvas.png)

---

## Table of contents

1. [Why DIP-AI?](#why-dip-ai)
2. [Who is it for?](#who-is-it-for)
3. [Key features](#key-features)
4. [Quick start (no installation)](#quick-start-no-installation)
5. [How to use it: step by step](#how-to-use-it-step-by-step)
6. [The DIP-AI Canvas](#the-dip-ai-canvas)
7. [LLM assistance: behavior and limits](#llm-assistance-behavior-and-limits)
8. [Architecture](#architecture)
9. [Running locally](#running-locally)
10. [Evaluation summary](#evaluation-summary)
11. [Citation](#citation)
12. [License, authors and acknowledgments](#license-authors-and-acknowledgments)

---

## Why DIP-AI?

Many AI projects fail not because of weak models but because of **unclear problems**: misaligned business objectives, stakeholders who do not share a vocabulary, and data feasibility that is checked too late. DIP-AI addresses this requirements engineering challenge by:

- giving teams a **shared, structured artifact** for discovery, grounded in the **ISO/IEC/IEEE 12207** and **ISO/IEC 5338** standards and in the **Design Thinking Double Diamond** (Emphasize → Define → Ideate → Prototype);
- **bridging the vocabulary gap** between business and technical participants with LLM-rewritten questions and draft answers;
- **closing the loop between business intent and data reality** (prioritization → data tasks → feasibility) before any model is built.

## Who is it for?

| Role | How they use DIP-AI |
|---|---|
| **Requirements engineers / AI project coordinators** | Create projects, invite collaborators, drive the discovery sessions, export the result. |
| **Business owners** | Define the business objective, justifications, benefits, KPIs and problems to address. |
| **Domain experts** | Characterize processes, stakeholders, locations and frequencies. |
| **Data scientists** | Identify data tasks and assess technical feasibility (input and output data, quality, metrics, risks, algorithms, baseline). |

Each canvas question is tagged with the stakeholder roles expected to answer it (see the **Glossary** in the left sidebar).

## Key features

- **Structured discovery canvas** with 28 questions in five color-coded blocks.
- **LLM co-pilot** for every question:
  - 🔵 *question rewriting*, shown in blue under the original question, in plain language and tailored to your project;
  - 🟢 *answer suggestion*, shown in green, drafted from everything already filled in the canvas. Use it as is with **Use this suggestion**, or edit it.
- **Human in the loop:** nothing is saved until the user clicks **Save**.
- **Asynchronous generation:** suggestions are produced in the background, so you can keep working. A status indicator in the header shows *"Suggestion being generated"* or *"All suggestions updated"*, and each card shows *Generating suggestions…* or *✓ Filled*.
- **LLM on/off switch:** the toggle in the header disables the assistant at runtime, and the canvas keeps working as a plain structured form (graceful degradation). This also supports controlled comparisons with and without LLM support.
- **Collaboration:** personal projects (*My Canvas*), projects *Shared with me*, and invitations by e-mail.
- **Export** of the finished canvas as **PDF** or **JSON**.
- **Bilingual interface** (language selector in the header).
- **Reliable persistence:** project data is stored in PostgreSQL with transactional (ACID) writes.

## Quick start (no installation)

You do **not** need to build or install anything to try DIP-AI.

1. Open **https://dip-ai.vercel.app**.
2. Sign in with one of the shared test accounts, or create your own:

   | Account | Password |
   |---|---|
   | `blind@test.com` | `setatest` |
   | `blind2@test.com` | `setatest2` |

   > These accounts are for reviewers and demos. Do **not** enter confidential or personal information. Projects on shared accounts may be visible to other users of the same account.
3. Follow the [step-by-step guide](#how-to-use-it-step-by-step) below.

The *Insect Control* example used in the demo video and in the screenshots is a good first project to recreate.

## How to use it: step by step

### 1. Create a project

From the **Projects** page, click **+ Create Canvas**, name it and confirm. Your projects appear under **My Canvas**. Projects others have invited you to appear under **Shared with me**.

![Projects](docs/screenshots/01-projects.png)

### 2. Invite collaborators

Open **Share** in the left sidebar of a project and add collaborators by e-mail. Each collaborator works on the same canvas, typically answering the questions that match their role (Business Owner, Domain Expert, Data Scientist).

### 3. Fill in the Business Objectives (blue)

Click a card (for example **1 - Business objective**) to open it. Type your answer and click **Save**. The business objective is the anchor for all later suggestions, so start there.

### 4. Use the LLM co-pilot

When you open a question you will see:

- the **original question**,
- a **blue, plain-language rewrite** of the question for your project,
- an empty **Your answer** box, and
- a **green *Answer suggestion*** drafted by the LLM.

Click **Use this suggestion** to copy it into your answer, edit freely, then **Save**. Review everything the model proposes, because it is a draft, not a result.

![LLM suggestion](docs/screenshots/03-llm-suggestion.png)

![Question rewriting and suggestion](docs/screenshots/04-llm-step-by-step.png)

### 5. Work through the remaining blocks

| Block | Color | What you do |
|---|---|---|
| **Business Objectives** | 🔵 | State the objective, justifications, benefits, KPIs, processes and problems. |
| **Process Characterization** | 🟡 | Describe tasks, rationale, how, stakeholders, where, how often. |
| **Prioritization** | 🟠 | Rate **severity, urgency and tendency to worsen** (1–5) per problem. The **multiplication** card computes the GUT score. |
| **Data Tasks Identification** | 🔴 | Identify data tasks, how they help the customer, and required data. |
| **Viability Analysis** | 🟢 | Select the priority problem, then assess input data, data quality, output data, performance metrics, risks, algorithms, baseline and references. |

Use the colored pills at the top of the canvas to jump between blocks.

![Viability analysis](docs/screenshots/05-feasibility.png)

### 6. Export the result

Click **Export** in the left sidebar and choose **PDF** (readable discovery document) or **JSON** (structured data for downstream tooling). Your browser may ask for permission to download files from the site.

![Exported document](docs/screenshots/06-export-preview.png)

## The DIP-AI Canvas

The canvas has 28 numbered fields:

| # | Block | Fields |
|---|---|---|
| 1–6 | Business Objectives | Business objective · Justifications · Benefits · KPIs · Processes to achieve the objective · Problems that need to be addressed |
| 7–12 | Process Characterization | Tasks for each process · Why · How it's done · Stakeholders · Where · How often |
| 13–16 | Prioritization | Severity · Urgency · Tendency to worsen · Multiplication |
| 17–19 | Data Tasks Identification | Data tasks · How it helps the customer · Required data |
| 20–28 | Viability Analysis | Priority problem · Input data · Data quality · Output data · Performance metrics · Risks · Algorithms · Baseline · References |

The canvas stages are: *business objective definition → process characterization → prioritization (GUT) → data task identification → feasibility analysis.*

## LLM assistance: behavior and limits

- **Model:** Gemini 2.5, called through a REST API behind a **provider-agnostic interface**, so another LLM provider can be plugged in.
- **Context:** suggestions are generated from the answers already present in the same canvas.
- **Asynchronous:** the frontend polls the backend for completed suggestions (short polling). Persistence is synchronous, so saved answers are never lost if the LLM is slow or unavailable.
- **Can be switched off** at any time with the header toggle.

**Known limitations (also observed in our focus groups):**

- **Hallucination:** suggestions can be plausible but wrong. Always review them.
- **Traceability:** the tool does not yet show *why* a suggestion was produced.
- **Guardrails:** safeguards beyond the prompt design are still future work.
- **Privacy:** the content of your canvas is sent to the LLM provider to generate suggestions. Do not include confidential data unless you have switched the assistant off or you have an appropriate agreement with your provider.

## Architecture

```
┌────────────┐   REST    ┌──────────────┐    SQL     ┌────────────┐
│  React SPA │ ────────▶ │ FastAPI      │ ─────────▶ │ PostgreSQL │
│ (frontend) │ ◀──────── │ (backend)    │            └────────────┘
└────────────┘  polling  │              │   REST     ┌────────────┐
                         │ LLM provider │ ─────────▶ │ Gemini 2.5 │
                         │ interface    │            └────────────┘
                         └──────────────┘
```

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| LLM | Gemini 2.5 via a provider-agnostic interface |
| Hosting (demo) | Vercel (https://dip-ai.vercel.app) |


## Evaluation summary

DIP-AI was evaluated in **two remote focus groups** (Kontio et al. protocol) with **8 industry AI professionals**: a live demonstration followed by structured discussion. Transcripts were analyzed with open and axial coding (Atlas.ti), and **7 participants** completed a TAM-based questionnaire (7-point scale):

| Construct | Tool | Framework |
|---|---|---|
| Perceived ease of use | 5.7 | 5.9 |
| Perceived usefulness | 5.4 | 6.0 |
| Intention to use | 5.9 | 6.4 |

Participants described DIP-AI as a **productivity accelerator**, and asked for stronger safeguards against hallucination, guardrails and better traceability. See the paper for details, threats to validity and ethics information.

## Citation

If you use DIP-AI in academic work, please cite:

```bibtex
@inproceedings{dipai2027,
  title     = {TODO: paper title},
  author    = {TODO: authors},
  booktitle = {Proceedings of the 49th IEEE/ACM International Conference on Software Engineering (ICSE) -- Tool Demonstrations},
  year      = {2027}
}
```

Archived version of the artifacts: https://doi.org/10.5281/zenodo.20360055

## License, authors and acknowledgments

- **License:** <!-- TODO: e.g. MIT / Apache-2.0, and add a LICENSE file -->
- **Authors:** Mariana Crisostomo Martins and Lucas Elias Cardoso Rocha
- **Contact:** maricrisostomo.martins@gmail.com
- **Acknowledgments:** We thank CEIA/UFG and CAPES for their financial and institutional support, and also the professionals of ExACTA and CEIA who participated in the research evaluation. Gemini 1.5 was used to improve the grammar and clarity of the text.
