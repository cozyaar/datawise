'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HistoryView } from '@/components/HistoryView';

export default function HistoryPage() {
  const router = useRouter();

  const handleLoadSession = (question: string) => {
    router.push(`/investigate?q=${encodeURIComponent(question)}`);
  };

  return (
    <div className="pb-12">
      <HistoryView onLoadSessionInInvestigate={handleLoadSession} />
    </div>
  );
}
