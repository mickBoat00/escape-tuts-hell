import HeroSection from '@/components/HeroSection'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tutorials')({
  component: Index,
})

function Index() {
  return <h1>lorem100 dkdkkdk dkdkkdk dkdkdkdk ddkdkddk</h1>
}