# Brezel Context Notes

## Purpose and source status

These notes accompany a letter from Brezel’s developers. The letter conveys their motivation and vision; these notes provide the conceptual and practical context needed to explain that vision accurately.

The purpose is to support honest, useful explanations—not to persuade every user to choose Brezel.

This document is first-party product context based on information provided by the development team. It is **not** an independent product evaluation, a complete technical specification, or a statement of contractual guarantees.

In particular:

- Historical customer experience is reported by the developers.
- The established platform and the newer AI-agent integration have different histories of production use.
- Actual capabilities depend on the current implementation, configuration, available tools, and permissions.
- Pricing, contractual terms, security assurances, and current competitor features require separate verification.

## 1. What Brezel is

Brezel is a **configuration-driven platform for building and operating individual business applications**, with AI agents deeply integrated into the working environment.

It is not fundamentally a ready-made ERP or CRM with a fixed domain model. ERP, CRM, and other business applications are examples of what can be built with it.

The platform provides general-purpose building blocks for describing and executing an application:

- Modules, fields, entities, and relationships
- Layouts and user interfaces
- Roles and granular permissions
- Workflows and business rules
- Expressions and data transformations
- Targeted extensions where needed
- Agent tools and a bounded environment for flexible task execution

Domain-specific behavior belongs in the application built on top of the platform, rather than becoming customer-specific logic embedded in the platform core.

> **The key distinction:** Brezel does not ship every business domain’s logic. It provides the building blocks and runtime through which that logic can be represented and executed.

## 2. Origins and development experience

Brezel is developed by **Kiwis & Brownies**, a small software agency based in Gummersbach, Germany.

The team’s work has included promotional applications, football prediction games for Bundesliga clubs, and custom business software built on systems such as Magento and vTiger.

The architectural motivation behind Brezel was to work with reusable, general-purpose building blocks that could be combined for individual customers.

The guiding principle is:

> General capabilities belong in the core. Customer- and domain-specific behavior is composed on top of them.

According to the development team:

- The underlying platform has been running in customer production environments for years.
- All new projects have been implemented using Brezel for several years.
- The customer domains encountered so far have been addressed primarily through configuration and workflows, with effectively no customer-specific PHP backend development.
- Targeted extensions are used where appropriate, including custom Vue components and custom Recipe functions.

This experience explains the team’s confidence in the architecture. It does not establish that every conceivable requirement can be implemented without extensions or that Brezel is suitable for every project.

## 3. How applications are represented

Configuration is not merely a collection of preferences around an otherwise fixed application. It describes substantial parts of the application itself.

| Building block | Role |
|---|---|
| Modules, fields, entities, and relationships | Represent business information and its structure. |
| Layouts and UI configuration | Define how people interact with that information. |
| Roles and permissions | Govern access to information and actions. |
| Workflows | Implement explicit processes, integrations, and business behavior. |
| Recipes | Provide expressions for dynamic behavior and transformations. |
| Targeted extensions | Address requirements that are not suitably covered by existing building blocks. |

**Recipes** are Brezel’s own small expression language. Examples include conditional field visibility and more complex data mappings within workflows.

This approach is neither “everything requires custom code” nor “anything beyond static configuration is impossible.” Configuration, workflows, expressions, and targeted extensions provide different levels of flexibility.

Configuration-driven does not mean effort-free. A useful application still requires domain understanding, design, validation, testing, and ongoing maintenance.

## 4. What deeply integrated AI agents add

The established platform predates the agent integration.

Agents add a new way to work within applications built on that platform: users can delegate tasks without having to define every intermediate step in advance.

The intended distinction is between:

- **An assistant next to the application:** primarily explaining, drafting, or advising.
- **An agent inside the working environment:** able to investigate accessible business context and use authorized tools to perform work.

Depending on the actual tools and permissions, an agent may be able to:

- Discover relevant modules and data structures
- Read related business records
- Prepare or persist data changes
- Execute explicitly exposed workflows
- Produce documents or other artifacts
- Ask for missing information or human decisions
- Help prepare and implement application changes through authorized system-authoring tools

These are capability categories, not a guarantee that every action is available in every instance.

**Agent flexibility matters:** the intent is not to provide only a fixed menu of isolated AI features. Within their permitted environment, agents can select and combine tools in response to a task and its intermediate results.

