'use client';

import sharedStyles from './shared.module.css';
import entryStyles from './entry.module.css';

export default function EntryBox() {
  return <div className={`${entryStyles.entry} ${sharedStyles.shared}`}>entry</div>;
}
