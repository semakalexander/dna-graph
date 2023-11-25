import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-shark flex min-h-screen flex-col items-center justify-center text-white">
      <Link href="/graph" className="text-3xl text-white">
        Graph
      </Link>
    </main>
  );
}
