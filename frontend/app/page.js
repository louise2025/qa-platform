import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Programming Q&A Platform</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Browse Channels</h2>
          <p className="mb-4">Explore programming topics and join discussions.</p>
          <Link href="/channels" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            View Channels
          </Link>
        </div>

        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Ask a Question</h2>
          <p className="mb-4">Need help with a programming problem? Ask our community.</p>
          <Link
            href="/auth/login"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}

