"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FollowButtonProps {
  companyId: string;
  initialFollowed: boolean;
  initialCount: number;
}

export function FollowButton({
  companyId,
  initialFollowed,
  initialCount,
}: FollowButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [followed, setFollowed] = useState(initialFollowed);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const [animating, setAnimating] = useState(false);

  async function handleToggle() {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    // Optimistic update
    const prevFollowed = followed;
    const prevCount = count;
    setFollowed(!followed);
    setCount(followed ? count - 1 : count + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/companies/${companyId}/follow`, {
          method: "POST",
        });

        if (!res.ok) {
          // Revert on error
          setFollowed(prevFollowed);
          setCount(prevCount);
          return;
        }

        const data = await res.json();
        setFollowed(data.followed);
        setCount(data.followerCount);
        toast.success(data.followed ? "Company followed" : "Company unfollowed");
      } catch {
        // Revert on error
        setFollowed(prevFollowed);
        setCount(prevCount);
        toast.error("Failed to update follow status");
      }
    });
  }

  return (
    <Button
      variant={followed ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className="gap-1.5"
    >
      <Heart
        className={cn(
          "size-4 transition-transform duration-200",
          followed && "fill-current",
          animating && "scale-125"
        )}
      />
      <span>{count}</span>
    </Button>
  );
}
