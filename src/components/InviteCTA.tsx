"use client";

import { ShareButtons } from "./ShareButtons";

type Props = {
  nationName: string;
  inviteLink: string;
  shareText: string;
};

export function InviteCTA({ nationName, inviteLink, shareText }: Props) {
  return (
    <div className="glass rounded-3xl ring-soft p-5 sm:p-6">
      <div className="chip">Invite friends</div>
      <h3 className="mt-3 h-display text-2xl font-bold">
        Grow {nationName} on the map.
      </h3>
      <p className="mt-1 text-sm text-white/55">
        Every friend who joins expands {nationName}'s territory on the map.
      </p>

      <div className="mt-4">
        <ShareButtons text={shareText} link={inviteLink} />
      </div>
    </div>
  );
}
