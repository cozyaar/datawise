'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InvestigateView } from '@/components/InvestigateView';

function InvestigateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const handleNavigateToScenario = (ctx: {
    courseId?: number;
    courseCode?: string;
    sessionId: number;
    scenarioType: string;
    note?: string;
  }) => {
    const params = new URLSearchParams({
      sessionId: String(ctx.sessionId),
      scenarioType: ctx.scenarioType,
    });
    if (ctx.courseId) params.set('courseId', String(ctx.courseId));
    if (ctx.courseCode) params.set('courseCode', ctx.courseCode);
    if (ctx.note) params.set('note', ctx.note);

    router.push(`/scenarios?${params.toString()}`);
  };

  return (
    <div className="pb-12">
      <InvestigateView
        initialQuestion={initialQ}
        onNavigateToScenarioWithInsight={handleNavigateToScenario}
      />
    </div>
  );
}

export default function InvestigatePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Loading investigation engine...</div>}>
      <InvestigateContent />
    </Suspense>
  );
}
