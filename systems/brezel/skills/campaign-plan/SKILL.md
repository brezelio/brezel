---
name: campaign-plan
description: Create a full marketing campaign brief with objectives, audience, messaging, channel strategy, content calendar and success metrics. Use when planning a product launch, lead generation push or awareness campaign, when a week-by-week content calendar with dependencies is needed, or when a marketing goal must be turned into a structured, executable plan.
---
<!-- Based on anthropics/knowledge-work-plugins/marketing/skills/campaign-plan/SKILL.md (commit d900840716eb262e1feb17c6f4406c9ce0e06bcf), licensed under Apache-2.0. Copyright (c) Anthropic, PBC. Modified by Kiwis & Brownies for Brezel, 2026-11: removed slash commands and connector placeholders, use Brezel company context, records and cases/work items, adapted examples to DACH, added notes on UWG §7 and GDPR for outreach. -->

# Campaign Plan

Create a comprehensive marketing campaign brief with objectives, audience, messaging, channel strategy, content calendar, and success metrics.

## Inputs

Start from the company context Brezel provides (company profile / "Ihre Firma"): products, target customers, positioning, tone. Gather the following from the user; if something essential is missing, ask before proceeding:

1. **Campaign goal** — the primary objective (e.g., drive enquiries, increase awareness, launch a product, generate leads, re-engage former customers)
2. **Target audience** — who the campaign is aimed at (roles, industries, regions, pain points, buying stage)
3. **Timeline** — duration and fixed dates (launch date, trade fair, seasonal deadline)
4. **Budget range** — optional; without it, produce a channel-agnostic plan and note where budget allocation would matter
5. **Additional context** (optional): product or service, differentiators, previous campaign results, brand guidelines, geographic focus

Useful evidence from this Brezel system (find it with the entity tools): customer and lead records, past campaign results, enquiries by source. Use them to inform audience and targets.

## Legal Note

The agent works for German/DACH companies. Plan outreach within the local framework: email and phone marketing to individuals generally require prior consent (UWG §7, GDPR/DSGVO), and commercial emails and websites need the legally required provider information (Impressum). Flag channels that depend on consent or purchased contact lists and recommend checking them with the responsible person; do not give legal advice beyond that.

## Campaign Brief Structure

### 1. Campaign Overview
- Campaign name suggestion
- One-sentence summary
- Primary objective with a specific, measurable goal
- Secondary objectives (if applicable)

### 2. Target Audience
- Primary segment with description
- Secondary segment (if applicable)
- Pain points and motivations
- Where they spend time (channels, communities, publications, trade fairs, associations)
- Buying stage alignment (awareness, consideration, decision)

### 3. Key Messages
- Core message (one sentence)
- 3-4 supporting messages tailored to pain points
- Message variations by channel (if different tones are needed)
- Proof points for each message

### 4. Channel Strategy
For each recommended channel:
- Why it fits the audience and objective
- Content format recommendations
- Effort level (low, medium, high)
- Budget allocation suggestion (if budget was provided)

Consider:
- Owned: website, blog, email newsletter, social media profiles
- Earned: PR, partners, guest articles, community, reviews
- Paid: search ads, social ads, display, sponsored content, trade fairs and events

### 5. Content Calendar
Week-by-week (or day-by-day for short campaigns):
- What content to produce each week and for which channel
- Milestones and deadlines
- Dependencies (e.g., "landing page must be live before paid ads launch")

| Week | Content Piece | Channel | Owner/Notes | Status |
|------|--------------|---------|-------------|--------|

### 6. Content Pieces Needed
For every asset: name and type, what it should contain, priority (must-have vs. nice-to-have), suggested creation timeline. The content-creation skill helps draft these.

### 7. Success Metrics
- Primary KPI with target number
- Secondary KPIs (3-5)
- How each metric will be tracked
- Reporting cadence

Base targets on historical performance from Brezel records or exports the user provides, where available.

### 8. Budget Allocation (if budget provided)
- Breakdown by channel or activity
- Production vs. distribution costs
- Contingency (typically 10-15%)

### 9. Risks and Mitigations
2-3 risks (timeline, audience mismatch, channel underperformance, missing consent) with a mitigation for each.

### 10. Next Steps
- Immediate action items to kick off the campaign
- Approvals needed
- Key decision points

## Planning Reference

### Framework: Objective, Audience, Message, Channel, Measure

#### Objective
- **Awareness**: visibility (reach, impressions, share of voice)
- **Consideration**: engagement and education (content engagement, newsletter signups, webinar attendance)
- **Conversion**: leads or sales (enquiries, demos, purchases, pipeline)
- **Retention**: re-engage existing customers (churn reduction, upsell, NPS)
- **Advocacy**: turn customers into promoters (referrals, reviews)

Good objectives are SMART: Specific, Measurable, Achievable, Relevant, Time-bound.

Example: "Generate 60 qualified enquiries from manufacturing companies with 50-250 employees in Baden-Württemberg and Bavaria within 6 weeks of launch."

#### Audience
- **Firmographics/demographics**: role, seniority, company size, industry
- **Psychographics**: motivations, pain points, goals, objections
- **Behaviour**: where they consume content, how they buy
- **Buying stage**: unaware, researching, or ready to buy

