import { Lock } from "lucide-react";

export function ProfilePrivate({ name }: { name: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-32 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
        <Lock className="size-7 text-white/30" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-white">
        Profile is Private
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-white/40">
        <span className="text-white/60">{name}</span> has chosen to keep their
        profile private. If you know them, ask them to share their profile link.
      </p>
    </div>
  );
}
