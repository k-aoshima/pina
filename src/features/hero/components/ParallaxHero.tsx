import { HeroTitle } from './HeroTitle'
import { ScrollCTA } from './ScrollCTA'
import { Label } from '../../../components/ui/Label'
import { FallingModelsScene } from '../../../components/three/FallingModelsScene'

export function ParallaxHero() {
  return (
    <section className="relative min-h-screen bg-pina-yellow px-4 py-12 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <FallingModelsScene />

      <div className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center gap-8">
        <Label tilted className="text-lg">
          FALL INTO FUN!!
        </Label>

        <HeroTitle />
        <ScrollCTA />
      </div>
    </section>
  )
}