Brief audience profile:
> "[Role] at [company type] who is struggling with [pain point] and looking for [desired outcome]. They typically discover solutions through [channels] and care most about [priorities]."

#### Message
- **Core message**: what the audience should think, feel, or do
- **Supporting messages**: 3-4 points that provide evidence, address objections, or elaborate on benefits
- **Proof points**: data, references, testimonials, certifications
- **Differentiation**: why you rather than alternatives (including doing nothing)

Message hierarchy: Why should I care? → What is the solution? → Why you? → What should I do?

#### Channel
Choose channels by where the audience is, not where you are most comfortable.

#### Measure
Define how you will know the campaign worked (see Success Metrics by Campaign Type).

### Channel Selection Guide

#### Owned Channels
| Channel | Best For | Typical Metrics | Effort |
|---------|----------|----------------|--------|
| Website/Blog | SEO, expertise, education | Traffic, time on page, conversions | Medium |
| Email newsletter (with consent) | Nurture, retention, announcements | Open rate, CTR, conversions | Low-Medium |
| Social (organic) | Awareness, community, brand | Engagement, reach, follower growth | Medium |
| Webinars | Education, lead gen, demos | Registrations, attendance, pipeline | High |
| Podcast | Expertise, brand awareness | Downloads, subscriber growth | High |

#### Earned Channels
| Channel | Best For | Typical Metrics | Effort |
|---------|----------|----------------|--------|
| PR/Trade press | Awareness, credibility, launches | Coverage, referral traffic | High |
| Guest content | Audience expansion, SEO | Referral traffic, backlinks | Medium |
| Partners/Associations | Audience expansion, trust | Reach, referral conversions | Medium-High |
| Community | Awareness, trust, feedback | Mentions, engagement | Medium |
| Reviews/Ratings | Credibility, consideration | Review volume, rating | Low-Medium |

#### Paid Channels
| Channel | Best For | Typical Metrics | Effort |
|---------|----------|----------------|--------|
| Search ads | High-intent lead capture | CPC, CTR, conversion rate, CPA | Medium |
| Social ads | Awareness, retargeting, lead gen | CPM, CPC, CTR, CPA, ROAS | Medium |
| Display | Awareness, retargeting | Impressions, CPM | Low-Medium |
| Sponsored content | Expertise, lead gen | Engagement, cost per lead | Medium |
| Trade fairs/Events | Relationships, brand | Leads, meetings, pipeline influenced | High |

Selection criteria: where the audience spends time, targeted buying stage, budget (paid needs spend; owned/earned need time), available assets, and what worked before.

### Content Calendar Creation
1. **Start with milestones**: launch, events, product releases, seasonal moments (also holidays and summer break)
2. **Work backward** from go-live dates using production lead times
3. **Map content to funnel stages**: awareness, consideration, conversion
4. **Batch by theme**: weekly or bi-weekly themes
5. **Balance channels** so the audience sees the campaign across touchpoints
6. **Build in flexibility**: leave ~20% of slots open for reactive content

Cadence guidelines:
- Blog: 1-4 posts per week depending on team size
- Email newsletter: weekly to monthly
- Social media: 3-7 posts per week per platform
- Paid campaigns: continuous during the window, refresh creatives every 2-4 weeks
- Webinars: monthly or quarterly

Production timeline benchmarks:
- Blog post: 3-5 business days
- Email campaign: 2-3 business days
- Social posts: 1-2 business days
- Landing page: 5-7 business days
- Video: 2-4 weeks
- Whitepaper/guide: 2-4 weeks

### Budget Allocation

Common starting framework (adjust to goals and history):

| Category | Share of Budget | Examples |
|----------|---------------------|----------|
| Paid acquisition | 30-40% | Search ads, social ads, display |
| Content production | 20-30% | Articles, video, design, guides |
| Events and sponsorships | 10-20% | Trade fairs, webinars, meetups |
| Tools and technology | 10-15% | Analytics, automation |
| Testing | 5-10% | New channels, A/B tests, pilots |

Principles:
- Put 60-70% of paid budget into the highest-confidence channel
- Reserve 15-20% for testing
- Shift budget monthly based on performance
- Account for production costs, not just media spend
- Keep a 10-15% contingency

### Success Metrics by Campaign Type

**Awareness**: reach/impressions, brand mentions, share of voice, direct traffic, follower growth.

**Lead generation**: total leads, qualified leads, cost per lead, lead-to-qualified conversion rate, pipeline influenced.

**Product launch**: enquiries or trials, activation rate, press coverage, social engagement spike, feature adoption.

**Retention/engagement**: churn rate change, engagement rate, NPS or CSAT change, upsell/cross-sell revenue, feature adoption.

**Event/webinar**: registrations, attendance rate, engagement during the event, post-event conversions, reach of recordings.

## Output

Present the full campaign brief with clear headings. Afterwards, offer to:
- Dive deeper into any section
- Draft specific content pieces from the calendar
- Prepare a competitive analysis to inform the messaging
- Adjust the plan for a different budget or timeline
- Turn the calendar into a case with work items per content piece and milestone (ask before creating them)
