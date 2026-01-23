import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import api from "@/lib/axios"

type Tutorial = {
  _id: string
  fileName: string
  status: string
}

export const Route = createFileRoute("/tutorials/")({
  component: TutorialsPage,
})

function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const response = await api.get("/tutorials")
        console.log("API response:", response.data);
        setTutorials(response.data)
      } catch (err) {
        setError("Failed to load tutorials")
      } finally {
        setLoading(false)
      }
    }

    fetchTutorials()
  }, [])

  if (loading) return <p>Loading tutorials...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Tutorials</h1>

      <ul className="space-y-2">
        {tutorials.map((t) => (
          <li key={t._id} className="flex items-center gap-2">
            <Link
              to="/tutorials/$tutorialId"
              params={{ tutorialId: t._id }}
              className="text-blue-600 hover:underline"
            >
              {t.fileName}
            </Link>

            <span className="text-sm text-gray-500">
              ({t.status})
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