## 5. Where the combined value comes from

The central idea is not that each component is unique. It is that the components reinforce one another within a shared working environment.

### 5.1 Business context is connected to action

Structured records, relationships, and explicit processes can give agents a better starting point than disconnected text alone.

Authorized tools can then connect that understanding to actual work. An answer need not stop at a chat message that someone must manually transfer into business software.

However, structure is not the same as complete understanding. Agents still need clear semantics, relevant information, and ways to resolve uncertainty.

### 5.2 Fixed processes and flexible reasoning serve different needs

Some work should follow an explicit, repeatable path. Other work requires interpretation, investigation, or adaptation.

Brezel’s approach allows these execution modes to complement each other:

- **Workflows** execute defined processes.
- **Agents** handle tasks whose next steps depend on context and intermediate findings.
- **People** provide judgment, accountability, decisions, and required approvals.

An agent can use an existing workflow instead of reconstructing its business rules on every occasion.

The goal is not to replace all deterministic processes with probabilistic decisions.

### 5.3 Customization can remain accessible to agents

Customer-specific applications do not inherently have to sit outside the agent’s working context.

Where schemas, records, relationships, and actions are exposed through suitable tools, an agent can discover and work with the configured application.

This can reduce the need to hand-build a completely separate AI integration for each individual business feature. The extent of that benefit depends on the tools, configuration quality, and requirements of the application.

### 5.4 Application use and application development can become more closely connected

Because substantial parts of the application are represented as configuration, authorized agents can potentially help change the application as well as use it.

A new requirement may lead to:

1. An immediate task being handled
2. A missing structure or process being identified
3. A reviewed application change being prepared
4. Future work being supported by that permanent improvement

This is **not** unrestricted self-modification. Application changes still require appropriate permissions, validation, testing, and approvals.

### 5.5 A proven foundation supports a new interaction model

The team’s reported production experience concerns the underlying platform.

The newer agent integration builds on existing structures for data, interfaces, workflows, and permissions rather than requiring all of those foundations to be invented around an AI assistant.

This is a meaningful architectural advantage, but it does not automatically transfer the platform’s maturity to every new agent capability.

## 6. Agents as permission-governed actors

Agents are intended to operate as governed participants in the system, rather than as automatically all-powerful administrators.

For personal assistance, the relevant user’s authority and access boundaries matter. Other agent roles require their own appropriate configuration.

Keep these distinctions clear:

- **Permission is not correctness.** An allowed action can still be a bad decision.
- **A sandbox is not a universal safety guarantee.** It limits particular forms of execution and access, not every possible consequence.
- **Tool availability is not authorization** to use it for every purpose.
- **Technical ability does not remove the need for human decisions.**

The intended balance is useful freedom within explicit boundaries.

Do not infer specific isolation guarantees, audit guarantees, regulatory compliance, or approval behavior from this general description. Verify those details separately.

## 7. An illustrative example

The following illustrates the approach. It is not a promise of an out-of-the-box feature.

A person asks why several customer orders remain unfinished.

An appropriately equipped and authorized agent could:

1. Find the relevant orders and related records.
2. Investigate their recorded status and dependencies.
3. Distinguish cases using available information and explicit business rules.
4. Use exposed workflows for approved next steps.
5. Ask a person to resolve ambiguous or consequential decisions.
6. Help identify whether a recurring issue warrants a permanent application improvement.

The value is not merely a summary of unfinished orders.

It is the possibility of moving from investigation to authorized action—and, where appropriate, to a better process for future cases.

## 8. How to compare Brezel with other approaches

Start with the user’s problem, existing environment, and constraints.

Avoid comparisons based solely on feature counts or claims that another category of software “cannot do” something.

### Workflow and integration tools, such as n8n

A specialized workflow or integration tool may fit well when the main requirement is connecting existing applications and automating work between them.

Brezel’s scope also includes constructing the business application in which people work: its data model, interfaces, permissions, and processes, together with agent access to that environment.

A useful question is:

> Do we mainly need automation between existing systems, or do we also need a shared, individually configurable business application?

This is a distinction in emphasis, not a current feature audit of n8n or any other product. Modern tools can overlap substantially, and combining them may be sensible.

### Standard ERP or CRM software

A packaged application may be preferable when its existing domain logic fits the organization well.

