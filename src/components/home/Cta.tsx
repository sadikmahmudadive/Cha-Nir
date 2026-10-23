import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export function Cta() {
  return (
    <section className="container-x" aria-labelledby="cta-h">
      <Reveal className="relative isolate overflow-hidden rounded-[2.5rem] bg-leaf px-6 py-16 text-center text-cream sm:px-12 sm:py-24">
        <Image
          src="/img/garden-mist.webp"
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover opacity-25 mix-blend-luminosity"
        />
        <p className="eyebrow !text-lime">Ready when you are</p>
        <h2 id="cta-h" className="mx-auto mt-4 max-w-3xl text-4xl sm:text-6xl">
          Stock your counter with tea you can stand behind.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-cream/90">
          Order online in minutes, or send us your monthly volume and we’ll send back a price and a sample.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-lime">
            Shop tea
          </Link>
          <Link href="/wholesale#quote" className="btn btn-ghost-light">
            Get a wholesale quote
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
