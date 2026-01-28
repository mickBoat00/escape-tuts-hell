import ErrorRetryCard from "../ErrorRetryCard";

interface StimulateRetryProps {
    error?: string;
    children: React.ReactNode;
}

const StimulateRetry = ({ error, children }: StimulateRetryProps) => {

    if (error) {
        return <ErrorRetryCard tutorialId="1" job="sim" errorMessage={error}/>
    }
    
    return (
        <div>
        {children}
        </div>
    )
}

export default StimulateRetry
