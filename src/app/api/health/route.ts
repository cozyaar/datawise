import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db';

export async function GET() {
  try {
    const dbHealth = await checkDatabaseHealth();
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
    const demoMode = process.env.DEMO_MODE === 'true';

    return NextResponse.json({
      status: dbHealth.connected ? 'healthy' : 'unhealthy',
      database: dbHealth,
      llm: {
        provider: 'Google Gemini',
        model: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
        hasKey: hasGeminiKey,
        hasApiKey: hasGeminiKey,
        demoMode,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message || 'Health check failed',
      },
      { status: 500 }
    );
  }
}
