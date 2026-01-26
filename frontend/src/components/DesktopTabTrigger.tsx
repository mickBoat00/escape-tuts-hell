import type { Tutorial } from '@/lib/types';
import { TabsTrigger } from '@radix-ui/react-tabs';
import { AlertCircle, Lock } from 'lucide-react';
import React from 'react'

export interface TabConfig {
  value: string;
  label: string;
  errorKey?: string;
//   feature?: FeatureName;
}

interface TabTriggerItemProps {
  tab: TabConfig;
  tutorial: Tutorial ;
}

const DesktopTabTrigger = ({ tab, tutorial }: TabTriggerItemProps) => {

    const hasError = tab.errorKey
        // tab.errorKey &&
        // tutorial.jobErrors?.[tab.errorKey as keyof typeof tutorial.jobErrors];

    return (
        <TabsTrigger
        value={tab.value}
        className="flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl data-[state=active]:bg-linear-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-400 data-[state=active]:text-white transition-all font-semibold whitespace-nowrap"
        >
        {tab.label}
        {hasError && <AlertCircle className="h-4 w-4 text-destructive" />}
        </TabsTrigger>
    );
}

export default DesktopTabTrigger
