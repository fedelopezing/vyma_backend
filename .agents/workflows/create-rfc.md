---
description: 
---

Ideal Workflow with the Architect Agent
You will work with the agent: .agents/rules/architect-tech-lead.md

Phase 1: PRD Ingestion (Kickoff)
The cycle starts when the Product team (or you) has a Product Requirements Document (PRD) ready for a new feature.
User Action: You pass the complete PRD to the Agent (it can be plain text, a markdown, or key points if it's a small feature).
Supporting Prompt: "Here is the PRD for the new [X] module. Please read it and, before designing anything, ask me any questions you need to clarify edge cases, business rules, or non-functional requirements that are not clear."
Agent Action: The agent reads and responds exclusively with technical questions (e.g. What happens if the WhatsApp sending fails? Do we save a log? Will there be automatic retries?).

Phase 2: Clarification and Agreements (Q&A)
Software design is based on decisions. This phase eliminates ambiguities.
User Action: You answer the agent's questions with business definitions or previous technical decisions.
Iteration: If the answers generate new critical dependencies, the agent may ask a follow-up question. Once everything is clear, the green light is given.
Supporting Prompt: "All my answers are above. Now, please generate the initial Architectural RFC following the structure of your system prompt."

Phase 3: Generating the RFC Draft (Drafting)
In this phase, the agent creates the technical document (RFC - Request For Comments).
Agent Action: Produces a structured technical document that includes:
Architectural flow diagram (Mermaid).
TypeORM entities (Database schema).
API Contracts (Endpoints and DTOs).
Concurrency and security considerations.
User Action (Review): You read the document. Since it is a "Request for Comments", your job here is to evaluate the technical proposal.

Phase 4: Iteration and Refinement (Review)
It is very rare for the first technical draft to be perfect. This is where collaboration comes in.
User Action: You ask the agent for specific adjustments based on your knowledge of the system or team limitations.
Feedback Example: "The POST /messages endpoint is fine, but instead of handling the WhatsApp sending synchronously, I want you to trigger a Nest event (EventEmitter) and handle it asynchronously."
Feedback Example: "Change the relationship between User and Company from OneToOne to ManyToOne."
Agent Action: The agent updates the corresponding section of the RFC and returns the corrected version.

Phase 5: Approval and Task Breakdown (Handoff)
Once the RFC reflects exactly what needs to be built in the backend (Harmonia), the design is converted into actionable tasks.
User Action: You approve the RFC.
Supporting Prompt: "The RFC is approved. Now, please convert it into a step-by-step implementation plan (checklist) that a Junior/Semi-Senior NestJS developer can follow in order."
Agent Action: Generates development "Tickets". (e.g. Task 1: Create the migration and TypeORM entity. Task 2: Create the DTO and Controller. Task 3: Implement the Service and events).

All RFCs will be created in a docs/RFCs folder following a numerical order.