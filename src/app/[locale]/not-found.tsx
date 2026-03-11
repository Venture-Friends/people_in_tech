import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-7xl font-bold tracking-tighter text-primary">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Page not found
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <Link href="/">
          <Button size="lg" className="gap-2">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
