import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[50vh] place-items-center py-20 text-center">
      <div className="space-y-5">
        <p className="t-eyebrow text-tea-600">404</p>
        <h1 className="t-h1 text-tea-900">This cup is empty.</h1>
        <p className="mx-auto max-w-md text-ink-soft">We couldn&rsquo;t find the page you were looking for.</p>
        <div className="flex justify-center gap-3">
          <Button href="/">Back home</Button>
          <Button href="/shop" variant="secondary">
            Shop Tea
          </Button>
        </div>
      </div>
    </div>
  );
}
