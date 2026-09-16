'use client';

import { useEffect } from 'react';

export default function ClarityInit() {
  useEffect(() => {
    // Only run in production build and outside localhost
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (process.env.NODE_ENV !== 'production' || isLocalhost) {
      return;
    }

    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || 'yis3quivul';
    if (!projectId || document.getElementById('clarity-script')) return;

    const s = document.createElement('script');
    s.id = 'clarity-script';
    s.async = true;
    s.src = `https://www.clarity.ms/tag/${projectId}`;
    document.head.appendChild(s);
  }, []);

  return null;
}