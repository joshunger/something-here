'use client';

import dynamic from 'next/dynamic';

const AsyncPanel = dynamic(() => import('./AsyncPanel'), { ssr: false });

export default function AsyncSlot() {
  return <AsyncPanel />;
}
