import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold">홈</h1>
      </main>
    </div>
  );
}
