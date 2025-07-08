'use client';

import { useState } from 'react';

interface QuizResultsDebugProps {
  quizId: string;
}

export function QuizResultsDebug({ quizId }: QuizResultsDebugProps) {
  console.log('QuizResultsDebug: Component initializing with quizId:', quizId);

  try {
    console.log('QuizResultsDebug: About to import useRouter');
    const { useRouter } = require('next/navigation');
    console.log('QuizResultsDebug: useRouter imported successfully');

    console.log('QuizResultsDebug: About to call useRouter()');
    const router = useRouter();
    console.log('QuizResultsDebug: useRouter() called successfully', router);

    return (
      <div className="border border-green-500 p-4">
        <h2>Debug: Router Hook Test</h2>
        <p>✅ Router hook initialized successfully</p>
        <p>Quiz ID: {quizId}</p>
      </div>
    );
  } catch (error) {
    console.error('QuizResultsDebug: Error with router hook:', error);
    return (
      <div className="border border-red-500 p-4">
        <h2>Debug: Router Hook Test</h2>
        <p>
          ❌ Router hook failed:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <p>Quiz ID: {quizId}</p>
      </div>
    );
  }
}
