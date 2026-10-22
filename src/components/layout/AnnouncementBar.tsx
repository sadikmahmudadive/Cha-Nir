import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site } from "@/lib/site";

/** Editable via `site.announcement` (later: Firestore `settings/announcement`). Hidden when message is null. */
export function AnnouncementBar() {
  const a = site.announcement;
  if (!a.message) return null;
  return (
    <div className="bg-tea-800 text-cream" data-surface="dark">
      <p className="container-x flex min-h-10 flex-wrap items-center justify-center gap-x-3 gap-y-0.5 py-1.5 text-center text-[0.8rem] font-medium">
        <span>{a.message}</span>
        {a.href && (
          <Link href={a.href} className="inline-flex items-center gap-1 font-bold text-lime-300 underline-offset-4 hover:underline">
            {a.cta} <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </p>
    </div>
  );
}
