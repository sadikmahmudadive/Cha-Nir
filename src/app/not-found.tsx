import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="font-serif text-8xl italic text-leaf">404</p>
        <h1 className="mt-4 text-4xl">This page has gone cold.</h1>
        <p className="mt-3 text-brown-soft">The page you were after doesn’t exist, but a fresh pot does.</p>
        <Link href="/shop" className="btn btn-lime mt-8">
          Browse the shop
        </Link>
      </div>
    </div>
  );
}
