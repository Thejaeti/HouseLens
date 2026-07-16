# Driving-for-Dollars Market Research — July 16, 2026

_Deep-research pass on the real-estate investor lead-gen app market, to inform the HouseLens
consumer-vs-investor-tool direction decision (see `TODO.md` item 2). Every claim below was
adversarially fact-checked by independent verification agents; claims that failed verification
are listed at the bottom. Pricing was verified live against vendor pages on July 16, 2026 —
this market reprices often, so treat numbers as a snapshot._

## The players and their prices

| Product | Entry price | Notes |
|---|---|---|
| **DealMachine** | $119/mo ($99/mo billed annually) | Starter: 1 user, 20K leads. Pro $179/mo, Pro Plus $279/mo. **Unlimited skip tracing (owner phone/email lookup) bundled free in all plans.** Usage fees on top: dialer ~$0.04–0.06/min, postcards ~$0.57+. |
| **PropStream** | $99/mo ($81/mo annually) | Skip tracing is a paid add-on at $0.10–0.12/record — opposite model from DealMachine. |
| **BatchLeads** | (now owned by PropStream) | Acquired July 1, 2025, along with BatchDialer. |

**Market structure:** this niche is consolidating under big corporate parents. PropStream has been
owned by Stewart Information Services (NYSE-listed title insurer) since 2021 ($175M acquisition),
and PropStream's July 2025 purchase of BatchLeads puts two of the three main incumbents under one
public company. A new entrant is competing with public-company-backed products, not indie apps.

## What users actually complain about

The dominant *formal* complaints against DealMachine are not about data — they're about **billing**:
10 of 12 BBB complaints (2023–2025) describe the in-app cancellation flow failing to actually cancel,
followed by surprise renewal charges (one user billed $1,490 after believing they'd cancelled; another
saw their annual price jump from $890 to $1,490 with ~10 days notice). Trustpilot and BiggerPockets
corroborate the pattern. Data-quality gripes exist too (one 2025 review measured ~10% email accuracy,
~80% phone accuracy on DealMachine's bundled skip tracing) but are secondary in formal channels.

**Implication:** transparent, easy-to-cancel billing is a cheap, real differentiator in this market.
The incumbents' worst reputation problem costs nothing to avoid.

## The data supply chain (the part that matters most for us)

- Both incumbents source from the **same public records** — county assessor, recorder, tax rolls —
  plus phone-number aggregators. Neither publishes an accuracy benchmark. **There is no data moat
  at the record level; differentiation is workflow and packaging.**
- A two-person team can buy this data **pay-per-use with no contracts**: property + owner-contact
  API lookups run roughly **$0.10–0.20 per record** (Tracerfy ~$0.10–0.20/hit, charged only on
  successful hits; Skipreach $0.05/lookup; BatchData pay-as-you-go from $0.01/call). At, say,
  $0.15/lookup, a $50/mo subscriber doing 100 lookups costs ~$15 in data — viable margins.
- Nationwide **bulk** licensing exists (ATTOM: 160M+ properties, assessor/deed/foreclosure/mortgage
  data) but is enterprise-priced by negotiation — not a startup's first move. Start per-lookup,
  consider bulk later. (Caveat: small vendors' nationwide-coverage claims are shaky — Tracerfy's
  "150M+ records" claim failed verification. Trial data quality in Zach's county before relying on any vendor.)

## The AR precedent: Homesnap (cautionary, but instructive)

Homesnap was the closest "point at a house" consumer app. Verified history:

- The camera feature **never made consumer money**. The business was B2B: Homesnap Pro was given
  free to agents through 240+ MLS partnerships (1.1M registered agents, per self-reported figures),
  with paid agent upsells ($299–599/yr).
- Exit: **$250M acquisition by CoStar** (end of 2020). CoStar then killed the Homesnap brand
  entirely by late 2023, folding it into Homes.com.

Read: the camera is a customer-acquisition gimmick and demo magnet, not a product people pay for
by itself. Revenue comes from professionals. (Also mildly validating: DealMachine's own core
workflow is camera-based — photograph a distressed property from the car. The interaction model
HouseLens already has is native to this niche.)

## What the research could NOT establish

Being straight about the holes — no claims on these survived fact-checking:

- **Active user counts** for any incumbent, and overall **market size/growth vs saturation**.
- Recent **entrants or shutdowns** in the niche.
- Whether any current investor-tool player uses a **true AR interface** (none surfaced, but absence
  wasn't proven).
- The **underserved-segment analysis** (small landlords vs wholesalers, ideal price points) — this
  one has to come from talking to actual investors, i.e., Zach's network.

So: the pricing, complaint, and data-cost picture is solid; the "is the market growing or saturated"
question remains open and is the biggest unknown in a go/no-go decision.

## Candid synthesis for Jonathan & Zach

**Encouraging:**
1. Data access is genuinely affordable — the assumed hard blocker isn't one.
2. Incumbents have no data moat and a self-inflicted trust problem (billing).
3. There's a visible **price umbrella**: entry pricing starts at ~$99–119/mo, aimed at full-time
   wholesalers. A $29–49/mo tier for small landlords and part-time investors (people like Zach)
   is structurally vacant — though *why* it's vacant is unproven; it may be because those users
   don't convert. That's exactly what the five-investor conversations should probe.
4. The camera/AR angle is a differentiated acquisition hook in a market that already validates
   camera-first workflows.

**Sobering:**
1. Consolidation means well-funded competition with sales teams and data relationships.
2. Nobody has proven investors will pay *for* an AR interface — Homesnap's camera made zero
   consumer revenue. AR is the hook, not the product; owner data + workflow is the product.
3. Market saturation is unquantified. If the niche's growth stalled with the 2023–2026 housing
   market, the incumbents' price war would crush a newcomer's margins.
4. Time-to-revenue is still realistically 6–18 months. Plan B, not income replacement.

**Suggested next probe questions for Zach's investor conversations:**
- "What do you use to find off-market properties today, and what does it cost you?"
- "Have you tried DealMachine/PropStream? Why did you stop / what annoys you?"
- "Would you pay $39/mo for a lighter version that does X?" (watch for polite yes vs reaching-for-wallet yes)
- "How many properties do you actually look up in a month?" (sizes the data cost)

## Refuted claims (do not cite these elsewhere)

Fact-checkers killed five claims, all from SEO comparison blogs that published fabricated or stale
pricing (notably jamilacademy.com and parts of nextautomation.us): DealMachine "$49/mo Starter"
tiers, various skip-trace price tables, and Tracerfy's nationwide-coverage claim. Lesson: never
trust blog-quoted pricing in this space; check vendor pages.

---
_Generated from a 104-agent deep-research workflow (22 sources fetched, 99 claims extracted, 25
top claims verified 3-way, 20 confirmed / 5 refuted). Primary sources: dealmachine.com/pricing,
propstream.com/pricing, propstream.com acquisition announcement, BBB complaint records,
attomdata.com, tracerfy.com, Inman/CoStar press coverage of Homesnap._
