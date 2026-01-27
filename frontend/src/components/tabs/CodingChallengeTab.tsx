// import type { CodingChallengeOutput } from '@/lib/types'
// import React from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
// import { AlertCircle, Badge, BookOpen, CheckCircle2, Clock, Code, ExternalLink, Lightbulb, Shield, Target } from 'lucide-react';
// import { Separator } from '@radix-ui/react-select';

// interface CodingChallengeTabProps {
//     challenge?: CodingChallengeOutput;
// }

// const CodingChallengeTab = ({ challenge }: CodingChallengeTabProps) => {
//     if (!challenge) {
//     return (
//       <div className="py-12 text-center">
//         <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//         <p className="text-muted-foreground">No coding challenge available</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-12">
//       {/* Header Section */}
//       <div className="space-y-4">
//         <div className="flex flex-wrap items-start justify-between gap-4">
//           <h1 className="text-3xl font-bold text-foreground flex-1">
//             {challenge.challenge_title}
//           </h1>
//           {/* <div className="flex flex-wrap gap-2">
//             <Badge className={getDifficultyColor(challenge.difficulty_level)}>
//               {challenge.difficulty_level}
//             </Badge>
//             <Badge variant="outline" className="gap-1">
//               <Clock className="h-3 w-3" />
//               {challenge.estimated_time}
//             </Badge>
//           </div> */}
//         </div>

//         <p className="text-base text-muted-foreground leading-relaxed">
//           {challenge.introduction}
//         </p>

//         <div className="space-y-2">
//           <div className="flex items-center gap-2">
//             <Target className="h-5 w-5 text-emerald-600" />
//             <h3 className="font-semibold text-emerald-700">Real-World Relevance</h3>
//           </div>
//           <p className="text-sm text-muted-foreground leading-relaxed pl-7">
//             {challenge.real_world_relevance}
//           </p>
//         </div>
//       </div>

//       {/* Background Section */}
//       <div className="space-y-4">
//         <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
//           <BookOpen className="h-5 w-5 text-emerald-600" />
//           Background
//         </h2>

//         <p className="text-sm text-muted-foreground leading-relaxed">
//           {challenge.background}
//         </p>

//         {/* <div>
//           <h4 className="font-semibold mb-2 text-sm">Key Concepts</h4>
//           <div className="flex flex-wrap gap-2">
//             {challenge.background.key_concepts.map((concept, idx) => (
//               <Badge key={idx} variant="secondary" className="text-xs">
//                 {concept}
//               </Badge>
//             ))}
//           </div>
//         </div> */}

//         {/* {challenge.background.resources.length > 0 && (
//           <div>
//             <h4 className="font-semibold mb-3 text-sm">Resources</h4>
//             <div className="space-y-2">
//               {challenge.background.resources.map((resource, idx) => (
//                 <a
//                   key={idx}
//                   href={resource.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="block p-3 rounded-lg border border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors group"
//                 >
//                   <div className="flex items-start justify-between gap-2">
//                     <div className="flex-1 min-w-0">
//                       <h5 className="font-medium text-sm group-hover:text-emerald-600 transition-colors">
//                         {resource.title}
//                       </h5>
//                       <p className="text-xs text-muted-foreground mt-1">
//                         {resource.description}
//                       </p>
//                     </div>
//                     <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 transition-colors flex-shrink-0" />
//                   </div>
//                 </a>
//               ))}
//             </div>
//           </div>
//         )} */}
//       </div>

//       {/* Steps Section */}
//       <div className="space-y-10">
//         <h2 className="text-2xl font-bold text-foreground">The Challenge</h2>
        
//         {challenge.steps.map((step, idx) => (
//           <div key={idx} className="space-y-4">
//             {/* Step Header */}
//             <div>
//               <h3 className="text-xl font-bold text-foreground mb-1">
//                 Step {step.step_number}
//                 {step.step_number === 0 && ' (Setup)'}
//               </h3>
//               <h4 className="text-lg font-semibold text-muted-foreground">
//                 {step.title}
//               </h4>
//             </div>

//             {/* Goal */}
//             <p className="text-sm =leading-relaxed">
//               {step.goal}
//             </p>

//             {/* Test Cases - Max 3 */}
//             {step.test_cases.length > 0 && (
//               <div className="space-y-4">
//                 {step.test_cases.slice(0, 3).map((testCase, testIdx) => (
//                   <div key={testIdx} className="space-y-2">
//                     <p className="text-sm font-medium">{testCase.description}</p>
                    
//                     <div>
//                       <p className="text-xs text-muted-foreground mb-1.5">Command:</p>
//                       <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
//                         <code>{testCase.command}</code>
//                       </pre>
//                     </div>

//                     <div>
//                       <p className="text-xs text-muted-foreground mb-1.5">
//                         Expected Output:
//                       </p>
//                       <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
//                         <code>{testCase.expected_output}</code>
//                       </pre>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Going Further Section - Single Item */}
//       {challenge.going_further.length > 0 && (
//         <div className="space-y-3">
//             <h2 className="text-xl font-bold text-foreground">Going Further</h2>

//             <div className="space-y-2">
//             {challenge.going_further.slice(0, 3).map((item, index) => (
//                 <div key={index} className="space-y-1">
//                 <div className="flex items-start justify-between gap-2">
//                     <h4 className="font-semibold">{item.title}</h4>
//                 </div>

//                 <p className="text-sm text-muted-foreground leading-relaxed">
//                     {item.description}
//                 </p>
//                 </div>
//             ))}
//             </div>
//         </div>
//         )}


//       {/* Final Deliverable */}
//       <div className="space-y-3">
//         <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
//           <CheckCircle2 className="h-5 w-5 text-emerald-600" />
//           Final Deliverable
//         </h2>
//         <p className="text-sm text-muted-foreground leading-relaxed">
//           {challenge.final_deliverable}
//         </p>
//       </div>
//     </div>
//   );
// }


const CodingChallengeTab = () => {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No coding challenge available</p>
      </div>
    );
}

export default CodingChallengeTab
