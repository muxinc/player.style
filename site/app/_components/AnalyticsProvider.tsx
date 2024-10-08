'use client';

import { Suspense } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import dynamic from 'next/dynamic';

const PostHogPageView = dynamic(() => import('@/app/_components/PostHogPageView'), {
  ssr: false,
});

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: 'always', // 'always' to create profiles for anonymous users
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    capture_pageleave: true, // Enable pageleave capture
  });
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <Suspense>
        <PostHogPageView />
      </Suspense>
      <VercelAnalytics />
      {children}
    </PostHogProvider>
  );
}
