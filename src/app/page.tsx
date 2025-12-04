import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] bg-pattern flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="relative mb-8 animate-fade-in">
          <div className="absolute inset-0 bg-[var(--fnb-teal)] opacity-10 blur-3xl rounded-full scale-150" />
          <Image
            src="/fnb.svg"
            alt="FNB Logo"
            width={180}
            height={180}
            priority
            className="relative z-10"
          />
        </div>

        {/* Title & Tagline */}
        <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] tracking-tight mb-4">
            Go<span className="text-[var(--fnb-teal)]">Monate</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--muted)] max-w-md mx-auto leading-relaxed">
            Digital beverage management for FNB corporate events
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm animate-fade-in" style={{ animationDelay: "200ms" }}>
          <Link
            href="/login"
            className="btn-primary flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 w-full"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Staff Login
          </Link>
          <Link
            href="/register"
            className="btn-ghost flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg border border-[var(--border)] hover:border-[var(--fnb-teal)] transition-all duration-200 w-full"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            Register Code
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--background-card)] shadow-sm border border-[var(--border-light)]">
            <div className="w-12 h-12 rounded-full bg-[var(--fnb-teal-light)] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[var(--fnb-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">QR Code Access</h3>
            <p className="text-sm text-[var(--muted)]">Instant drink redemption with your unique QR code</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--background-card)] shadow-sm border border-[var(--border-light)]">
            <div className="w-12 h-12 rounded-full bg-[var(--fnb-orange-light)] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[var(--fnb-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Real-time Tracking</h3>
            <p className="text-sm text-[var(--muted)]">Monitor your token balance instantly</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--background-card)] shadow-sm border border-[var(--border-light)]">
            <div className="w-12 h-12 rounded-full bg-[var(--fnb-teal-light)] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[var(--fnb-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Secure & Simple</h3>
            <p className="text-sm text-[var(--muted)]">No passwords needed for employees</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-[var(--border-light)]">
        <p className="text-sm text-[var(--muted)]">
          Powered by{" "}
          <span className="font-semibold text-[var(--fnb-teal)]">FNB</span>
          {" "}&bull;{" "}
          <span className="text-[var(--foreground-secondary)]">First National Bank of Botswana</span>
        </p>
      </footer>
    </div>
  );
}
