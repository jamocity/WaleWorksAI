import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWorkSimulation } from '@/lib/work-simulations';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Please sign in again before submitting this simulation.' }, { status: 401 });

  let body: { simulationSlug?: unknown; answers?: unknown; deliverable?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'The submission could not be read. Refresh the page and try again.' }, { status: 400 });
  }

  const slug = typeof body.simulationSlug === 'string' ? body.simulationSlug : '';
  const simulation = getWorkSimulation(slug);
  if (!simulation) return NextResponse.json({ error: 'That workday simulation does not exist.' }, { status: 404 });

  const answers = body.answers && typeof body.answers === 'object' && !Array.isArray(body.answers)
    ? body.answers as Record<string, unknown>
    : {};
  const deliverable = typeof body.deliverable === 'string' ? body.deliverable.trim() : '';
  if (deliverable.length < 40 || deliverable.length > 8000) {
    return NextResponse.json({ error: 'Your written deliverable must be between 40 and 8,000 characters.' }, { status: 400 });
  }

  const invalidAnswer = simulation.questions.find((question) => {
    const answer = answers[question.id];
    return typeof answer !== 'string' || !question.options.some((option) => option.id === answer);
  });
  if (invalidAnswer) return NextResponse.json({ error: `Choose a valid response for: ${invalidAnswer.prompt}` }, { status: 400 });

  const questionResults = simulation.questions.map((question) => {
    const selectedId = answers[question.id] as string;
    const selected = question.options.find((option) => option.id === selectedId);
    const correctOption = question.options.find((option) => option.id === question.correctOptionId);
    return {
      id: question.id,
      prompt: question.prompt,
      correct: selectedId === question.correctOptionId,
      chosenLabel: selected?.label ?? '',
      correctLabel: correctOption?.label ?? '',
      explanation: question.explanation,
    };
  });
  const correctCount = questionResults.filter((item) => item.correct).length;
  const score = Math.round((correctCount / questionResults.length) * 100);
  const feedback = {
    type: 'rule_based_learning_feedback',
    disclaimer: 'This is automated practice feedback based on a published answer key. It is not AI-generated, human-verified, professional certification or proof of workplace employment.',
    questionResults,
    deliverableRubric: simulation.rubric,
    deliverableReview: 'The written deliverable was saved. Compare it against the checklist; this version does not automatically grade free-text responses.',
  };

  const { data: inserted, error: insertError } = await supabase.from('work_simulation_attempts').insert({
    user_id: user.id,
    simulation_slug: simulation.slug,
    career_track: simulation.careerTrack,
    responses: { selectedOptions: answers, writtenDeliverable: deliverable },
    score,
    feedback,
    status: 'submitted',
  }).select('id').single();

  if (insertError) {
    if (insertError.code === '42P01' || insertError.code === 'PGRST205') {
      return NextResponse.json({ error: 'The simulations database update has not been installed yet. Run supabase/migrations/20261108_career_simulations.sql in your Supabase SQL Editor, then retry.' }, { status: 503 });
    }
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ attemptId: inserted.id, score, correctCount, total: questionResults.length, questionResults });
}
