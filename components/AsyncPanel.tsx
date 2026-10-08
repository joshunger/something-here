'use client';

import sharedStyles from './shared.module.css';
import asyncStyles from './async-only.module.css';

export default function AsyncPanel() {
  return <div className={`${asyncStyles.asyncOnly} ${sharedStyles.shared}`}>async</div>;
}
