'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ScenarioLabView, InsightContext, ScenarioType } from '@/components/ScenarioLabView';

function ScenarioLabContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get('sessionId');
  const courseId = searchParams.get('courseId');
  const courseCode = searchParams.get('courseCode');
  const scenarioType = (searchParams.get('scenarioType') as ScenarioType) || 'tutoring_intervention';
  const note = searchParams.get('note') || undefined;

  const insightContext: InsightContext | null = sessionId
    ? {
        sessionId: parseInt(sessionId, 10),
        courseId: courseId ? parseInt(courseId, 10) : undefined,
        courseCode: courseCode || undefined,
        scenarioType: scenarioType || 'tutoring_intervention',
        note,
      }
    : null;

  const handleClear = () => {
    router.push('/scenarios');
  };

  return (
    <div className="pb-12">
      <ScenarioLabView
        insightContext={insightContext}
        onClearInsightContext={handleClear}
      />
    </div>
  );
}

export default function ScenariosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Loading Scenario Lab...</div>}>
      <ScenarioLabContent />
    </Suspense>
  );
}
