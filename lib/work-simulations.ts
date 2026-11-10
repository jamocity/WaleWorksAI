export type SimulationOption = { id: string; label: string };
export type SimulationQuestion = {
  id: string;
  prompt: string;
  options: SimulationOption[];
  correctOptionId: string;
  explanation: string;
};

export type WorkSimulation = {
  slug: string;
  title: string;
  role: string;
  careerTrack: string;
  level: 'Beginner' | 'Intermediate';
  duration: string;
  workplace: string;
  brief: string;
  objective: string;
  dayPlan: { time: string; activity: string }[];
  questions: SimulationQuestion[];
  deliverableTitle: string;
  deliverablePrompt: string;
  rubric: string[];
};

export const WORK_SIMULATIONS: WorkSimulation[] = [
  {
    slug: 'it-support-morning-queue',
    title: 'The morning support queue',
    role: 'Junior IT Support Analyst',
    careerTrack: 'IT Support & Systems Administration',
    level: 'Beginner',
    duration: '35–45 min',
    workplace: 'A 120-person professional services company. You are on the internal IT service desk, reporting to an IT Support Lead.',
    brief: 'It is 9:12 a.m. Three employees in the finance team report that they cannot open the shared finance drive. One employee says the issue began after restarting their laptop. A payroll submission is due at 11:00 a.m. Your lead is in another meeting for the next 20 minutes. You must triage the issue, communicate clearly and avoid unsafe shortcuts.',
    objective: 'Practice ticket triage, user communication, safe troubleshooting, prioritisation and escalation.',
    dayPlan: [
      { time: '09:00', activity: 'Review the handover notes and open service tickets.' },
      { time: '09:12', activity: 'Receive and triage the shared-drive incident.' },
      { time: '09:20', activity: 'Collect evidence and determine the scope of impact.' },
      { time: '09:30', activity: 'Send a clear update and decide whether to escalate.' },
      { time: '09:45', activity: 'Document the ticket so another analyst can continue the work.' },
    ],
    questions: [
      {
        id: 'first-response',
        prompt: 'What should you do first after receiving the reports?',
        options: [
          { id: 'collect-context', label: 'Confirm who is affected, the exact error, when it started and any recent changes; record the impact.' },
          { id: 'ask-password', label: 'Ask one employee to send you their password so you can test the drive.' },
          { id: 'reinstall', label: 'Tell all three employees to reinstall Windows before investigating.' },
        ],
        correctOptionId: 'collect-context',
        explanation: 'A good first response establishes scope, impact and reproducible symptoms. Never ask users to disclose passwords, and avoid disruptive fixes before diagnosis.',
      },
      {
        id: 'scope-check',
        prompt: 'You confirm that three finance employees are affected, while colleagues in other departments can open their own shared folders. What is the most useful next check?',
        options: [
          { id: 'scope-permissions', label: 'Check the finance share service, network access and relevant group permissions; compare with a known working account or device using approved tools.' },
          { id: 'reset-everyone', label: 'Reset every employee password across the company.' },
          { id: 'ignore', label: 'Close the tickets because the issue is limited to one department.' },
        ],
        correctOptionId: 'scope-permissions',
        explanation: 'The pattern suggests a department-level share, permission or service issue. Check the narrowest relevant systems and preserve a record of what you test.',
      },
      {
        id: 'user-update',
        prompt: 'Payroll is due at 11:00 a.m. Which update is most professional?',
        options: [
          { id: 'clear-update', label: '“We have confirmed multiple Finance users are affected. I am checking the shared-drive access path and permissions. I have flagged the payroll deadline and will update you by 9:45 a.m. Please do not share passwords.”' },
          { id: 'vague-update', label: '“The network is broken. We will fix it soon.”' },
          { id: 'blame-update', label: '“This is probably a user mistake. Try again later.”' },
        ],
        correctOptionId: 'clear-update',
        explanation: 'Good incident communication states known facts, current action, business impact, the next update time and safe instructions without speculating or blaming users.',
      },
    ],
    deliverableTitle: 'Write the ticket update',
    deliverablePrompt: 'Write a concise internal ticket note for the next analyst. Include the impact, confirmed facts, checks performed or still needed, the payroll deadline, and the next action. Do not invent a root cause.',
    rubric: ['States who and how many users are affected.', 'Separates confirmed facts from assumptions.', 'Records safe checks and avoids collecting passwords.', 'Mentions business urgency and a clear next action or escalation.'],
  },
  {
    slug: 'frontend-release-bug',
    title: 'A bug after the release',
    role: 'Junior Frontend Developer',
    careerTrack: 'Software Development',
    level: 'Beginner',
    duration: '40–50 min',
    workplace: 'You joined a small product team. You work with a product manager, a backend engineer and a senior frontend developer.',
    brief: 'At 10:05 a.m., customer support reports that the checkout page shows a blank panel for some customers after the latest release. The issue appears only when a customer selects a saved delivery address. The team has a release review at noon. Your task is to reproduce the issue, gather useful evidence and propose a safe fix workflow.',
    objective: 'Practice bug reproduction, debugging discipline, collaboration, test selection and pull-request communication.',
    dayPlan: [
      { time: '09:00', activity: 'Review the sprint board and pull-request feedback.' },
      { time: '10:05', activity: 'Triage a checkout regression reported by support.' },
      { time: '10:20', activity: 'Reproduce the bug and inspect browser and application logs.' },
      { time: '10:45', activity: 'Agree on a fix and add a regression test.' },
      { time: '11:30', activity: 'Prepare a pull-request summary and hand over for review.' },
    ],
    questions: [
      {
        id: 'reproduce',
        prompt: 'What is the best first engineering action?',
        options: [
          { id: 'repro-steps', label: 'Reproduce with a saved address, capture exact steps, browser/device, expected result and actual result.' },
          { id: 'rewrite-page', label: 'Rewrite the entire checkout page immediately.' },
          { id: 'patch-production', label: 'Edit production files directly without review.' },
        ],
        correctOptionId: 'repro-steps',
        explanation: 'A reproducible bug report narrows the search space and gives teammates a shared starting point. Avoid risky production changes outside the team release process.',
      },
      {
        id: 'debug',
        prompt: 'The issue began after the latest release and occurs only with saved addresses. What should you inspect next?',
        options: [
          { id: 'inspect-change', label: 'Review the recent checkout/address changes, console and network errors, and relevant API response shape.' },
          { id: 'clear-database', label: 'Delete saved addresses from the production database.' },
          { id: 'blame-api', label: 'Assume the backend team caused it without checking evidence.' },
        ],
        correctOptionId: 'inspect-change',
        explanation: 'Connect the timing and the condition to recent changes, then use logs and request/response evidence to isolate the failure before proposing a code change.',
      },
      {
        id: 'regression-test',
        prompt: 'Which test best protects against this bug returning?',
        options: [
          { id: 'saved-address-test', label: 'A test that selects a saved address and verifies the checkout summary renders and the expected delivery data is submitted.' },
          { id: 'homepage-only', label: 'A screenshot check of the homepage only.' },
          { id: 'no-test', label: 'No test is needed if the page looks correct on your laptop.' },
        ],
        correctOptionId: 'saved-address-test',
        explanation: 'A regression test should reproduce the specific condition that failed and verify the expected behavior across the relevant flow.',
      },
    ],
    deliverableTitle: 'Draft your pull-request summary',
    deliverablePrompt: 'Write a short pull-request summary using: problem, reproduction steps, likely cause or investigation evidence, proposed fix, tests performed, and anything a reviewer should pay attention to. If you have not confirmed the cause, say so.',
    rubric: ['Provides reproducible steps and expected versus actual behavior.', 'Links the change to evidence rather than guessing.', 'Describes a focused fix rather than a broad rewrite.', 'Includes a regression test and reviewer notes.'],
  },
  {
    slug: 'data-quality-check',
    title: 'The numbers do not match',
    role: 'Junior Data Analyst',
    careerTrack: 'Data & Analytics',
    level: 'Beginner',
    duration: '35–45 min',
    workplace: 'You support the operations team at an online retailer. Your manager relies on a daily sales dashboard for the morning stand-up.',
    brief: 'At 8:40 a.m., your manager notices that yesterday’s sales total in the dashboard is 18% lower than the total in the finance export. They need a reliable explanation before a 10:30 a.m. leadership meeting. You have two CSV extracts, a dashboard filter and limited time. You must validate before reporting.',
    objective: 'Practice data-quality checks, metric definitions, analysis prioritisation and communicating uncertainty.',
    dayPlan: [
      { time: '08:30', activity: 'Refresh the daily dashboard and review data-load status.' },
      { time: '08:40', activity: 'Receive a discrepancy from the operations manager.' },
      { time: '09:00', activity: 'Compare date windows, filters, duplicates and missing values.' },
      { time: '09:40', activity: 'Reconcile the metric and document remaining uncertainty.' },
      { time: '10:10', activity: 'Send a concise evidence-based update before the meeting.' },
    ],
    questions: [
      {
        id: 'metric-definition',
        prompt: 'What should you compare before concluding that one source is wrong?',
        options: [
          { id: 'compare-definition', label: 'Date/time window, timezone, gross versus net sales, refunds, filters and source refresh time.' },
          { id: 'pick-larger', label: 'Use whichever total is larger because it is likely more complete.' },
          { id: 'round-number', label: 'Round both values until they look similar.' },
        ],
        correctOptionId: 'compare-definition',
        explanation: 'Metrics can differ because of definitions, timing and filters. Align the measurement rules before comparing values.',
      },
      {
        id: 'quality-check',
        prompt: 'Which data-quality checks are most relevant before sending a number?',
        options: [
          { id: 'check-rows', label: 'Check row counts, duplicate order IDs, missing amounts, refunds/cancellations and whether the latest data load completed.' },
          { id: 'delete-outliers', label: 'Delete unusually large transactions until the total looks reasonable.' },
          { id: 'assume', label: 'Assume the CSV is correct because it came from Finance.' },
        ],
        correctOptionId: 'check-rows',
        explanation: 'Validate completeness, uniqueness, data freshness and business rules. Never remove records simply because they look unusual.',
      },
      {
        id: 'communicate',
        prompt: 'You have narrowed the difference to refunds and a timezone boundary, but one source has not refreshed. What should you report?',
        options: [
          { id: 'qualified-result', label: 'Report the checks completed, the likely contributors, the source still awaiting refresh and when you will confirm the reconciled figure.' },
          { id: 'false-certainty', label: 'Declare the finance export wrong and send an exact figure.' },
          { id: 'hide-gap', label: 'Send the dashboard figure without mentioning the discrepancy.' },
        ],
        correctOptionId: 'qualified-result',
        explanation: 'A trustworthy analyst distinguishes confirmed findings from a provisional explanation, states limitations and commits to the next validation step.',
      },
    ],
    deliverableTitle: 'Write the manager update',
    deliverablePrompt: 'Draft a short update for the operations manager. Explain what you compared, what could be causing the 18% difference, what is not yet confirmed, and when they will receive a reconciled figure. Do not invent numbers.',
    rubric: ['Mentions comparable time windows and metric definitions.', 'Identifies relevant data-quality checks.', 'Clearly labels provisional findings and missing evidence.', 'Gives the manager a practical next update time or action.'],
  },
  {
    slug: 'security-alert-triage',
    title: 'A suspicious sign-in alert',
    role: 'Junior Security Operations Analyst',
    careerTrack: 'Cybersecurity',
    level: 'Intermediate',
    duration: '40–50 min',
    workplace: 'You are on the first-line security operations team at a mid-sized company. A senior analyst is available for escalation.',
    brief: 'At 2:15 p.m., the monitoring console flags several failed sign-ins followed by one successful sign-in to an employee account from an unfamiliar location. The employee reports clicking a link in an email that looked like a document-sharing notification. You do not yet know whether credentials were entered. Follow the incident process and preserve evidence.',
    objective: 'Practice alert triage, incident escalation, evidence preservation and safe communication.',
    dayPlan: [
      { time: '14:00', activity: 'Review alert queue and security handover.' },
      { time: '14:15', activity: 'Investigate an unusual sign-in alert.' },
      { time: '14:25', activity: 'Contact the employee through an approved channel and establish impact.' },
      { time: '14:35', activity: 'Preserve relevant evidence and escalate according to the playbook.' },
      { time: '15:00', activity: 'Record a clear incident timeline and next steps.' },
    ],
    questions: [
      {
        id: 'first-triage',
        prompt: 'What is the best immediate response?',
        options: [
          { id: 'verify-escalate', label: 'Preserve alert details, verify the event through approved logs, contact the employee through a trusted channel and notify the senior analyst per the incident playbook.' },
          { id: 'delete-email', label: 'Delete the email from the employee mailbox and close the alert.' },
          { id: 'public-message', label: 'Post the employee’s details in a public team chat to ask who recognises the IP.' },
        ],
        correctOptionId: 'verify-escalate',
        explanation: 'Treat the event as potentially serious, preserve evidence, use trusted communication and follow the organisation’s escalation process.',
      },
      {
        id: 'containment',
        prompt: 'The employee confirms they entered their password on the page. What should happen next?',
        options: [
          { id: 'playbook-containment', label: 'Escalate immediately and follow the approved account-containment steps, such as session revocation and credential reset, coordinated with the incident lead.' },
          { id: 'wait', label: 'Wait until the next day to see whether more alerts appear.' },
          { id: 'personal-tool', label: 'Install an unapproved remote tool on the employee’s device.' },
        ],
        correctOptionId: 'playbook-containment',
        explanation: 'Credential exposure requires prompt coordinated containment. Use the approved playbook and authorised tooling rather than improvising destructive actions.',
      },
      {
        id: 'evidence',
        prompt: 'Which evidence should be captured for the incident record?',
        options: [
          { id: 'timeline-evidence', label: 'Alert timestamps, account identifier, sign-in details, message headers or URL, employee confirmation and actions taken.' },
          { id: 'password-copy', label: 'The employee’s current password and personal files.' },
          { id: 'only-opinion', label: 'A note saying “probably phishing” with no supporting details.' },
        ],
        correctOptionId: 'timeline-evidence',
        explanation: 'An incident record should let another responder reconstruct what happened and what was done. Do not collect or store passwords.',
      },
    ],
    deliverableTitle: 'Create the incident handover',
    deliverablePrompt: 'Write a concise handover with the alert timeline, what the employee confirmed, evidence preserved, containment/escalation actions and outstanding questions. Do not include passwords or sensitive personal data.',
    rubric: ['Uses a clear sequence of events and timestamps.', 'Distinguishes observed facts from assumptions.', 'Records approved containment and escalation actions.', 'Avoids including credentials or unnecessary personal information.'],
  },
  {
    slug: 'qa-signup-regression',
    title: 'The signup flow is failing',
    role: 'Junior QA Analyst',
    careerTrack: 'QA & Software Testing',
    level: 'Beginner',
    duration: '35–45 min',
    workplace: 'You are part of a product team preparing a web application release. Developers need clear, reproducible defects rather than vague reports.',
    brief: 'At 11:20 a.m., the product manager tells you that some new users cannot complete signup. The failure appears after the user enters a valid email and password and clicks Create Account. You need to reproduce the issue, determine its severity, collect evidence and write a defect report the developer can act on.',
    objective: 'Practice test design, reproducibility, defect severity, evidence collection and clear reporting.',
    dayPlan: [
      { time: '09:00', activity: 'Review acceptance criteria and the release test plan.' },
      { time: '11:20', activity: 'Receive a signup regression report.' },
      { time: '11:30', activity: 'Reproduce across relevant browsers and account states.' },
      { time: '12:00', activity: 'Record steps, expected/actual results and evidence.' },
      { time: '12:20', activity: 'Share the defect report and retest plan with the team.' },
    ],
    questions: [
      {
        id: 'test-approach',
        prompt: 'What is the strongest first test approach?',
        options: [
          { id: 'controlled-repro', label: 'Use a clean test account and documented environment, follow the acceptance criteria, and record exact steps and results.' },
          { id: 'random-clicks', label: 'Click around until something fails and report that signup is broken.' },
          { id: 'prod-data', label: 'Test by changing real customer accounts in production.' },
        ],
        correctOptionId: 'controlled-repro',
        explanation: 'Controlled, repeatable tests isolate the condition and make the defect actionable while avoiding risk to real user data.',
      },
      {
        id: 'defect-report',
        prompt: 'Which details belong in a useful defect report?',
        options: [
          { id: 'repro-detail', label: 'Environment, preconditions, numbered steps, expected result, actual result, frequency, severity and screenshot/log evidence with sensitive data removed.' },
          { id: 'one-line', label: '“Signup does not work. Please fix.”' },
          { id: 'only-screenshot', label: 'A screenshot without steps or context.' },
        ],
        correctOptionId: 'repro-detail',
        explanation: 'A good defect report provides enough information to reproduce and prioritise the issue without exposing personal information.',
      },
      {
        id: 'retest',
        prompt: 'A developer says the fix is ready. What should you do?',
        options: [
          { id: 'retest-regression', label: 'Retest the original failing steps, verify the expected result and run relevant nearby regression checks.' },
          { id: 'close-now', label: 'Close the defect without testing because the developer said it is fixed.' },
          { id: 'test-unrelated', label: 'Only test the homepage.' },
        ],
        correctOptionId: 'retest-regression',
        explanation: 'Verification confirms the specific fix and checks nearby flows for unintended regressions.',
      },
    ],
    deliverableTitle: 'Write a reproducible defect report',
    deliverablePrompt: 'Write a defect report with a short title, environment, preconditions, numbered steps, expected result, actual result, severity rationale and evidence you would attach. Do not invent a browser or error message that was not provided.',
    rubric: ['Uses a specific, searchable defect title.', 'Includes numbered steps and preconditions.', 'Separates expected and actual behavior.', 'Explains severity and identifies useful evidence.'],
  },

  {
    slug: 'cloud-deployment-rollback',
    title: 'A staging deployment failed',
    role: 'Junior Cloud & DevOps Engineer',
    careerTrack: 'Cloud & DevOps',
    level: 'Intermediate',
    duration: '40–50 min',
    workplace: 'You are part of a platform engineering team supporting a web product. A senior engineer approves production changes.',
    brief: 'At 3:05 p.m., a deployment to staging fails after a configuration change. The pipeline reports that the application cannot read a required environment variable. The product team wants to begin acceptance testing in 45 minutes. You need to inspect the pipeline, protect secrets and communicate a safe recovery plan. Production has not been changed.',
    objective: 'Practise deployment triage, environment configuration, secret handling, rollback decisions and team communication.',
    dayPlan: [
      { time: '09:00', activity: 'Review pipeline status, infrastructure alerts and open pull requests.' },
      { time: '13:30', activity: 'Review the staging release checklist with the team.' },
      { time: '15:05', activity: 'Triage a failed staging deployment.' },
      { time: '15:20', activity: 'Inspect configuration and pipeline logs without exposing secrets.' },
      { time: '15:40', activity: 'Propose a safe recovery and communicate test readiness.' },
    ],
    questions: [
      { id: 'pipeline-inspect', prompt: 'What should you inspect first?', options: [
        { id: 'inspect-pipeline', label: 'Check the failed pipeline step, recent configuration change, environment-variable names and redacted logs.' },
        { id: 'print-secrets', label: 'Print every environment variable and paste the values into the team chat.' },
        { id: 'restart-prod', label: 'Restart the production environment even though only staging failed.' },
      ], correctOptionId: 'inspect-pipeline', explanation: 'Start with the failed stage and recent change. Verify variable names and configuration while keeping secret values masked and out of logs.' },
      { id: 'recovery-plan', prompt: 'The change is isolated to staging configuration. What is a responsible recovery plan?', options: [
        { id: 'fix-review', label: 'Correct the staging configuration through the reviewed change process, rerun the pipeline and confirm health checks before inviting QA.' },
        { id: 'manual-prod', label: 'Copy configuration directly into production to see whether the error disappears.' },
        { id: 'skip-check', label: 'Tell QA to continue even though the environment is unhealthy.' },
      ], correctOptionId: 'fix-review', explanation: 'Use the normal reviewed deployment process, verify the environment and do not promote untested configuration into production.' },
      { id: 'communication', prompt: 'What should you tell the product team?', options: [
        { id: 'status-honest', label: 'Explain that staging is unavailable due to a configuration issue, state the recovery step and give a time for the next status update.' },
        { id: 'promise', label: 'Guarantee the environment will be fixed in five minutes without evidence.' },
        { id: 'blame', label: 'Blame the person who changed the configuration.' },
      ], correctOptionId: 'status-honest', explanation: 'Communicate impact, known cause, next action and update timing. Avoid unverified promises and blame.' },
    ],
    deliverableTitle: 'Write a deployment incident update',
    deliverablePrompt: 'Write a short update for the engineering/product channel. Include the affected environment, current evidence, what is being checked, how secrets are protected, the recovery verification and the next update time.',
    rubric: ['Identifies staging as the affected environment.', 'Does not reveal credentials or secret values.', 'Uses the reviewed deployment and health-check process.', 'Gives a realistic next update without promising an unverified resolution.'],
  },
  {
    slug: 'ux-onboarding-dropoff',
    title: 'Users abandon the onboarding flow',
    role: 'Junior Product / UX Designer',
    careerTrack: 'UI/UX & Product Design',
    level: 'Beginner',
    duration: '35–45 min',
    workplace: 'You work with a product manager, a researcher and two frontend developers on a mobile-first product.',
    brief: 'The product analytics report shows that many new users leave during the profile setup step. The product manager asks you to “make onboarding simpler” before the next sprint. You have a short analytics summary and two support messages, but no direct user interviews yet. Your job is to investigate before jumping into visual changes.',
    objective: 'Practise problem framing, user evidence, accessibility, design prioritisation and developer handoff.',
    dayPlan: [
      { time: '09:15', activity: 'Review product metrics and support feedback.' },
      { time: '10:00', activity: 'Map the current onboarding journey and identify friction points.' },
      { time: '11:00', activity: 'Prepare focused usability questions and design hypotheses.' },
      { time: '13:00', activity: 'Sketch a low-fidelity alternative and check accessibility.' },
      { time: '15:00', activity: 'Share a testable recommendation and handoff notes.' },
    ],
    questions: [
      { id: 'discover-friction', prompt: 'What is the best first step?', options: [
        { id: 'inspect-evidence', label: 'Review the exact step where users leave, device patterns and support messages; then plan a short usability check.' },
        { id: 'change-colors', label: 'Change the brand colours immediately because the screen may look old.' },
        { id: 'remove-fields', label: 'Remove every profile field without checking which information is necessary.' },
      ], correctOptionId: 'inspect-evidence', explanation: 'Use evidence to locate friction and validate causes. A high drop-off does not automatically mean the visual design is the problem.' },
      { id: 'design-choice', prompt: 'What is the safest design direction to test first?', options: [
        { id: 'reduce-friction', label: 'Test a smaller, clearly explained first step, show progress and defer nonessential questions where product rules allow.' },
        { id: 'hide-errors', label: 'Remove validation messages so users cannot see errors.' },
        { id: 'tiny-text', label: 'Fit every question on one screen using smaller text.' },
      ], correctOptionId: 'reduce-friction', explanation: 'Reduce cognitive load without losing necessary information. Maintain clear progress, labels, error feedback and accessible controls.' },
      { id: 'handoff', prompt: 'What should a useful developer handoff contain?', options: [
        { id: 'handoff-details', label: 'User problem, design states, interaction behaviour, validation/error states, responsive rules and accessibility notes.' },
        { id: 'screenshot-only', label: 'One screenshot with no behaviour or state details.' },
        { id: 'verbal-only', label: 'A verbal instruction to make it look cleaner.' },
      ], correctOptionId: 'handoff-details', explanation: 'A good handoff explains both the visual design and how the interface behaves across states and devices.' },
    ],
    deliverableTitle: 'Write a one-page design recommendation',
    deliverablePrompt: 'Summarise the problem, evidence available, what you still need to learn, one testable design hypothesis, the change you would prototype and how you would measure whether it helped.',
    rubric: ['Separates evidence from assumptions.', 'States a clear user problem and testable hypothesis.', 'Considers accessibility and responsive behaviour.', 'Defines a measurable outcome rather than relying on visual preference.'],
  },
  {
    slug: 'network-outage-triage',
    title: 'Intermittent connectivity on one floor',
    role: 'Junior Network Support Technician',
    careerTrack: 'Networking & Infrastructure',
    level: 'Intermediate',
    duration: '35–45 min',
    workplace: 'You support office connectivity with a network engineer who owns configuration changes and maintenance windows.',
    brief: 'At 10:30 a.m., staff on the third floor report intermittent Wi-Fi. Wired devices on the same floor appear normal. A meeting room has a client presentation in 20 minutes. You need to establish whether the issue is localised, collect network evidence and escalate configuration changes to the authorised engineer.',
    objective: 'Practise network fault isolation, user impact assessment, evidence gathering and change control.',
    dayPlan: [
      { time: '09:00', activity: 'Review monitoring alerts and network handover.' },
      { time: '10:30', activity: 'Receive reports of intermittent third-floor Wi-Fi.' },
      { time: '10:40', activity: 'Compare affected devices, access points and wired connectivity.' },
      { time: '10:55', activity: 'Escalate evidence and share a workaround with affected staff.' },
      { time: '11:30', activity: 'Update the incident record and monitor recovery.' },
    ],
    questions: [
      { id: 'network-scope', prompt: 'What helps isolate the likely fault domain?', options: [
        { id: 'compare-devices', label: 'Compare affected and unaffected devices, access point association, signal quality and timestamps while confirming wired access.' },
        { id: 'factory-reset', label: 'Factory-reset every access point on the campus.' },
        { id: 'new-router', label: 'Order a new router before gathering evidence.' },
      ], correctOptionId: 'compare-devices', explanation: 'Compare clients and access points to narrow the issue. A broad reset or replacement before diagnosis can disrupt other users.' },
      { id: 'safe-action', prompt: 'You suspect one access point is overloaded. What should you do?', options: [
        { id: 'collect-escalate', label: 'Collect monitoring data and affected client details, then escalate a proposed change to the network engineer under change control.' },
        { id: 'change-channel', label: 'Change radio settings immediately without approval.' },
        { id: 'disable-wifi', label: 'Disable Wi-Fi for the whole building.' },
      ], correctOptionId: 'collect-escalate', explanation: 'A junior technician gathers reliable evidence and follows the authorised change process. Configuration changes should be approved and documented.' },
      { id: 'workaround', prompt: 'What should you tell the meeting-room staff while the issue is investigated?', options: [
        { id: 'workaround-clear', label: 'Explain the affected area, offer an approved wired or alternate connection if available, and provide a time for the next update.' },
        { id: 'guarantee', label: 'Guarantee that the Wi-Fi will be fixed before the meeting.' },
        { id: 'ignore-users', label: 'Tell staff to stop reporting the issue.' },
      ], correctOptionId: 'workaround-clear', explanation: 'Good support communication is clear about known impact, safe alternatives and update timing.' },
    ],
    deliverableTitle: 'Create the network incident handover',
    deliverablePrompt: 'Record the affected area, wired versus wireless observations, evidence gathered, user impact, approved workaround, who owns the next action and the next update time.',
    rubric: ['Defines the scope using specific observations.', 'Separates likely causes from confirmed facts.', 'Avoids unauthorised infrastructure changes.', 'Communicates impact, workaround and escalation ownership.'],
  },
  {
    slug: 'ml-data-drift-review',
    title: 'A model output starts drifting',
    role: 'Junior Data / ML Analyst',
    careerTrack: 'AI & Machine Learning',
    level: 'Intermediate',
    duration: '40–50 min',
    workplace: 'You support a small machine-learning product team. A senior ML engineer owns model deployment and retraining decisions.',
    brief: 'At 1:10 p.m., the operations team reports that a model which categorises incoming support requests is assigning far more tickets to “Other” than usual. A new form field was released this morning. You are asked to investigate before the next model performance review. Do not change the live model or retrain it without approval.',
    objective: 'Practise data quality investigation, input drift reasoning, responsible AI escalation and evidence-based communication.',
    dayPlan: [
      { time: '09:00', activity: 'Review model monitoring dashboards and previous handover notes.' },
      { time: '13:10', activity: 'Receive a report of unusual model classifications.' },
      { time: '13:25', activity: 'Compare recent input distributions and the new form field.' },
      { time: '14:00', activity: 'Prepare evidence and possible causes for the ML engineer.' },
      { time: '14:30', activity: 'Document limitations and agree on monitoring next steps.' },
    ],
    questions: [
      { id: 'drift-check', prompt: 'What should you compare first?', options: [
        { id: 'input-compare', label: 'Compare recent and historical input distributions, missing values, schema changes and the timing of the new form field.' },
        { id: 'retrain-now', label: 'Retrain the production model immediately using all current data.' },
        { id: 'hide-output', label: 'Hide the “Other” category so the dashboard looks normal.' },
      ], correctOptionId: 'input-compare', explanation: 'Investigate input data and schema changes before attributing the shift to model quality. Do not modify production models without approval.' },
      { id: 'responsible-review', prompt: 'You discover many records have null values in the new field. What is the best next step?', options: [
        { id: 'document-escalate', label: 'Document the affected proportion, compare the release timeline and escalate the evidence to the ML engineer and product owner.' },
        { id: 'fill-random', label: 'Fill missing values with random text to reduce nulls.' },
        { id: 'ignore', label: 'Ignore missing values because the model still returns a category.' },
      ], correctOptionId: 'document-escalate', explanation: 'Quantify the data-quality change and involve the responsible owners. Missingness can change model behaviour and must not be hidden.' },
      { id: 'communication', prompt: 'How should you describe the result before root cause is confirmed?', options: [
        { id: 'qualified', label: 'Report the observed shift, the null-value pattern, the possible link to the form release and the checks still required.' },
        { id: 'certain', label: 'State that the model is broken and must be replaced.' },
        { id: 'hide', label: 'Say the model is operating normally.' },
      ], correctOptionId: 'qualified', explanation: 'Use accurate language and distinguish measured evidence from hypotheses. Responsible analysis includes uncertainty and next steps.' },
    ],
    deliverableTitle: 'Prepare an ML monitoring handover',
    deliverablePrompt: 'Write a short note describing the observed output change, the input checks performed, the new form field and missing-value evidence, what remains unverified, and the recommended owner/actions.',
    rubric: ['Describes the observed change without exaggeration.', 'Connects the timeline to the schema change as a hypothesis, not a proven cause.', 'Quantifies or explains the data-quality evidence.', 'Escalates model changes to the authorised ML owner.'],
  },
  {
    slug: 'product-requirements-clarification',
    title: 'The stakeholder asks for “AI features”',
    role: 'Junior Business Analyst',
    careerTrack: 'Product Management & Business Analysis',
    level: 'Beginner',
    duration: '35–45 min',
    workplace: 'You support a product manager who is preparing the next sprint with designers and engineers.',
    brief: 'A department head asks the product team to “add AI” to an internal request portal before the next quarter. The request has no defined user problem, success measure, budget or data-access decision. Engineering has already asked what should be built. Your task is to clarify the need before the team commits to a solution.',
    objective: 'Practise stakeholder discovery, requirement definition, acceptance criteria, scope control and cross-team communication.',
    dayPlan: [
      { time: '09:00', activity: 'Review the product backlog and incoming stakeholder requests.' },
      { time: '10:00', activity: 'Meet the department head to understand the user problem.' },
      { time: '11:00', activity: 'Map the current workflow and identify pain points.' },
      { time: '13:00', activity: 'Draft a user story and measurable acceptance criteria.' },
      { time: '14:30', activity: 'Review scope, dependencies and open questions with the product manager.' },
    ],
    questions: [
      { id: 'discovery', prompt: 'What should you ask before writing a requirement?', options: [
        { id: 'why-who', label: 'Who experiences the problem, what task is difficult today, how often it happens and what outcome would improve it?' },
        { id: 'which-model', label: 'Which large language model should the team use?' },
        { id: 'deadline-only', label: 'Can engineering deliver something by the requested date?' },
      ], correctOptionId: 'why-who', explanation: 'Start with the user and problem. “Add AI” is a proposed solution, not a complete business requirement.' },
      { id: 'criteria', prompt: 'Which acceptance criterion is most useful?', options: [
        { id: 'measurable', label: 'A clear, testable statement describing the expected user outcome and how the team will verify it.' },
        { id: 'vague', label: 'The AI feature should be smart and easy to use.' },
        { id: 'implementation', label: 'The system should use whichever technology the developer prefers.' },
      ], correctOptionId: 'measurable', explanation: 'Acceptance criteria should be observable and testable, not subjective adjectives or premature implementation decisions.' },
      { id: 'scope', prompt: 'The stakeholder cannot confirm data-access permissions. What should you do?', options: [
        { id: 'flag-dependency', label: 'Record data access as an open dependency, involve the data/privacy owner and avoid promising a feature that assumes unapproved access.' },
        { id: 'use-any-data', label: 'Use all available employee data because the request came from a department head.' },
        { id: 'ignore-risk', label: 'Leave the data dependency out of the requirement so the sprint can start.' },
      ], correctOptionId: 'flag-dependency', explanation: 'Data access, privacy and security are delivery dependencies. Make them visible before committing to a solution.' },
    ],
    deliverableTitle: 'Draft a discovery note and user story',
    deliverablePrompt: 'Summarise the user problem, affected users, current workflow, questions still open, one draft user story, two testable acceptance criteria and the data/privacy dependency.',
    rubric: ['Defines the problem before proposing a solution.', 'Identifies users and current workflow.', 'Uses testable acceptance criteria.', 'Makes dependencies and assumptions visible.'],
  },

  {
    slug: 'project-delivery-plan-recovery',
    title: 'The delivery plan starts slipping',
    role: 'Junior Project Coordinator',
    careerTrack: 'Project Management',
    level: 'Beginner',
    duration: '35–45 min',
    workplace: 'You coordinate a small digital-service project with a project manager, designer, two developers and an external integration provider.',
    brief: 'The team planned to pilot a new student request portal on Friday. On Tuesday morning, the external integration provider reports a two-day delay, the test dataset is incomplete and the designer has not approved the final mobile flow. A department stakeholder asks whether Friday is still guaranteed. Your project manager is in a steering meeting and asks you to prepare an evidence-based status update and recovery options. Do not hide risks or promise a date the team has not validated.',
    objective: 'Practise schedule tracking, dependency management, risk escalation, scope control and clear stakeholder reporting.',
    dayPlan: [
      { time: '09:00', activity: 'Review the project brief, milestone plan, owners and previous status update.' },
      { time: '09:20', activity: 'Confirm the integration delay, test-data gap and pending design approval with their owners.' },
      { time: '10:00', activity: 'Map which milestones and downstream tasks are affected by each dependency.' },
      { time: '11:00', activity: 'Prepare recovery options, decision points and a refreshed risk/issue log.' },
      { time: '12:00', activity: 'Send a concise status update that distinguishes confirmed facts from estimates.' },
    ],
    questions: [
      {
        id: 'validate-status',
        prompt: 'What should you do first before telling the stakeholder whether Friday is still achievable?',
        options: [
          { id: 'confirm-evidence', label: 'Confirm the current status, owner, expected resolution and downstream dependency for each blocker, then compare the evidence with the approved plan.' },
          { id: 'promise-friday', label: 'Confirm Friday immediately to protect stakeholder confidence.' },
          { id: 'move-everything', label: 'Move every task by two days without checking which tasks depend on the integration.' },
        ],
        correctOptionId: 'confirm-evidence',
        explanation: 'A coordinator should validate status with task owners and trace dependencies before communicating a schedule impact. A reported delay does not automatically move every task by the same amount.',
      },
      {
        id: 'scope-pressure',
        prompt: 'A stakeholder suggests skipping mobile testing so the team can keep Friday. What is the most responsible response?',
        options: [
          { id: 'assess-tradeoff', label: 'Record the proposal, assess user and quality risks with the delivery team, and ask the authorised project manager and product owner to approve any scope or release trade-off.' },
          { id: 'skip-testing', label: 'Remove mobile testing from the plan and update the launch date as confirmed.' },
          { id: 'ignore-testing', label: 'Leave the testing milestone unchanged in the plan but quietly do not complete it.' },
        ],
        correctOptionId: 'assess-tradeoff',
        explanation: 'Scope and quality changes require transparent impact assessment and approval. Do not silently remove a control or represent an unapproved change as agreed.',
      },
      {
        id: 'recovery-options',
        prompt: 'Which recovery option is most useful to present to the project manager?',
        options: [
          { id: 'options-with-impact', label: 'Present realistic options with their schedule, quality, resource and dependency impacts, naming the decision owner for each.' },
          { id: 'work-overtime', label: 'Tell the team to work overtime until Friday without checking capacity or approval.' },
          { id: 'change-baseline', label: 'Change the baseline date in the project tracker so the project appears on schedule.' },
        ],
        correctOptionId: 'options-with-impact',
        explanation: 'A useful recovery proposal makes trade-offs visible and leaves authorised decisions with the correct owner. Updating the plan must reflect an approved decision, not conceal variance.',
      },
      {
        id: 'stakeholder-update',
        prompt: 'What should your stakeholder update say while the recovery options are still being reviewed?',
        options: [
          { id: 'transparent-update', label: 'State the current risks, confirmed blockers, affected milestones, actions and owners, the decision still required and when the next update will be sent.' },
          { id: 'vague-update', label: 'Say the project is progressing well and the team is handling a few small issues.' },
          { id: 'blame-provider', label: 'Blame the external provider and say the internal team has no responsibility for the outcome.' },
        ],
        correctOptionId: 'transparent-update',
        explanation: 'Good reporting is timely, factual and action-oriented. It should identify what is known, what remains uncertain, who owns the next action and when stakeholders will hear more.',
      },
    ],
    deliverableTitle: 'Prepare a project status and recovery update',
    deliverablePrompt: 'Write a short project update that includes overall status, completed work, the three current blockers, affected milestones and dependencies, owners and next actions, two realistic recovery options with trade-offs, the decision required, and the next update time. Separate confirmed facts from estimates.',
    rubric: [
      'Reports progress and blockers accurately without hiding schedule variance.',
      'Connects each blocker to its owner, dependency and affected milestone.',
      'Presents realistic recovery options and makes scope/quality trade-offs explicit.',
      'Identifies decision ownership and gives stakeholders a clear next update time.',
    ],
  },
];

export function getWorkSimulation(slug: string) {
  return WORK_SIMULATIONS.find((simulation) => simulation.slug === slug);
}
