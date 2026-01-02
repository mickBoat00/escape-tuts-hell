import { Sparkles } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import TutorialUploader from './TutorialUploader'

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden mesh-background-subtle">
      <div className="container mx-auto px-4 py-24 md:pb-32 md:pt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20 animate-float">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card hover-glow mb-8 animate-shimmer">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                AI-Powered Coding Tutorials Processing
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight">
              <span className="gradient-emerald-text">Escape Tutorial Hell </span>
              
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Do not watch someone else do the heavy lifting while your brain sits in the passenger seat.
            </p>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Upload a coding Tutorial and be guided to do the work.
            </p>
          </div>
        </div>
        <div className="space-y-6">
            <div className="glass-card-strong rounded-2xl p-8 hover-lift">
            <TutorialUploader/>
            </div>
            <div className="text-center">
                <Button variant="outline" size="lg" className="hover-glow cursor-pointer">
                    View Uploded Tutorials
                </Button>
            </div>
        </div>
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div
        className="absolute bottom-0 left-0 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
        style={{ animationDelay: "1s" }}
      ></div>
    </section>
  )
}

export default HeroSection
