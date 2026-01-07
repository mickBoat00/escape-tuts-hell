import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tutorials/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/tutorials/"!</div>
}
