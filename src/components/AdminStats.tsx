import { formatNumber } from "@/lib/utils";

export type AdminPayload = {
  total_supporters: number;
  nations: Array<{
    slug: string;
    name: string;
    emoji: string;
    primary_color: string;
    supporter_count: number;
    share: number;
  }>;
  city_leaderboard: Array<{ nation: string; city: string; count: number }>;
  referrals: Array<{ referrer: string; nation: string; count: number }>;
  shop_clicks: Array<{ product_slug: string; count: number }>;
  recent_supporters: Array<{
    id: string;
    nickname: string;
    nation_name: string;
    nation_emoji: string;
    city: string | null;
    created_at: string;
  }>;
  host_battle: {
    date: string;
    data_source: "real" | "sample";
    votes_are_live: boolean;
    total_fixtures: number;
    real_fixtures: number;
    today_matches: Array<{ a: string; b: string; city: string; venue: string; kickoff: string | null; sample: boolean }>;
    eligible: Array<{ name: string; votes: number; share: number }>;
    total_votes_today: number;
    archive: Array<{ date: string; winner: string; total_votes: number; sample: boolean }>;
  };
  system: {
    supabase_connected: boolean;
    data_source: "real" | "preview" | "missing";
    fixture_count: number;
    first_fixture_date: string | null;
    next_fixture_date: string | null;
    active_matches_today: number;
    missing_flags: number;
    checkout_missing: number;
  };
  shares: {
    total: number;
    by_channel: Array<{ channel: string; count: number }>;
    top_nations: Array<{ nation: string; count: number }>;
  };
};

