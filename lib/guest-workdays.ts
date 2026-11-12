import type { SimulationQuestion } from '@/lib/work-simulations';

export type GuestWorkdayScenario = {
  careerTrack: string;
  title: string;
  role: string;
  duration: string;
  brief: string;
  questions: SimulationQuestion[];
};

/** Small guest-only scenarios for career tracks without a full simulation yet. */
export const GUEST_WORKDAY_FALLBACKS: Record<string, GuestWorkdayScenario> = {
  'Technical Writing': {
    careerTrack: 'Technical Writing',
    title: 'The release guide is not ready',
    role: 'Technical Writer',
    duration: '5–7 min guest preview',
    brief: 'A product team is preparing a software release. The draft help article describes a new account-recovery process, but engineering has not confirmed one important step and support has reported that users are confused by the current wording. You need to make the guide useful without inventing details.',
    questions: [
      {
        id: 'tw-facts',
        prompt: 'The draft contains one step that engineering has not verified. What should you do before publishing?',
        options: [
          { id: 'confirm', label: 'Ask the product or engineering owner to verify the step, and mark the detail as pending until confirmed.' },
          { id: 'guess', label: 'Write the most likely instruction so the article can ship on time.' },
          { id: 'remove-all', label: 'Delete the whole account-recovery section without telling the team.' },
        ],
        correctOptionId: 'confirm',
        explanation: 'Technical documentation must be accurate. Confirm uncertain behaviour with the accountable team rather than guessing or silently removing important guidance.',
      },
      {
        id: 'tw-structure',
        prompt: 'Readers say they cannot follow the current guide. Which improvement is most useful?',
        options: [
          { id: 'steps', label: 'Use a clear purpose, prerequisites, numbered steps, expected result and a troubleshooting note.' },
          { id: 'paragraph', label: 'Combine every instruction into one long paragraph to reduce page length.' },
          { id: 'jargon', label: 'Add more internal engineering terms so the guide sounds technical.' },
        ],
        correctOptionId: 'steps',
        explanation: 'Task-oriented structure helps readers understand what they need, what to do and how to recognise success.',
      },
      {
        id: 'tw-review',
        prompt: 'Support asks you to publish immediately, but the verified steps are still being reviewed. What is the best response?',
        options: [
          { id: 'status', label: 'Share the review status, identify the unresolved step and agree on an owner and confirmation time.' },
          { id: 'publish', label: 'Publish the unverified guide and correct it only if a customer complains.' },
          { id: 'block', label: 'Stop all release documentation, including sections that are already verified.' },
        ],
        correctOptionId: 'status',
        explanation: 'A concise status update makes the risk visible and keeps verified material moving while the unresolved detail gets an owner.',
      },
    ],
  },
  'Exploring IT careers': {
    careerTrack: 'Exploring IT careers',
    title: 'Your first cross-team IT handover',
    role: 'IT Career Explorer',
    duration: '5–7 min guest preview',
    brief: 'You are shadowing a small IT team. A colleague reports that a new internal tool is slow, but the cause is not yet known. Your supervisor asks you to help gather useful information and hand it to the right person. This scenario introduces the habits shared across many IT roles.',
    questions: [
      {
        id: 'explore-scope',
        prompt: 'What is the most useful first step when the cause of a problem is unknown?',
        options: [
          { id: 'clarify', label: 'Ask who is affected, what they were trying to do, when it started and what changed.' },
          { id: 'assume', label: 'Assume the server is overloaded and recommend restarting it.' },
          { id: 'ignore', label: 'Wait until several more people complain before recording anything.' },
        ],
        correctOptionId: 'clarify',
        explanation: 'Across IT roles, good work begins with clear evidence: scope, symptoms, timing and relevant context.',
      },
      {
        id: 'explore-evidence',
        prompt: 'You have gathered two user reports. What should you include in your handover?',
        options: [
          { id: 'facts', label: 'Record confirmed facts, steps to reproduce, impact, what has been checked and what remains unknown.' },
          { id: 'opinion', label: 'Write that the application is badly built and needs to be replaced.' },
          { id: 'vague', label: 'Send only “the app is slow” without examples or times.' },
        ],
        correctOptionId: 'facts',
        explanation: 'A useful handover separates evidence from assumptions and gives the next person enough context to continue.',
      },
      {
        id: 'explore-safety',
        prompt: 'A colleague suggests changing production settings to see whether performance improves. You have not been authorised to do that. What should you do?',
        options: [
          { id: 'escalate', label: 'Avoid unauthorised changes, record the suggestion and ask the responsible engineer to decide on a safe test.' },
          { id: 'change', label: 'Make the change quickly and hope it solves the problem.' },
          { id: 'hide', label: 'Make the change but do not mention it in the handover.' },
        ],
        correctOptionId: 'escalate',
        explanation: 'Responsible IT practice respects access boundaries, protects production systems and makes decisions traceable.',
      },
    ],
  },
};
