import { createFileRoute } from "@tanstack/react-router"
// import { createFileRoute, Link } from "@tanstack/react-router"
// import { useEffect, useState } from "react"
// import api from "@/lib/axios"
// import { Button } from "@/components/ui/button"
// import { Upload } from "lucide-react"
// import TutorialCard from "@/components/TutorialCard"

// type Tutorial = {
//   _id: string
//   fileName: string
//   status: string
// }

export const Route = createFileRoute("/tutorials/")({
  component: TutorialsPage,
})

function TutorialsPage () {
  return <p>Tutorials Page</p>
}


// function TutorialsPage() {
//   const [tutorials, setTutorials] = useState<Tutorial[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const fetchTutorials = async () => {
//       try {
//         const response = await api.get("/tutorials")
//         console.log("API response:", response.data);
//         setTutorials(response.data)
//       } catch (err) {
//         setError("Failed to load tutorials")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchTutorials()
//   }, [])

  
//   if (error) return <p className="text-red-500">{error}</p>

//   return (
//     <div className="container max-w-6xl mx-auto py-10 px-12 xl:px-0">
//       <div className="mb-12">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
//           <div>
//             <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
//               Uploaded <span className="gradient-emerald-text">Tutorials</span>
//             </h1>
//             <p className="text-lg text-gray-600">
//               View all your uploaded tutorials
//             </p>
//           </div>
//           <a href="/">
//             <Button className="gradient-emerald text-white hover-glow shadow-lg px-6 py-6 text-base">
//               <Upload className="mr-2 h-5 w-5" />
//               New Upload
//             </Button>
//           </a>
//         </div>
//       </div>

//       {loading &&<p>Loading tutorials...</p>  }

//       { tutorials.map((tutorial) => (
//         <TutorialCard tutorial={tutorial} />

//       ))}


      
//     </div>
//   )

//   return (
//     <div className="space-y-6">
//       <h1 className="text-xl font-semibold">Tutorials</h1>

//       <ul className="space-y-2">
//         {tutorials.map((t) => (
//           <li key={t._id} className="flex items-center gap-2">
//             <Link
//               to="/tutorials/$tutorialId"
//               params={{ tutorialId: t._id }}
//               className="text-blue-600 hover:underline"
//             >
//               {t.fileName}
//             </Link>

//             <span className="text-sm text-gray-500">
//               ({t.status})
//             </span>
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }
