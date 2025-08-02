import React from 'react';
import { ProtectedPage } from '@/components/ProtectedPage';
import { TranscriptManager } from '@/components/roleplay/TranscriptManager';

const TranscriptHistory: React.FC = () => {
  return (
    <ProtectedPage pageId="transcript-history">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transcript History</h1>
          <p className="text-muted-foreground">
            View, search, and export transcripts from all your roleplay sessions.
          </p>
        </div>
        
        <TranscriptManager />
      </div>
    </ProtectedPage>
  );
};

export default TranscriptHistory;