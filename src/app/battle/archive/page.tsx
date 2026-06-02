import Link from "next/link";
import { fetchNations } from "@/lib/stats";
import { getArchive } from "@/lib/host-battle";
import { formatNumber } from "@/lib/utils";
import { FlagBadge } from "@/components/FlagArt";

export const revalidate = 60;

export const metadata = {
  title: "Host Region Battle · Archive · FanMap",
  description: "Past daily winners of the combined host region — USA, Canada and Mexico."
};

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });
}

export default async function ArchivePage() {
  const nations = await fetchNations();
  const archive = await getArchive(nations, 60);
  const isSample = archive.some((a) => a.isSample);

  return (
    <section className="container-wide pt-10 pb-20">
      <div className="max-w-2xl">
        <Link href="/battle" className="text-xs text-white/55 hover:text-white">
          ← Back to today's battle
        </Link>
        <div className="mt-4 chip">Host Region Battle · Archive</div>
        <h1 className="mt-3 h-display text-4xl sm:text-5xl font-bold tracking-tight">
          Every day the region changed hands.
        </h1>
        <p className="mt-3 text-white/65">
          The combined host region — USA · Canada · Mexico — crowns one winner per day. This is the
          full history, not a per-country split.
        </p>
        {isSample && (
          <p className="mt-2 text-[11px] text-white/35">
            Showing sample archive data for preview. Real winners appear once daily battles are
            archived.
          </p>
        )}
      </div>

      <div className="mt-10 space-y-3">
        {archive.length === 0 && (
          <div className="glass rounded-3xl ring-soft p-6 text-white/55">No archived battles yet.</div>
        )}

        {archive.map((entry) => (
          <div key={entry.date} className="glass rounded-3xl ring-soft p-5 sm:p-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-sm text-white/45 tabular-nums w-28">{formatDate(entry.date)}</div>

              {entry.winner ? (
                <div className="flex items-center gap-3">
                  <FlagBadge slug={entry.winner.slug} w={40} h={27} />
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/45">
                      Winner{entry.isSample ? " · sample" : ""}
                    </div>
                    <div className="font-semibold">{entry.winner.name}</div>
                  </div>
                </div>
              ) : (
                <div className="text-white/55">No winner recorded</div>
              )}

              <div className="ml-auto text-xs text-white/45 tabular-nums">
                {formatNumber(entry.totalVotes)} check-ins
              </div>
            </div>

            {entry.results.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {entry.results.map((r) => (
                  <span
                    key={r.team.slug}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs glass"
                  >
                    <FlagBadge slug={r.team.slug} w={20} h={14} />
                    {r.team.name}
                    <span className="text-white/45 tabular-nums">{formatNumber(r.votes)}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
