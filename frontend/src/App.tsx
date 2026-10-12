import { Button } from '@/components/ui/button'

function App() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold">Letterboxd Clone</h1>
      <p className="text-muted-foreground max-w-md">
        Track the movies you&apos;ve watched, rate them, and keep personal notes. Search for a
        movie to get started.
      </p>
      <Button>Search movies</Button>
    </main>
  )
}

export default App
