import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tutorials/$tutorialId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/tutorials/$tutorialId"!</div>
}
