export function ProfileAbout({ bio }: { bio: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6">
      <h2 className="font-display text-lg font-semibold text-white">About</h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/50">
        {bio}
      </p>
    </div>
  );
}
