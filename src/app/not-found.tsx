import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-wide py-24">
      <div className="max-w-xl">
        <div className="chip">404</div>
        <h1 className="mt-3 h-display text-5xl font-bold tracking-tight">
          This territory isn't on the FanMap.
        </h1>
        <p className="mt-3 text-white/65">
          The page you tried to reach doesn't exist (yet). Maybe your nation is still waiting
          for you to start expanding the flag.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/" className="btn-primary">Back to the FanMap</Link>
          <Link href="/join" className="btn-ghost">Choose your nation</Link>
        </div>
      </div>
    </section>
  );
}
