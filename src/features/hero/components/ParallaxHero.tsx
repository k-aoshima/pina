import { HeroTitle } from './HeroTitle'
import { ScrollCTA } from './ScrollCTA'
import { Label } from '../../../components/ui/Label'
import { FallingModelsScene } from '../../../components/three/FallingModelsScene'

export function ParallaxHero() {
  return (
    <section className="relative min-h-screen overflow-x-hidden overflow-y-hidden bg-pina-yellow px-3 py-12 sm:px-4 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <FallingModelsScene />

      <div className="relative z-10 flex min-h-[80vh] w-full max-w-full flex-col items-center justify-center gap-6 px-1 sm:gap-8 sm:px-0">
        <Label tilted className="text-base sm:text-lg">
          FALL INTO FUN!!
        </Label>

        <div className="w-full max-w-full min-w-0 overflow-hidden">
          <HeroTitle />
        </div>
        <ScrollCTA />
      </div>
    </section>
  )
}