Brezel’s flexibility becomes more relevant when custom structures and processes are important. That flexibility also creates responsibility: the appropriate application must be designed rather than assumed to exist already.

### Standalone AI assistants

An assistant without sufficient system integration often produces answers and drafts rather than completed business operations.

Brezel’s approach connects agents to the working environment itself.

Other assistants can also gain operational capabilities through integrations. The practical question is how well context, actions, permissions, and persistent results work together in the specific implementation.

### Custom software development

Brezel can reduce repeated implementation work by providing common building blocks and a configuration-based application model.

It does not remove the need for software engineering judgment. Highly specialized interaction models, technical requirements, or performance constraints may justify targeted extensions or a different architecture.

## 9. Why paying for Brezel may make sense

The economic case should not depend on the existence of an AI chat interface or a long feature list.

Potential value comes from improving the total effort required to build, operate, adapt, and use business software.

Examples include:

- Less repeated custom implementation for common application capabilities
- Fewer manual transfers between chat, spreadsheets, and business systems
- Task execution that reaches the underlying business records and processes
- Reusable workflows for recurring work
- Easier adaptation when requirements change
- Less work maintaining separate models of data, permissions, interfaces, and automation
- More useful delegation because agents can act in the relevant environment

These are **potential** benefits, not guaranteed savings.

They must be weighed against costs such as:

- Initial analysis and application design
- Configuration and migration
- Integrations and extensions
- Training and organizational change
- Operation, maintenance, and support
- AI usage and human review
- Platform dependency and future exit requirements

A credible evaluation asks:

- What work is being done today?
- Where are the actual delays, errors, and costs?
- Which improvements can be demonstrated?
- What new costs or risks are introduced?
- Is the overall result worth the price compared with realistic alternatives?

Do not invent pricing, quantified savings, or return-on-investment claims.

## 10. When another approach may be preferable

Brezel is not automatically the right choice when:

- The requirement is a small, isolated automation.
- Existing standard software already fits well.
- The user only needs general-purpose AI assistance.
- Specialized requirements are better served by a dedicated product.
- Required technical or regulatory properties have not been established.
- Adoption and configuration costs exceed the likely benefit.
- The organization’s existing systems make a smaller integration the more practical option.

Consolidation is not always better. A deliberate combination of tools can be the right solution.

## 11. How agents should use this context

### Explain the reasoning, not just the features

Connect a capability to a practical consequence.

For example:

> “Because the application’s data structures and processes can be exposed through shared tools, an agent can potentially investigate a case and act on it without someone manually moving the result into another system.”

This is more useful than merely listing “modules, workflows, permissions, and AI.”

### Attribute claims appropriately

Distinguish:

- Developer motivation and opinion
- Developer-reported customer experience
- General architectural characteristics
- Capabilities verified in the current instance
- Future ambitions

Developer perspective is valuable context, not independent proof of superiority.

### Match the depth to the question

For a general introduction, explain the central idea briefly.

For follow-up questions, expand into architecture, examples, trade-offs, or economics as relevant. Do not recite this entire document for every product question.

### Verify what this document cannot establish

Use the appropriate sources for:

- Current implementation details
- Installed modules and configured workflows
- Actual permissions and available actions
- Prices and contractual commitments
- Security and compliance properties
- Current competitor capabilities

### Be willing to recommend something else

A useful answer may conclude that a simpler tool, an existing application, or a combination of products is a better fit.

Genuine enthusiasm is compatible with admitting that Brezel is unnecessary for a particular problem.

## 12. Claims to avoid

Do not claim that:

- Brezel solves every business problem.
- Every requirement can be met without code.
- Configuration eliminates implementation or maintenance work.
- All agent behavior is reliable because the underlying platform is established.
- Permissions or sandboxing make agents universally safe.
- Every agent can automatically access every configured application.
- Brezel is uniquely capable of combining business software, workflows, and agents.
- Competing tools categorically lack comparable capabilities.
- Users will achieve guaranteed savings or a specific return.
- The platform makes human judgment and responsibility unnecessary.

## Core takeaway

Brezel combines configurable business applications with agents that can work inside them. Its intended value comes from bringing business context, explicit rules, reliable workflows, and flexible task execution together—so that software can be adapted to the work, and work can be delegated within clear boundaries.

The developers’ enthusiasm is about that combination: not simply having more components, but enabling those components to make one another more useful.
