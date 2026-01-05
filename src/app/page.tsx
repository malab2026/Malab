import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/navbar"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-[80vh] px-4">
        <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-5 duration-700">
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight">
            Book Your Pitch. <span className="text-green-500">Own the Game.</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-300">
            The easiest way to find and book top-rated football fields near you.
            Instant confirmation, easy payments.
          </p>
          <div className="flex gap-4 justify-center pt-8">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6 bg-green-500 hover:bg-green-600 text-white border-0">
                Get Started
              </Button>
            </Link>
            <Link href="/fields">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 text-black bg-white hover:bg-gray-100 border-0">
                Browse Fields
              </Button>
            </Link>
          </div>
          <div className="pt-4 text-gray-400">
            Already have an account? <Link href="/login" className="text-green-400 hover:text-green-300 underline">Login here</Link>
          </div>
        </div>
      </section>

    </main>
  )
}