export function AdminStats({ data }: { data: AdminPayload }) {
  return (
    <div className="container-wide py-10 space-y-8">
      <div>
        <div className="chip">Admin</div>
        <h1 className="mt-2 h-display text-3xl font-bold">FanMap dashboard</h1>
        <p className="text-white/55 text-sm">Operational snapshot. Not public.</p>
      </div>

      <Panel title="System status">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 text-sm">
          <Row label="Supabase" value={data.system.supabase_connected ? "Connected" : "Missing"} ok={data.system.supabase_connected} />
          <Row
            label="Schedule data"
            value={data.system.data_source === "real" ? "Real (Spielplan)" : data.system.data_source}
            ok={data.system.data_source === "real"}
          />
          <Row label="Fixtures loaded" value={`${data.system.fixture_count}`} ok={data.system.fixture_count > 0} />
          <Row label="First fixture" value={data.system.first_fixture_date ?? "—"} />
          <Row label="Next fixture" value={data.system.next_fixture_date ?? "—"} />
          <Row label="Active matches today" value={`${data.system.active_matches_today}`} />
          <Row label="Missing flags" value={`${data.system.missing_flags}`} ok={data.system.missing_flags === 0} />
          <Row label="Checkout not configured" value={`${data.system.checkout_missing}`} warn={data.system.checkout_missing > 0} />
        </div>
      </Panel>

      <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Tile label="Total supporters" value={formatNumber(data.total_supporters)} accent="#5EEAD4" />
        <Tile label="Nations in race" value={`${data.nations.length}`} accent="#A78BFA" />
        <Tile
          label="Top nation"
          value={data.nations[0] ? `${data.nations[0].emoji} ${data.nations[0].name}` : "—"}
          accent={data.nations[0]?.primary_color ?? "#F472B6"}
        />
        <Tile
          label="Fixtures (real / all)"
          value={`${data.host_battle.real_fixtures} / ${data.host_battle.total_fixtures}`}
          accent="#5EEAD4"
        />
        <Tile
          label="Host votes today"
          value={formatNumber(data.host_battle.total_votes_today)}
          accent="#F472B6"
        />
      </div>

      <Panel title={`Today's Host Region Battle · ${data.host_battle.date}`}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span
            className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full ${
              data.host_battle.data_source === "real"
                ? "bg-neon-cyan/15 text-neon-cyan"
                : "bg-amber-400/15 text-amber-300"
            }`}
          >
            {data.host_battle.data_source === "real" ? "Real fixtures" : "Sample preview"}
          </span>
          <span className="text-xs text-white/55">
            Votes: {data.host_battle.votes_are_live ? "live (recorded)" : "preview / not recorded"}
          </span>
        </div>
        {data.host_battle.today_matches.length === 0 ? (
          <Empty>No matches today.</Empty>
        ) : (
          <Table
            cols={["Match", "City / Venue", "Kickoff", "Type"]}
            rows={data.host_battle.today_matches.map((m) => [
              `${m.a} vs ${m.b}`,
              `${m.city} · ${m.venue}`,
              m.kickoff ?? "—",
              m.sample ? "sample" : "real"
            ])}
          />
        )}
      </Panel>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Eligible nations today">
          {data.host_battle.eligible.length === 0 ? (
            <Empty>No eligible nations today.</Empty>
          ) : (
            <Table
              cols={["Nation", "Votes", "Share"]}
              rows={data.host_battle.eligible.map((e) => [
                e.name,
                formatNumber(e.votes),
                `${(e.share * 100).toFixed(1)}%`
              ])}
            />
          )}
        </Panel>

        <Panel title="Archived daily winners">
          {data.host_battle.archive.length === 0 ? (
            <Empty>No archived battles yet.</Empty>
          ) : (
            <Table
              cols={["Date", "Winner", "Check-ins", "Type"]}
              rows={data.host_battle.archive.map((a) => [
                a.date,
                a.winner,
                formatNumber(a.total_votes),
                a.sample ? "sample" : "real"
              ])}
            />
          )}
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title={`Shares by channel · ${formatNumber(data.shares.total)} total`}>
          {data.shares.by_channel.length === 0 ? (
            <Empty>No shares yet.</Empty>
          ) : (
            <Table
              cols={["Channel", "Shares"]}
              rows={data.shares.by_channel.map((c) => [c.channel, formatNumber(c.count)])}
            />
          )}
        </Panel>
        <Panel title="Top sharing nations">
          {data.shares.top_nations.length === 0 ? (
            <Empty>No shares yet.</Empty>
          ) : (
            <Table
              cols={["Nation", "Shares"]}
              rows={data.shares.top_nations.map((n) => [n.nation, formatNumber(n.count)])}
            />
          )}
        </Panel>
      </div>

      <Panel title="Supporters per nation">
        <div className="grid sm:grid-cols-2 gap-2">
          {data.nations.map((n) => (
            <div key={n.slug} className="flex items-center gap-3 py-1">
              <div className="size-2 rounded-full" style={{ background: n.primary_color }} />
              <div className="text-sm flex-1 truncate">{n.emoji} {n.name}</div>
              <div className="text-xs text-white/55 tabular-nums">
                {formatNumber(n.supporter_count)} · {(n.share * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="City leaderboard">
          {data.city_leaderboard.length === 0 ? (
            <Empty>No cities yet.</Empty>
          ) : (
            <Table
              cols={["Nation", "City", "Supporters"]}
              rows={data.city_leaderboard.map((r) => [r.nation, r.city, formatNumber(r.count)])}
            />
          )}
        </Panel>

        <Panel title="Top referrers">
          {data.referrals.length === 0 ? (
            <Empty>No referrals yet.</Empty>
          ) : (
            <Table
              cols={["Referrer", "Nation", "Invited"]}
              rows={data.referrals.map((r) => [r.referrer, r.nation, formatNumber(r.count)])}
            />
          )}
        </Panel>

        <Panel title="Shop clicks">
          {data.shop_clicks.length === 0 ? (
            <Empty>No shop clicks yet.</Empty>
          ) : (
            <Table
              cols={["Product", "Clicks"]}
              rows={data.shop_clicks.map((r) => [r.product_slug, formatNumber(r.count)])}
            />
          )}
        </Panel>

        <Panel title="Recent supporters">
          {data.recent_supporters.length === 0 ? (
            <Empty>No supporters yet.</Empty>
          ) : (
            <Table
              cols={["Nickname", "Nation", "City", "Joined"]}
              rows={data.recent_supporters.map((r) => [
                r.nickname,
                `${r.nation_emoji} ${r.nation_name}`,
                r.city ?? "—",
                new Date(r.created_at).toLocaleString()
              ])}
            />
          )}
        </Panel>
      </div>
    </div>
  );
}

function Tile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="glass rounded-2xl p-4 ring-soft">
      <div className="text-[10px] uppercase tracking-widest text-white/45">{label}</div>
      <div className="mt-1 h-display text-2xl font-bold tabular-nums" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-3xl ring-soft p-5">
      <div className="text-sm font-semibold text-white/80">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-white/45">{children}</div>;
}

function Row({ label, value, ok, warn }: { label: string; value: string; ok?: boolean; warn?: boolean }) {
  const color = ok ? "#5EEAD4" : warn ? "#FBBF24" : "#fff";
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/40 py-1.5">
      <span className="text-white/55">{label}</span>
      <span className="font-semibold tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function Table({ cols, rows }: { cols: string[]; rows: Array<Array<string>> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-white/45">
            {cols.map((c) => <th key={c} className="py-2 pr-3 font-normal">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line/60">
              {r.map((cell, j) => <td key={j} className="py-2 pr-3 align-top">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
