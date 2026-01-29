import ErrorRetryCard from "../ErrorRetryCard";
import TabSkeleton from "./TabSkeleton";

interface TabContentWrapperProps {
    tutorialId: string;
    isLoading?: boolean;
    jobName: string;
    error?: string;
    isRetrying: boolean;
    onRetry: ()=> void;
    children: React.ReactNode;
}


const TabContentWrapper = ({ 
    tutorialId, 
    isLoading, 
    jobName, 
    error, 
    isRetrying, 
    onRetry, 
    children 
}: TabContentWrapperProps) => {

    if (isLoading) {
        return (
            <TabSkeleton    />
        );
    }

  return (
    <div>
      {error ? (
        <ErrorRetryCard 
            tutorialId={tutorialId} 
            job={jobName} 
            errorMessage={error}
            isRetrying={isRetrying}
            onRetry={onRetry} 
            />
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}

export default TabContentWrapper
