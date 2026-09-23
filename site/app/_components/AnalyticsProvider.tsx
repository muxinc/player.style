'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

import PostHogPageView from './PostHogPageView';

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (typeof window !== 'undefined' && posthogKey) {
  posthog.init(posthogKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: 'always', // create profiles for anonymous users too
    capture_pageview: false, // pageviews are captured manually by PostHogPageView
    capture_pageleave: true,
  });
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PostHogProvider>
  );
}
