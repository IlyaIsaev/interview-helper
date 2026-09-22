import { Button } from "./button";

type RouteLoadErrorProps = {
  onRetry: () => void;
};

function RouteLoadError({ onRetry }: RouteLoadErrorProps) {
  return (
    <section className="flex min-h-svh flex-col items-center justify-center gap-4 px-4">
      <p className="text-ui uppercase tracking-[2px] text-muted-foreground">
        could not load this page
      </p>
      <Button type="button" onClick={onRetry}>
        Retry
      </Button>
    </section>
  );
}

export { RouteLoadError };
export type { RouteLoadErrorProps };
