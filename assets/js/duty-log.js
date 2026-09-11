/* ==========================================================================
   brendaong.com/duty-log — the decision log.

   Content and behaviour for the Duty Log page. Everything here is data plus
   four render functions; there is no framework and no build step, matching
   the rest of the site.

   Every figure below traces to a published project report (linked in `src`)
   or to a documented posting. Nothing is drawn from non-public material.
   ========================================================================== */
(function () {
  'use strict';

  var WORK = '../work/';

  /* ---------------------------------------------------------------- lanes */
  var LANES = {
    ts: {
      name: 'Trust &amp; Safety',
      plain: 'Trust & Safety',
      deskTitle: 'Trust &amp; Safety: four live situations',
      blurb: 'Enforcement is a system you can design and tune, not a thing you staff up and hope about. These four are the tuning decisions that are easiest to get backwards.',
      fitLede: 'The lane needs someone who has run a real enforcement operation <em>and</em> can measure a model — and who has been the person accountable when a decision goes wrong in public.',
      fit: [
        { h: 'What the role runs on', items: [
          '<b>Queue design under load.</b> Severity thresholds, routing, shift coverage, SLA commitments and appeal volume that all interact.',
          '<b>Measurement that survives scrutiny.</b> Evals whose numbers can be checked, including the ones that embarrass the hypothesis.',
          '<b>Escalation under time pressure</b>, with a named decision-maker and a defensible threshold.'
        ]},
        { h: 'What is on the record', items: [
          'Ran operations for a <b>1,500-officer police division</b>; commanded <b>30+</b> security operations including the F1 race and national events, with red-teaming against foreign agencies.',
          'Stood up a <b>counterterrorism response team</b> whose model was adopted across other police divisions.',
          '<b>Crisis Negotiation Unit, Deputy Team Leader</b>, 2017–2023 — threat-to-life escalations, structured de-escalation, behavioural risk assessment.',
          'Reviewed cybercrime investigations and policy; held <b>85%+ case solvability</b> as an investigation officer.'
        ]},
        { h: 'Where to check it', items: [
          '<b>Enforcement Operations Simulator</b> — a discrete-event model of a review queue, ~4,100 lines of Python, 82 tests asserting the direction of every headline finding.',
          '<b>Policy-to-Eval Harness</b> — 400 borderline prompts, 2,000 scored responses, five open-weight models.',
          '<b>Multilingual Enforcement Consistency</b> and <b>Distress-Conversation Safety Eval</b> — the two failure modes an English, single-turn eval cannot see.'
        ]}
      ],
      scenarios: [
        {
          sev: 'P2', tag: 'Enforcement operations',
          brief: 'Your human-review operation posts <b>98.6% aggregate SLA attainment</b>. Leadership is pleased. Underneath it, low-severity work is <b>88% of volume</b> and always clears its target — while P1 attainment sits at <b>93.1% against a 95% commitment</b>. You have budget for one intervention.',
          ask: 'Where do you spend it?',
          opts: [
            { t: 'Add reviewers until P1 has headroom.', v: 'costly', n: 'Buys the outcome at permanent cost — and the shortfall is not capacity-shaped.' },
            { t: 'Reshape shift coverage against the actual arrival curve.', v: 'match', n: 'The free lever, and the one nobody had priced.' },
            { t: 'Raise the classifier threshold so fewer items enter the P1 queue.', v: 'costly', n: 'The threshold trades precision against recall. It is not an SLA lever.' }
          ],
          head: 'Coverage shape was free. Headcount was not.',
          body: [
            'Reshaping coverage recovered <b>1.4 of the 1.9 points</b> the operation was short on P1, at zero additional headcount. The classifier threshold moved precision and recall as expected and moved P1 attainment almost not at all — and the 15-minute P0 SLA was never met under any configuration tested, which is a commitment problem rather than a staffing one.',
            'The deeper finding is about the number everyone was watching: <b>an aggregate SLA figure is structurally incapable of showing a severity failure.</b> At 88% low-severity volume, the good news drowns the bad.'
          ],
          src: [{ l: 'Enforcement Operations Simulator — findings 1, 3 and 5', h: WORK + 'enforcement-ops-simulator.html' }]
        },
        {
          sev: 'P2', tag: 'Quality assurance',
          brief: 'A single reviewer’s decisions have started drifting from policy. You do not yet know which reviewer. The drift signal lives in roughly <b>6% of volume</b>, and your QA sampling budget is fixed.',
          ask: 'How do you catch it inside a week?',
          opts: [
            { t: 'Audit one decision in two, uniformly across the queue.', v: 'costly', n: 'Enormous cost, and still only 22% power within a week.' },
            { t: 'Stratify the sample against severity and reviewer, and hold it at 5%.', v: 'match', n: '94% power, 3-day median detection lag.' },
            { t: 'Require a second reviewer on every high-severity decision.', v: 'close', n: 'Reduces the harm. Does not detect the drift.' }
          ],
          head: 'Uniform sampling cannot do this at any affordable rate.',
          body: [
            'Auditing <b>one decision in two</b>, uniformly, reaches only <b>22% power</b> to catch single-reviewer drift within a week. A stratified design at <b>5% sampling</b> reaches <b>94% power with a 3-day median lag</b> — a tenth of the audit volume and four times the detection.',
            'The reason is arithmetic rather than diligence: the signal lives in about 6% of volume, and pooling dilutes it faster than it accumulates. A QA programme can be large, expensive and blind at the same time.'
          ],
          src: [{ l: 'Enforcement Operations Simulator — finding 4', h: WORK + 'enforcement-ops-simulator.html' }]
        },
        {
          sev: 'P1', tag: 'Model evaluation',
          brief: 'A model is up for release. On your safety eval it refuses <b>100% of policy-prohibited requests</b> and the over-refusal rate is acceptable. The eval is in English. Your users are not.',
          ask: 'Do you ship?',
          opts: [
            { t: 'Ship. The eval is clean and the bar was agreed in advance.', v: 'costly', n: 'The bar was agreed against a benchmark that is structurally blind.' },
            { t: 'Hold, and re-run the identical prompts in the languages your users actually write in.', v: 'match', n: 'Same policy, same prompts, one variable changed.' },
            { t: 'Ship with a multilingual monitoring plan attached.', v: 'close', n: 'Better than nothing — but you are now detecting harm in production instead of before it.' }
          ],
          head: 'Safety that holds in English does not always survive translation.',
          body: [
            'Running one policy taxonomy across English, Chinese, French, Singlish and Singapore Mandarin: three of four models leaked <b>0% in English</b> and materially more outside it, with the worst arm reaching <b>27% leakage on the same prohibited request</b>.',
            'The result an English number hides best is the guarded small model: it refuses hard in English (<b>26.7% over-refusal</b>) — the profile that scores &ldquo;safe&rdquo; on an English benchmark — while being simultaneously more permissive and less usable everywhere else. A single-language benchmark cannot see either half of that.'
          ],
          src: [
            { l: 'Multilingual Enforcement Consistency', h: WORK + 'multilingual-enforcement-consistency.html' },
            { l: 'Policy-to-Eval Harness (upstream taxonomy)', h: WORK + 'policy-to-eval-harness.html' }
          ]
        },
        {
          sev: 'P1', tag: 'Conversational safety',
          brief: 'A support system refuses correctly on turn one of a conversation with a distressed user. Your safety eval is single-turn, and it passes. The conversation, in production, runs to ten turns.',
          ask: 'What do you measure before shipping?',
          opts: [
            { t: 'The turn-one refusal rate, held to a high bar across more scenarios.', v: 'costly', n: 'More of the measurement that is already blind to the failure.' },
            { t: 'Whether the position holds across the whole conversation — scored per turn, with the drift rate reported.', v: 'match', n: 'Hold rate, turns to first failure, drift slope, deflection index.' },
            { t: 'Human review of a sample of production transcripts after launch.', v: 'close', n: 'Finds it eventually, on real users, after the fact.' }
          ],
          head: 'A system that refuses correctly on turn one can concede on turn nine.',
          body: [
            'Seven scenarios × ten turns × eight criteria, scored per turn with evidence spans and aggregated into multi-turn metrics. The spread between systems is the point: hold rates ran from <b>100% down to 61%</b>, and the two mid-scoring systems had <b>drift slopes of −1.37 and −1.51 per turn</b> — degradation that no turn-one measurement can see.',
            'Score and gate are deliberately reported separately, and neither can be quoted alone: a system scoring <b>88</b> still failed its gate on <b>16 critical failures</b>. Criteria were operationalised from Samaritans media guidelines, WHO guidance and NICE NG225 rather than invented.'
          ],
          src: [{ l: 'Distress-Conversation Safety Eval', h: WORK + 'distress-conversation-safety-eval.html' }]
        }
      ]
    },

    pc: {
      name: 'Policy &amp; Comms',
      plain: 'Policy & Comms',
      deskTitle: 'Policy &amp; Comms: four live situations',
      blurb: 'Two of these were fronted as an official government spokesperson. The other two are what happens when your own research finds something inconvenient — including about somebody else’s product.',
      fitLede: 'The lane needs somebody who has stood at the podium during a live crisis, and who can also read a regulation, build the obligation register, and write the memo that survives a general counsel.',
      fit: [
        { h: 'What the role runs on', items: [
          '<b>Speaking on the record</b> when the facts are partial and the deadline is not negotiable.',
          '<b>Counter-messaging against coordinated falsehood</b> without amplifying it.',
          '<b>Regulatory horizon-scanning</b> that turns statute into obligations somebody owns, before the deadline is inside 180 days.'
        ]},
        { h: 'What is on the record', items: [
          '<b>Official Police spokesperson</b> and Assistant Director, Public Communications. Approved <b>1,000+ news releases</b> and <b>1,600 media lines</b> a year; led <b>25+ major press conferences</b>; prepared senior leadership to front media.',
          'Programme Manager for the <b>Police Communications Masterplan</b> — reputation building, narrative-shaping campaigns and a counter-disinformation framework, alongside a <b>96% public trust rating</b>.',
          'Countered <b>20+</b> fake-news and smear campaigns against public institutions; ran inter-government crisis communications cells; briefs amplified <b>3&times;</b> through advocates.',
          'Contributed to the AI ethics work behind Singapore’s <b>Advisory Council on the Ethical Use of AI and Data</b> (2018) and the governance framework that followed. Horizon-scanning and scenario planning at <b>INTERPOL</b>.'
        ]},
        { h: 'Where to check it', items: [
          '<b>Crisis Comms War-Game</b> — a playbook published alongside the adversarial simulator built to attack it, with the scores attached.',
          '<b>APAC Regulatory Readiness</b> — a maintained tracker across ten jurisdictions, plus the response workflow and readiness framework built on top of it.',
          '<b>Regulatory Horizon Scanner</b> — seven jurisdictions, a 137-obligation machine-readable register, and a citation critic scored by code rather than a model.'
        ]}
      ],
      scenarios: [
        {
          sev: 'P1', tag: 'Incident communications',
          brief: 'An AI safety incident is public. You have partial facts, an internal investigation that will not close today, a journalist with a 90-minute deadline, and a regulator reading whatever you publish.',
          ask: 'What is your posture in hour one?',
          opts: [
            { t: 'Move first. Publish what you have and own the narrative.', v: 'costly', n: 'Scored 59.2. Speed buys the first cycle and pays for it in every later one.' },
            { t: 'Say nothing on the record until the investigation closes.', v: 'costly', n: 'Scored 62.8. Silence is read as an answer.' },
            { t: 'Confirm the scope you can stand behind, name explicitly what you do not yet know, and commit to a next update time.', v: 'match', n: 'Scored 89.3 mean composite across twelve runs.' }
          ],
          head: 'Playbook discipline outscored both instincts, and not narrowly.',
          body: [
            'Four incidents × three postures, scored on one rubric across <b>twelve reproducible runs</b>, with four adversary agents — a journalist, a regulator, a researcher and a customer — that react to what you actually said rather than following a script. Playbook-disciplined posture averaged <b>89.3</b>, against <b>62.8</b> for stonewalling and <b>59.2</b> for speed-first.',
            'The mechanism matters more than the score: <b>dodging a question escalates the next one.</b> Speed-first loses because provisional facts get revised in public; stonewalling loses because the vacuum gets filled. Committing to a next update time is what buys the room to be accurate.'
          ],
          src: [{ l: 'Crisis Comms War-Game', h: WORK + 'crisis-comms-wargame.html' }]
        },
        {
          sev: 'P1', tag: 'Information integrity',
          brief: 'A coordinated falsehood about a public institution is spreading fast and being picked up by mainstream outlets. You are the official spokesperson. Whatever you do next is itself a news event.',
          ask: 'How do you counter it?',
          opts: [
            { t: 'Rebut the claim directly and publicly, point by point.', v: 'close', n: 'Corrects the record and hands the falsehood a larger audience.' },
            { t: 'Seed the accurate frame through trusted third parties first, then correct on the record.', v: 'match', n: 'The counter-narrative arrives before the rebuttal does.' },
            { t: 'Do not engage. Most of these burn out.', v: 'costly', n: 'The ones that do not burn out are the ones that define the institution.' }
          ],
          head: 'Counter-narrative first. Rebuttal second, and smaller.',
          body: [
            'Across <b>20+</b> fake-news incidents, misinformation waves and smear campaigns against public institutions, the operating pattern was to establish the accurate frame through advocates and social networks — briefs amplified at least <b>3&times;</b> beyond official channels — and only then correct on the record, so the correction lands in a context that already exists.',
            'This ran out of a standing media operations room monitoring for emerging misinformation continuously, rather than a team assembled once a story broke. The Police Communications Masterplan built that capability deliberately; the public trust rating over the period held at <b>96%</b>.'
          ],
          src: [
            { l: 'Assistant Director, Public Communications Division — Singapore Police Force', h: '' },
            { l: 'Crisis Comms War-Game (the same pattern, tested adversarially)', h: WORK + 'crisis-comms-wargame.html' }
          ]
        },
        {
          sev: 'P2', tag: 'Regulatory affairs',
          brief: 'Your team generates regulatory impact memos across seven jurisdictions. One memo cites a compliance deadline confidently. A later amending bill moved that date. The memo is going to a general counsel.',
          ask: 'What do you build?',
          opts: [
            { t: 'Human review of every memo, end to end, before it leaves.', v: 'close', n: 'Correct and unscalable — and reviewers miss moved dates too.' },
            { t: 'A critic that checks each claim against its cited source, scored in deterministic code.', v: 'match', n: 'Ungrounded claims fell 30.5% → 9.3% pooled.' },
            { t: 'Use a stronger model and raise the prompt’s accuracy requirements.', v: 'costly', n: 'Every model tested produced ungrounded citations at a similar rate.' }
          ],
          head: 'A verification loop cut ungrounded citations by two-thirds — and mapped where it still fails.',
          body: [
            'Across four models, ungrounded citation claims fell from <b>30.5%</b> to <b>9.3%</b> pooled, while <b>95.8% of claims survived</b> — the critic removes errors rather than deleting content. It is deterministic code rather than a language model precisely so a general counsel can audit the scoring.',
            'It does not fix everything, and the report says so. On the EU Omnibus case — a deferral touching many obligations at once — it went <b>29% to 26%</b>, effectively no improvement. Publishing the cases where verification fails is what makes the cases where it works usable.'
          ],
          src: [
            { l: 'Regulatory Horizon Scanner + Obligation Register', h: 'https://github.com/bibiong' },
            { l: 'APAC Regulatory Readiness — ten-jurisdiction tracker', h: WORK + 'apac-regulatory-readiness.html' }
          ]
        },
        {
          sev: 'P1', tag: 'Disclosure',
          brief: 'Your own evaluation finds that one named vendor’s model gives a substantive answer to <b>47.4%</b> of policy-prohibited requests — far outside the others tested. The write-up is ready to publish, and the finding is solid.',
          ask: 'How do you publish it?',
          opts: [
            { t: 'Publish now. It is public-interest research on a public model.', v: 'costly', n: 'Defensible — and it burns the relationship you need next time.' },
            { t: 'Notify the vendor with a disclosure window, then publish with the number unchanged.', v: 'match', n: 'What was actually done: seven days, finding intact.' },
            { t: 'Publish the aggregate and anonymise the vendor.', v: 'close', n: 'Protects the vendor and removes the finding’s only actionable content.' }
          ],
          head: 'Seven days’ notice. Number unchanged.',
          body: [
            'The finding was shared with Mistral on <b>2026-08-17</b>, seven days ahead of publication, and published with the figure intact. Responsible disclosure is not a softer finding; it is the same finding, delivered in an order that lets the other side act.',
            'The same project’s headline result inverted its own premise, which is the harder discipline. It was built to measure <b>over-refusal</b> — and found <b>leakage was 1.8&times; larger</b>: 14.2% of prohibited requests answered against 7.7% of permitted requests refused. Reported as found, with both numbers in the same table, because either one alone is misleading.'
          ],
          src: [{ l: 'Policy-to-Eval Harness — 400 prompts, 2,000 scored responses', h: WORK + 'policy-to-eval-harness.html' }]
        }
      ]
    },

    cos: {
      name: 'Chief of Staff',
      plain: 'Chief of Staff',
      deskTitle: 'Chief of Staff: four live situations',
      blurb: 'Operating models built from zero, and the two things that decide whether they survive: who owns the decision, and whether the thing outlives the person who wrote it.',
      fitLede: 'The lane needs somebody who builds the operating system rather than the deck — and who has been the calm one in the room when the decision could not wait for more information.',
      fit: [
        { h: 'What the role runs on', items: [
          '<b>Operating models from zero</b> — owners, decision protocols, escalation paths, monitoring cadence, and a handover that holds.',
          '<b>Programme management without authority</b>, across teams that do not report to you and do not agree.',
          '<b>Executive judgment under incomplete information</b>, at a speed the situation sets rather than one you choose.'
        ]},
        { h: 'What is on the record', items: [
          '<b>Principal Scientist, Disruptive Technologies Office (HTX)</b> — built the operating concept and launch-readiness plan for a new national space-technology capability, and the Home Team Space Technology Roadmap behind it.',
          '<b>Programme Manager</b> for a ten-year joint Operations–Investigations–Intelligence technology masterplan: <b>42.9%</b> reduction in duplicative systems, and the waterfall-to-agile shift that made it deliverable.',
          '<b>COO &amp; CMO of a pre-seed biotech</b> — the entire back office across five workstreams, with <b>~10 hours/week (66.7%)</b> of manual consolidation automated away.',
          '<b>Commanding Officer, 88 officers</b>: five major offence categories down <b>30%</b>, urgent-call response under 15 minutes over <b>90%</b> of the time. Top-5 Neighbourhood Police Centre nationally.',
          'Set up a first-of-its-kind divisional <b>Women’s Committee</b>, later adopted force-wide. Board member, POLWEL Co-operative.'
        ]},
        { h: 'Where to check it', items: [
          '<b>Enforcement Operations Simulator</b> — ships the written operating model (severity matrix, decision tree, escalation paths, calibration cadence, AAR template) next to the simulation that tests it.',
          '<b>AI Incident After-Action Library</b> — twelve reviews in the format an operational incident-response function actually uses, with 66 corrective actions and named owners.',
          '<b>MIT Sloan Fellows MBA</b> (4.9/5.0), MA Security Studies at Georgetown, BA Cambridge. Concurrent MSc in Artificial Intelligence at NUS.'
        ]}
      ],
      scenarios: [
        {
          sev: 'P3', tag: 'Programme management',
          brief: 'Operations, Investigations and Intelligence each run their own technology stack, their own roadmap and their own budget. You have a ten-year mandate to integrate them and <b>no authority over any of the three</b>.',
          ask: 'What is your first move?',
          opts: [
            { t: 'Mandate a single platform from the centre and hold the line.', v: 'costly', n: 'You do not have the authority, and the compliance you get is nominal.' },
            { t: 'Build the masterplan around eliminating duplication — and win the delivery method before the architecture.', v: 'match', n: '42.9% duplication removed. The method fight was the real one.' },
            { t: 'Let each unit modernise on its own roadmap and integrate at the seams.', v: 'costly', n: 'Ten years later you own three modern silos.' }
          ],
          head: 'The architecture was the easy argument. The method was the hard one.',
          body: [
            'The joint masterplan achieved a <b>42.9% reduction in duplicative systems and programmes</b> across the force, on a ten-year planning horizon. Duplication was the frame that made integration a saving rather than a loss of control — each unit could see what it got back.',
            'The decisive win was quieter: <b>persuading technical teams to move from waterfall to agile.</b> A ten-year plan delivered in waterfall is a ten-year plan that is wrong by year three. Changing how it shipped is what made the plan survivable at all. The same period centralised emergency call centres into a single Ops Command.'
          ],
          src: [{ l: 'Operations Officer, Future Operations Division — Singapore Police Force', h: '' }]
        },
        {
          sev: 'P2', tag: 'Operating model',
          brief: 'A pre-seed company with five cross-cutting workstreams — product, customer, data, fulfilment, regulatory risk and vendors. Everyone is busy, leadership has no visibility into blockers, and nobody can say who decides what.',
          ask: 'What do you build first?',
          opts: [
            { t: 'Hire an operations manager to own the coordination.', v: 'costly', n: 'Adds a person to an undefined system. The ambiguity survives them.' },
            { t: 'Write the decision protocol and automate the reporting before adding anyone.', v: 'match', n: '~10 hours/week recovered — 66.7% of the consolidation load.' },
            { t: 'Institute a weekly all-hands to sync the workstreams.', v: 'close', n: 'Creates visibility once a week and consumes everyone to get it.' }
          ],
          head: 'Owners and protocols first. Then automate the reporting. Then, maybe, hire.',
          body: [
            'The pre-launch operating model named owners, decision protocols, escalation handling, documentation standards and the roadmap from prototype to launch readiness — across product, customer, data, fulfilment, regulatory-risk and vendor workflows.',
            'Automating weekly reporting and task tracking on top of that removed roughly <b>10 hours a week</b> of manual consolidation, a <b>66.7% reduction</b>, and gave leadership standing visibility into risks and blockers across all five workstreams. The order matters: automating an undefined process just produces faster ambiguity.'
          ],
          src: [{ l: 'COO &amp; CMO, LymeAlert (co-founder, pre-seed)', h: '' }]
        },
        {
          sev: 'P2', tag: 'Handover',
          brief: 'A new space-technology capability for frontline agencies is ready to move from trial to operations. Your team built it, knows every failure mode, and is the only group that can currently run it. It cannot stay with you.',
          ask: 'What does the handover consist of?',
          opts: [
            { t: 'Keep running it from the innovation office until the capability matures.', v: 'costly', n: 'It never matures — it just becomes yours permanently.' },
            { t: 'Define the operating concept — roles, data requirements, monitoring expectations, escalation protocols — and transition it to durable ownership.', v: 'match', n: 'Built specifically so the capability outlives the team.' },
            { t: 'Hand it over with thorough documentation and stay available for questions.', v: 'close', n: 'Documentation is not ownership. The escalation path is.' }
          ],
          head: 'A handover is an operating concept, not a document dump.',
          body: [
            'The launch-readiness plan defined stakeholder roles, data requirements, monitoring expectations and escalation protocols explicitly so the capability could <b>transition to durable ownership</b> — the difference between a successful trial and a capability still running in three years.',
            'The same translation problem sits underneath the whole posting: turning ambiguous public-safety needs into evaluation criteria, trial plans, deployment protocols, monitoring cadences and adoption safeguards for emerging AI, quantum and space technology — written alongside researchers and engineers as requirements, not as strategy slides.'
          ],
          src: [{ l: 'Principal Scientist, Disruptive Technologies Office — HTX', h: '' }]
        },
        {
          sev: 'P0', tag: 'Crisis negotiation',
          brief: 'A threat-to-life incident, in progress. A vulnerable and potentially dangerous person at one end. A frontline commander who needs an intervention decision from you. The information is incomplete, contradictory, and changing every few minutes.',
          ask: 'What do you give the commander?',
          opts: [
            { t: 'More time. Hold position until the picture is clearer.', v: 'costly', n: 'Sometimes right. Assumed as a default, it is how people die.' },
            { t: 'Structured de-escalation, a behavioural risk assessment against thresholds agreed beforehand, and intervention options with their costs.', v: 'match', n: 'The threshold was set before the incident. That is what makes the call defensible during it.' },
            { t: 'The fastest tactical option that resolves the situation.', v: 'costly', n: 'Resolves this incident and sets a precedent for the next twenty.' }
          ],
          head: 'The thresholds are agreed before the incident, so the call can be fast inside one.',
          body: [
            'Deputy Team Leader, <b>Crisis Negotiation Unit, Singapore Police Force, 2017–2023</b> — a selected specialist negotiator deploying to life-safety incidents alongside every primary posting held since. The work is converting fast-moving, sensitive signals into actionable options across operations, investigations, intelligence, emergency responders and command, and documenting what was learned so the next escalation goes better.',
            'This is the origin of everything in the other three cards. <b>Every escalation path, severity matrix and decision threshold</b> written into an operating model since comes from the same premise: judgment under pressure is a function of how much was decided in advance.'
          ],
          src: [
            { l: 'Deputy Team Leader, Crisis Negotiation Unit — Singapore Police Force', h: '' },
            { l: 'Commendation Medal (COVID-19), Prime Minister’s Office, Singapore', h: '' }
          ]
        }
      ]
    }
  };

  /* ------------------------------------------------------------- timeline */
  var TIMELINE = [
    { yr: '2008', role: 'Journalist (Intern)', org: 'The Straits Times, Money desk', lanes: ['pc'],
      sub: 'Singapore Press Holdings · Jan–Jun 2008',
      pts: [
        'Financial news beat for the national daily; <b>50+ articles published</b> during the internship.',
        'The other side of the podium — useful later, when the job was standing at it.'
      ]},
    { yr: '2013', role: 'Investigation Officer', org: 'Central Police Division, SPF', lanes: ['ts'],
      sub: 'Singapore Police Force · Jun 2013 – Jun 2014',
      pts: [
        '<b>20+ investigations closed per month</b> on average, case solvability held above <b>85%</b>.',
        'Reviewed cybercrime investigations and policy; streamlined exhibit and case-file management across the division.'
      ]},
    { yr: '2014', role: 'Executive, Strategic Planning', org: 'INTERPOL General Secretariat, Lyon', lanes: ['pc', 'cos'],
      sub: 'INTERPOL · Jun 2014 – Jan 2015',
      pts: [
        'Produced INTERPOL’s <b>Environmental Scan</b> series — horizon scanning for the operational challenges facing law enforcement 5–10 years out.',
        'Prioritised strategic projects, allocated budget and monitored progress across all INTERPOL initiatives.',
        'Rewrote the <b>Enterprise Risk Management Policy</b> and drafted the SOPs for reporting and monitoring risk.',
        'Staffed the Secretary-General for missions through mission briefs.'
      ]},
    { yr: '2015', role: 'Operations Officer, Future Operations', org: 'Operations Department, SPF', lanes: ['cos', 'ts'],
      sub: 'Singapore Police Force · Jan 2015 – Jan 2018',
      pts: [
        'Started a <b>skunkworks unit</b> for futures and technology-policy planning inside a police force.',
        'Programme Manager, ten-year joint Ops–Investigations–Intelligence technology masterplan: <b>42.9% reduction in duplicative systems</b>, and the shift from waterfall to agile.',
        'Programme Manager for centralising emergency call centres into a single Ops Command.',
        'Product Manager for police <b>UAV</b> deployment, and for a wearable command-and-control system giving the command post live situational awareness.',
        '<b>Six proof-of-concept trials</b> with IoT devices, patrol robots and chatbots; three adopted for frontline use.',
        'Wrote cyber-security and data-security policy for the National Digital Identity project with the Cyber Security Agency of Singapore.'
      ]},
    { yr: '2017', role: 'Deputy Team Leader, Crisis Negotiation Unit', org: 'Concurrent specialist posting, SPF', lanes: ['cos', 'ts', 'pc'],
      sub: 'Singapore Police Force · Jul 2017 – May 2023',
      pts: [
        'Selected specialist negotiator deploying to <b>high-stakes, life-safety incidents</b> alongside every primary posting since.',
        'Structured de-escalation, behavioural risk assessment and pre-agreed decision thresholds, supporting frontline commanders on intervention pathways.',
        'Coordinates across operations, investigations, intelligence, emergency responders and leadership; documents lessons learned into future escalation handling.'
      ]},
    { yr: '2018', role: 'Commanding Officer', org: 'Bukit Panjang NPC, Jurong Division', lanes: ['cos', 'ts'],
      sub: 'Singapore Police Force · Jan 2018 – Aug 2019',
      pts: [
        'Commanded <b>88 officers</b> across operations, manpower, logistics and stakeholder relations.',
        'Five major offence categories down <b>30%</b> across 2018–2019; urgent-call response under 15 minutes over <b>90%</b> of the time, funded by a data-driven resourcing argument to senior management.',
        'Named one of the <b>Top 5 Neighbourhood Police Centres</b> in Singapore, 2018–2019.',
        'Worked on the interdisciplinary AI ethics paper behind Singapore’s <b>Advisory Council on the Ethical Use of AI and Data</b> (Dec 2018) and the governance framework that followed.',
        'Set up a first-of-its-kind divisional <b>Women’s Committee</b>, later adopted across the force.'
      ]},
    { yr: '2019', role: 'Head Operations', org: 'Tanglin Police Division, SPF', lanes: ['ts', 'cos'],
      sub: 'Singapore Police Force · Aug 2019 – Feb 2021',
      pts: [
        'Ran all operational and policy matters — deployment, resourcing and command — for a division of about <b>1,500 officers</b>.',
        'Planned and commanded <b>30+ security operations</b> including the F1 race and national-level events, with red-teaming and joint exercises alongside foreign security agencies.',
        'Stood up a <b>counterterrorism response team</b>; the model was later adopted across other police divisions.',
        'Initiated emergency-call data analysis to redirect frontline deployment during COVID-19 operations.',
        'Built contingency-planning partnerships with embassies, shopping belts, nightlife operators and educational institutions.'
      ]},
    { yr: '2021', role: 'Assistant Director, Public Communications', org: 'Public Affairs Department, SPF', lanes: ['pc'],
      sub: 'Singapore Police Force · Feb 2021 – May 2023',
      pts: [
        '<b>Official Police spokesperson.</b> Led strategic communications, media relations, crisis communications and digital strategy for the force.',
        'Approved <b>1,000+ news releases</b>, <b>1,600 media lines</b> and 90 proactive features annually; led <b>25+ major press conferences</b> and prepared senior management to front media.',
        'Programme Manager, <b>Police Communications Masterplan</b> — social reputation building, narrative-shaping campaigns and a counter-disinformation framework; public trust rating <b>96%</b>.',
        'Commanded the standing media operations room; planned and executed counter-narratives to <b>20+</b> misinformation and smear campaigns; led inter-government crisis communications cells.',
        'Mentored and supervised <b>20+ media officers</b>, including career development.'
      ]},
    { yr: '2023', role: 'Co-founder, COO & CMO', org: 'LymeAlert, Boston', lanes: ['cos'],
      sub: 'Pre-seed biotech · Jun 2023 – Jul 2025',
      pts: [
        'Co-founded a company building an accessible home test for the bacteria behind Lyme disease.',
        'Built the entire pre-launch operating model — owners, decision protocols, escalation handling, documentation and roadmap — across five cross-cutting workstreams.',
        'Automated reporting and task tracking: <b>~10 hours/week</b> of manual consolidation removed, a <b>66.7% reduction</b>.',
        'Led app and data-product development including hotspot mapping and computer-vision test reading; owned go-to-market, business development and financials.'
      ]},
    { yr: '2023', role: 'MBA, Sloan Fellows', org: 'MIT Sloan School of Management', lanes: ['cos', 'ts', 'pc'],
      sub: 'ASEAN Fellowship · GPA 4.9/5.0',
      pts: [
        'Coursework in deep learning and generative AI alongside the general management core.',
        'Concurrent <b>MSc in Artificial Intelligence</b> at the National University of Singapore.',
        'Earlier: <b>MA Security Studies</b>, Georgetown School of Foreign Service (3.89, Outstanding Academic Achievement); <b>BA Hons Politics, Psychology and Sociology</b>, University of Cambridge (First Class, Kerslake Scholar).'
      ]},
    { yr: '2025', role: 'Principal Scientist, Disruptive Technologies', org: 'HTX, Singapore', lanes: ['ts', 'cos', 'pc'],
      sub: 'Home Team Science & Technology Agency · Jul 2025 – present',
      pts: [
        'Leads emerging public-safety technology programmes across industry, frontline agencies, academia and technical teams.',
        'Built the <b>Home Team Space Technology Roadmap</b>, and the operating concept and launch-readiness plan for a new frontline space capability — designed to transition to durable ownership.',
        'Translates public-safety risk into <b>evaluation criteria, trial plans, deployment protocols, monitoring cadences and escalation paths</b> for emerging AI, quantum and space technology.',
        'Writes product, technical and data requirements with researchers and engineers; reasons through data flows, system ownership and failure modes.',
        'Prototyped AI-assisted workflows on open-source data, including public-sentiment forecasting for policy announcements and an <b>LLM personality-drift dashboard</b> measuring steering under adversarial interaction.'
      ]}
  ];

  /* ---------------------------------------------------------------- proof */
  var PROOF = [
    { n: '01', t: 'AI Misuse Threat Intelligence Atlas', lanes: ['ts', 'pc'],
      find: 'The most converged technique in the public record of AI misuse is <b>translation</b> — and MITRE ATLAS has no technique for it.',
      meta: '55 operations · 252 technique instances · 25% ATLAS coverage',
      href: WORK + 'ai-misuse-atlas.html' },
    { n: '02', t: 'AI Incident After-Action Library', lanes: ['ts', 'cos'],
      find: 'In <b>11 of 12</b> incidents the failure was first surfaced by someone outside the organisation that built the system. Not undetectable — unwatched.',
      meta: '12 reviews · 51 sources · 66 corrective actions',
      href: WORK + 'ai-incident-aar-library.html' },
    { n: '03', t: 'Policy-to-Eval Harness', lanes: ['ts', 'pc'],
      find: 'Leakage beat over-refusal by <b>1.8&times;</b> — inverting the premise the project was built on. Both numbers reported in the same table.',
      meta: '400 prompts · 2,000 scored responses · 5 models',
      href: WORK + 'policy-to-eval-harness.html' },
    { n: '04', t: 'Enforcement Operations Simulator', lanes: ['ts', 'cos'],
      find: 'An operation posts <b>98.6%</b> aggregate SLA attainment while missing its P1 commitment outright. The aggregate cannot show you the failure.',
      meta: '~4,100 lines Python · 82 tests · 7 reports',
      href: WORK + 'enforcement-ops-simulator.html' },
    { n: '05', t: 'Crisis Comms War-Game', lanes: ['pc', 'cos'],
      find: 'Playbook discipline scored <b>89.3</b> against 62.8 for stonewalling and 59.2 for speed-first — with adversary agents reacting to what you actually said.',
      meta: '4 incidents · 3 postures · 12 reproducible runs',
      href: WORK + 'crisis-comms-wargame.html' },
    { n: '06', t: 'Multilingual Enforcement Consistency', lanes: ['ts', 'pc'],
      find: 'Three of four models leak <b>0% in English</b> and up to <b>27%</b> outside it, on the same prohibited request.',
      meta: 'EN · ZH · FR · Singlish · SG-Mandarin',
      href: WORK + 'multilingual-enforcement-consistency.html' },
    { n: '07', t: 'Distress-Conversation Safety Eval', lanes: ['ts', 'pc'],
      find: 'The failure single-turn evaluation structurally cannot see: a system that refuses correctly on turn one and <b>concedes on turn nine</b>.',
      meta: '7 scenarios × 10 turns × 8 criteria',
      href: WORK + 'distress-conversation-safety-eval.html' },
    { n: '08', t: 'APAC Regulatory Readiness', lanes: ['pc', 'cos'],
      find: 'A maintained tracker across ten jurisdictions — plus the response workflow, the measured AI toolkit and the readiness framework built on top of it.',
      meta: '10 jurisdictions · live tracker',
      href: WORK + 'apac-regulatory-readiness.html' }
  ];

  /* ---------------------------------------------------------------- state */
  var lane = 'ts', idx = 0, picks = [], tlIdx = 4;
  function $(id) { return document.getElementById(id); }
  function link(r) {
    return r.h
      ? '<a href="' + r.h + '"' + (/^https?:/.test(r.h) ? ' target="_blank" rel="noopener"' : '') + '>' + r.l + '</a>'
      : '<span class="dl-noref">' + r.l + '</span>';
  }

  /* -------------------------------------------------------------- render */
  function renderScenario() {
    var L = LANES[lane], s = L.scenarios[idx], pick = picks[idx];

    var sev = $('dl-sev');
    sev.textContent = s.sev;
    sev.className = 'dl-sev dl-sev--' +
      (s.sev === 'P0' || s.sev === 'P1' ? 'hi' : s.sev === 'P2' ? 'mid' : 'low');
    $('dl-tag').textContent = s.tag;
    $('dl-clock').textContent = 'Situation ' + (idx + 1) + ' / ' + L.scenarios.length;
    $('dl-brief').innerHTML = s.brief;
    $('dl-ask').textContent = s.ask;

    var box = $('dl-opts');
    box.innerHTML = '';
    s.opts.forEach(function (o, i) {
      var b = document.createElement('button');
      b.className = 'dl-opt';
      b.type = 'button';
      b.innerHTML = '<span class="dl-opt__key">' + 'ABC'[i] + '</span>' +
                    '<span class="dl-opt__txt">' + o.t + '</span>';
      if (pick === undefined) {
        b.addEventListener('click', function () { picks[idx] = i; renderScenario(); });
      } else {
        b.disabled = true;
        if (i === pick || o.v === 'match') {
          b.setAttribute('data-state', o.v);
          var v = document.createElement('span');
          v.className = 'dl-opt__verdict';
          v.textContent = (i === pick
            ? (o.v === 'match' ? 'Your call — and the one that was made. '
             : o.v === 'close' ? 'Your call — defensible, but not it. '
             : 'Your call — this is the expensive one. ')
            : 'The actual call. ') + o.n;
          b.appendChild(v);
        } else {
          b.setAttribute('data-state', 'dim');
        }
      }
      box.appendChild(b);
    });

    var rev = $('dl-reveal'), next = $('dl-next');
    if (pick === undefined) {
      rev.hidden = true;
      rev.removeAttribute('data-in');
      next.disabled = true;
      next.textContent = 'Next situation →';
    } else {
      rev.hidden = false;
      $('dl-head').innerHTML = s.head;
      $('dl-body').innerHTML = s.body.map(function (p) { return '<p>' + p + '</p>'; }).join('');
      $('dl-srcs').innerHTML = s.src.map(link).join(' &nbsp;·&nbsp; ');
      rev.setAttribute('data-in', '');
      next.disabled = false;
      next.textContent = idx < L.scenarios.length - 1
        ? 'Next situation →' : 'Lane complete — see the fit brief ↓';
    }
    renderRail();
  }

  function renderRail() {
    var L = LANES[lane];

    var pips = $('dl-pips');
    pips.innerHTML = '';
    L.scenarios.forEach(function (s, i) {
      var p = document.createElement('i');
      p.className = 'dl-pip';
      if (picks[i] !== undefined) p.setAttribute('data-v', s.opts[picks[i]].v);
      else if (i === idx) p.setAttribute('data-v', 'current');
      pips.appendChild(p);
    });

    var done = 0, agreed = 0;
    L.scenarios.forEach(function (s, i) {
      if (picks[i] === undefined) return;
      done++;
      if (s.opts[picks[i]].v === 'match') agreed++;
    });
    $('dl-tallyn').textContent = agreed + '/' + done;
    $('dl-tallylbl').textContent = done === 0 ? 'calls made so far' : 'of your calls matched hers';
    $('dl-tallynote').textContent =
      done === 0 ? 'Nothing scored yet. Pick an option on the card to open the first entry.'
      : agreed === done ? 'Same read every time. The reasoning underneath is where the interesting part is.'
      : agreed === 0 ? 'A different read throughout — which is the useful outcome. Every card explains what the alternative cost.'
      : 'Split verdict. The disagreements are the ones worth asking about in an interview.';

    var seen = [];
    L.scenarios.forEach(function (s, i) {
      if (picks[i] === undefined) return;
      s.src.forEach(function (r) {
        if (!seen.some(function (x) { return x.l === r.l; })) seen.push(r);
      });
    });
    var ul = $('dl-unlocked');
    ul.innerHTML = '';
    if (!seen.length) {
      ul.innerHTML = '<li><span class="dl-empty">Sources attach here as each situation resolves.</span></li>';
    } else {
      seen.forEach(function (r) {
        var li = document.createElement('li');
        li.innerHTML = '<span class="dl-mk">&#9679;</span><span>' + link(r) + '</span>';
        ul.appendChild(li);
      });
    }
  }

  function renderTimeline() {
    var tl = $('dl-tl');
    tl.innerHTML = '';
    TIMELINE.forEach(function (n, i) {
      var b = document.createElement('button');
      b.className = 'dl-node';
      b.type = 'button';
      b.setAttribute('aria-pressed', String(i === tlIdx));
      if (n.lanes.indexOf(lane) > -1) b.setAttribute('data-hit', '1');
      b.innerHTML = '<span class="dl-node__yr">' + n.yr + '</span>' +
                    '<span class="dl-node__role">' + n.role + '</span>' +
                    '<span class="dl-node__org">' + n.org + '</span>';
      b.addEventListener('click', function () { tlIdx = i; renderTimeline(); });
      tl.appendChild(b);
    });

    var n = TIMELINE[tlIdx];
    $('dl-tldetail').innerHTML =
      '<h3>' + n.role + '</h3>' +
      '<p class="dl-tldetail__sub">' + n.sub + '</p>' +
      '<ul>' + n.pts.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' +
      '<div class="dl-tltags">' +
      ['ts', 'pc', 'cos'].map(function (k) {
        return '<i class="' + (n.lanes.indexOf(k) > -1 ? 'on' : '') + '">' + LANES[k].plain + '</i>';
      }).join('') + '</div>';
  }

  function renderProof() {
    var sh = $('dl-shelf');
    sh.innerHTML = '';
    PROOF.forEach(function (p) {
      var d = document.createElement('article');
      d.className = 'dl-proof';
      if (p.lanes.indexOf(lane) === -1) d.setAttribute('data-dim', '1');
      d.innerHTML =
        '<div class="dl-proof__h"><span class="dl-proof__n">' + p.n + '</span><h3>' + p.t + '</h3></div>' +
        '<p class="dl-proof__find">' + p.find + '</p>' +
        '<div class="dl-proof__meta"><span>' + p.meta + '</span>' +
        '<span class="dl-lanepips">' + ['ts', 'pc', 'cos'].map(function (k) {
          return '<i class="' + (p.lanes.indexOf(k) > -1 ? 'on' : '') + '"></i>';
        }).join('') + '</span>' +
        '<a href="' + p.href + '">Case study &rarr;</a></div>';
      sh.appendChild(d);
    });
  }

  function renderFit() {
    var L = LANES[lane];
    $('dl-fittitle').innerHTML = 'Why ' + L.name;
    $('dl-fitlede').innerHTML = L.fitLede;
    $('dl-fitgrid').innerHTML = L.fit.map(function (c) {
      return '<div class="dl-fitcol"><h3>' + c.h + '</h3><ul>' +
        c.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul></div>';
    }).join('');
  }

  function setLane(k) {
    lane = k;
    idx = 0;
    picks = [];
    Array.prototype.forEach.call(document.querySelectorAll('.dl-lane'), function (b) {
      b.setAttribute('aria-selected', String(b.getAttribute('data-lane') === k));
    });
    $('dl-loglane').innerHTML = LANES[k].name;
    $('dl-desktitle').innerHTML = LANES[k].deskTitle;
    $('dl-deskblurb').textContent = LANES[k].blurb;
    renderScenario();
    renderTimeline();
    renderProof();
    renderFit();
  }

  /* ---------------------------------------------------------------- init */
  document.addEventListener('DOMContentLoaded', function () {
    if (!$('dl-opts')) return;

    Array.prototype.forEach.call(document.querySelectorAll('.dl-lane'), function (b) {
      b.addEventListener('click', function () { setLane(b.getAttribute('data-lane')); });
    });

    $('dl-next').addEventListener('click', function () {
      if (idx < LANES[lane].scenarios.length - 1) {
        idx++;
        renderScenario();
        document.getElementById('desk').scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        document.getElementById('fit').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    $('dl-restart').addEventListener('click', function () {
      idx = 0; picks = [];
      renderScenario();
      document.getElementById('desk').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    setLane('ts');
  });
})();
