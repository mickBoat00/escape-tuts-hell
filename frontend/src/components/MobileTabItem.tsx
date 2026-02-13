import type { TabConfig, Tutorial } from "@/lib/types";
import { SelectItem } from "@radix-ui/react-select";
import { AlertCircle } from "lucide-react";

interface TabTriggerItemProps {
  tab: TabConfig;
  tutorial: Tutorial
}


const MobileTabItem = ({ tab, tutorial }: TabTriggerItemProps) => {
  const hasError =
    tab.errorKey &&
    tutorial.jobError?.[tab.errorKey as keyof typeof tutorial.jobError];

  return (
    <SelectItem 
      value={tab.value}
      className="
        relative flex items-center gap-2 px-4 py-3 
        cursor-pointer select-none
        text-sm text-gray-900 dark:text-gray-100
        hover:bg-emerald-50 dark:hover:bg-emerald-900/20
        focus:bg-emerald-100 dark:focus:bg-emerald-900/30
        focus:outline-none
        transition-colors
        data-[highlighted]:bg-emerald-50 dark:data-[highlighted]:bg-emerald-900/20
        data-[state=checked]:bg-emerald-100 dark:data-[state=checked]:bg-emerald-900/40
        data-[state=checked]:font-semibold
      "
    >
      <span className="flex items-center gap-2 flex-1">
        {tab.label}
        {hasError && <AlertCircle className="h-4 w-4 text-destructive" />}
      </span>
    </SelectItem>
  );
}

export default MobileTabItem