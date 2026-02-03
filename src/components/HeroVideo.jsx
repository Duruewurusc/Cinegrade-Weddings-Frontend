// Hero.jsx
export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/images/hero-poster.jpg"
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/videos/hero.webm" type="video/webm" />
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Cinematic Wedding Stories
        </h1>

        <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-xl">
          We turn love stories into timeless films.
        </p>

        <button className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 transition rounded-full font-semibold">
          Book Your Wedding
        </button>
      </div>
    </section>
  );
}
