import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Button } from '../components/ui/button'
import { Sparkles } from 'lucide-react'

const RootLayout = () => (
  <>
   <header className='gradient-emerald sticky top-0 transition-all shadow-xl backdrop-blur-sm z-50 border-b border-white/10'>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/">
            <div className="flex items-center gap-2 lg:gap-8">
              <div
                className="flex items-center cursor-pointer gap-2.5 hover:opacity-90 transition-all duration-300 group"
              >
                <div
                  className="p-2 rounded-xl bg-white/95 group-hover:bg-white group-hover:scale-110 group-hover:shadow-xl transition-all duration-300"
                >
                  <Sparkles
                    className= "h-5 w-5 text-emerald-600 group-hover:rotate-12 transition-transform duration-300"
                  />
                </div>
                <span
                  className="text-xl font-bold text-white tracking-tight"
                  >
                  Esc
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 lg:gap-3">
            <Link to="/tutorials">
              <Button className="cursor-pointer bg-white/95 text-emerald-600 hover:bg-white hover:scale-105 shadow-lg font-semibold transition-all duration-300">
                Tutorials
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </header>
    <Outlet />
    <TanStackRouterDevtools />
  </>
)

export const Route = createRootRoute({ component: RootLayout })