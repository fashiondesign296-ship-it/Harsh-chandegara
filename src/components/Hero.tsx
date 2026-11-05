import Link from 'next/link';
export type HeroData = { title: string; subtitle: string; tagline: string; videoUrl: string; posterUrl: string; mobilePosterUrl: string; ctaLabel: string; ctaHref: string };
export default function Hero({ h }: { h: HeroData }) {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden px-6 md:px-12">
      {h.posterUrl && (
        <picture>
          {h.mobilePosterUrl && <source media="(max-width: 767px)" srcSet={h.mobilePosterUrl} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={h.posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
        </picture>
      )}
      {h.videoUrl && (
        // Video is hidden on small screens and for reduced-motion users via CSS; poster remains.
        <video className="absolute inset-0 hidden h-full w-full object-cover motion-safe:md:block" src={h.videoUrl}
          poster={h.posterUrl || undefined} autoPlay muted loop playsInline preload="metadata" aria-hidden />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-bg/30 to-transparent" />
      <div className="relative z-10 max-w-2xl pt-24">
        <h1 className="text-7xl md:text-9xl">{h.title}</h1>
        <p className="mt-2 font-display text-2xl tracking-[0.35em] md:text-3xl">{h.subtitle.toUpperCase()}</p>
        <p className="mt-10 max-w-md font-display text-2xl text-heading md:text-3xl">{h.tagline}</p>
        <Link href={h.ctaHref} className="btn mt-10">{h.ctaLabel}</Link>
      </div>
    </section>
  );
}
