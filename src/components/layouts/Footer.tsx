export function Footer() {
  const items = ["PINATOY'S", 'COLLECT JOY.', 'FALL INTO FUN!!']
  const repeated = [...items, ...items]

  return (
    <footer className="border-t-4 border-black bg-pina-yellow py-6">
      <div className="mx-auto max-w-6xl px-4">
        <div className="overflow-hidden">
          <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-sm font-bold uppercase text-black md:text-base">
            {repeated.map((text, i) => (
              <span key={i}>{text}</span>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-xs font-medium text-black/70">
          © PinaToy's. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
