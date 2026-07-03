import React from 'react';
import { StatsCards } from '@/components/stats-cards';

export function PhoneReport() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <StatsCards variant="modern" />
      </div>
    </div>
  );
}