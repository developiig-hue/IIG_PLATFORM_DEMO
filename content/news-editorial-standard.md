# IIG public news — editorial acceptance standard

Applies to all nine sectors and every approved article. Expand existing articles only after checking the original source; never fabricate an interview, quotation, technical parameter, cost, commissioning date, image permission, or manager attribution.

## Required article structure (UA and EN)
1. A specific headline and a substantial 2–3 sentence standfirst identifying company, facility, location, event, publication date and status.
2. Verified project facts: owner, exact site, technology, announced capacity, capex and financing, milestones and schedule. Say explicitly when any field is undisclosed. Differentiate proposed, financed, approved, under construction, commissioned and operating.
3. Project leadership: link to an actual published interview or attributable statement, identify speaker, title, date and source; otherwise state that no project-leader interview was verified. Do not turn a press release into an interview or invent dialogue.
4. Engineering implications: electrical and thermal loads, grid connection, reliability, integration, permitting, EPC interfaces and commissioning where relevant. Distinguish reported facts from general engineering considerations.
5. IIG analysis: concrete, project-specific FEED/EPC due-diligence questions and risks, explicitly labeled analysis rather than company claims.
6. Original source link and separately documented image source, credit and reuse permission; sector photos only as an illustrative fallback.

## Publication gates
- Both language versions must convey the same facts and caveats.
- The canonical source must support every externally attributed claim. Link any additional interviews individually.
- Never describe financing signature as commissioning, an MoU as completed installation, or a target date as achieved.
- Reject filler, unsupported forecasts and invented executive comments.
- Do not mark editorial expansion complete until all nine articles are updated in the actual `content/public-news.json` deployment output and verified on the live site. `content/pharma-news.json` is merged during the Pages build, so update that source for the pharmaceutical story.

## Verified expansion example: Košice, 16 September 2026
Nippon Steel's release confirms approximately €0.9bn investment in an electric arc furnace and air-separation unit; an EU Modernisation Fund grant of up to €350m (€310m EAF and €40m ASU); EAF capacity around 1.6m tonnes annually, planned EAF start in 2030 and ASU start in 2029. The release states the EAF will operate alongside existing blast-furnace facilities. These are announced plans, not commissioned assets. Primary source: https://www.nipponsteel.com/en/newsroom/news/2026/20260916_100.html . The release communicates corporate strategy but does not itself constitute an interview with a project manager.
