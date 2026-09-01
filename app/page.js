export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 text-gray-900">
      <div className="z-10 w-full max-w-5xl items-center justify-center text-center flex flex-col space-y-6">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-blue-600">
          Skill Exchange
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl">
          Exchange skills, not money.
        </p>
        <div className="pt-8">
          <button className="rounded-full bg-blue-600 px-8 py-3.5 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </main>
  );
}
