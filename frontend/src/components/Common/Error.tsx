import { Link } from "@tanstack/react-router";
import axios from "axios";
import { Button } from "@/components/ui/button";

interface ErrorComponentProps {
  error?: Error | null;
}

export const getStatusCode = (error?: Error | null): number => {
  if (!error) return 500;
  if (
    "response" in error &&
    error.response !== null &&
    typeof error.response === "object" &&
    "status" in (error.response as object) &&
    typeof (error.response as { status?: unknown }).status === "number"
  ) {
    return (error.response as { status: number }).status;
  }
  return 500;
};

const getErrorMessage = (error?: Error | null): string => {
  if (!error) return "An unexpected error occurred.";

  if (axios.isAxiosError(error) && error.response) {
    const status = error.response.status;
    const detail = error.response.data?.detail;

    switch (status) {
      case 400:
        return detail ?? "Bad request — something in the plans didn't add up.";
      case 401:
        return "You'll need clearance to enter this site.";
      case 403:
        return "This area is off-limits — access denied.";
      case 404:
        return "This room wasn't in the blueprint.";
      case 422:
        return Array.isArray(detail)
          ? detail.map((e: { msg: string }) => e.msg).join("; ")
          : (detail ?? "Validation failed.");
      default:
        return detail ?? "One of our beams gave way. Our crew is on it.";
    }
  }

  return error.message ?? "An unexpected error occurred.";
};

const ErrorComponent = ({ error }: ErrorComponentProps) => {
  const statusCode = getStatusCode(error);
  const message = getErrorMessage(error);

  return (
    <div className="flex flex-col h-screen items-center justify-center p-4 overflow-hidden bg-background">
      {/* Grain texture */}
      <svg
        className="absolute inset-0 w-full h-full opacity-5 pointer-events-none"
        role="img"
        aria-label="Grain texture"
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Timber illustration */}
      <div className="relative mb-6">
        <svg
          width="300"
          height="200"
          viewBox="0 0 300 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Timber illustration"
        >
          {/* Shadow */}
          <ellipse
            cx="150"
            cy="186"
            rx="110"
            ry="9"
            fill="#92400e"
            opacity="0.2"
          />

          {/* Bottom plank */}
          <g transform="rotate(-8, 140, 140)">
            <rect
              x="18"
              y="128"
              width="244"
              height="30"
              rx="4"
              fill="#b45309"
            />
            <rect
              x="18"
              y="128"
              width="244"
              height="5"
              rx="2"
              fill="#fbbf24"
              opacity="0.4"
            />
            <line
              x1="60"
              y1="128"
              x2="60"
              y2="158"
              stroke="#78350f"
              strokeWidth="1.2"
              opacity="0.5"
            />
            <line
              x1="105"
              y1="128"
              x2="105"
              y2="158"
              stroke="#78350f"
              strokeWidth="1.2"
              opacity="0.5"
            />
            <line
              x1="185"
              y1="128"
              x2="185"
              y2="158"
              stroke="#78350f"
              strokeWidth="1.2"
              opacity="0.5"
            />
            <line
              x1="225"
              y1="128"
              x2="225"
              y2="158"
              stroke="#78350f"
              strokeWidth="1.2"
              opacity="0.5"
            />
            {/* Wood grain lines */}
            <path
              d="M30 136 Q80 134 120 137 Q160 140 200 136 Q230 133 255 135"
              stroke="#92400e"
              strokeWidth="0.6"
              fill="none"
              opacity="0.4"
            />
            <path
              d="M30 148 Q70 146 110 149 Q150 152 190 148 Q225 145 255 147"
              stroke="#92400e"
              strokeWidth="0.6"
              fill="none"
              opacity="0.4"
            />
          </g>

          {/* Middle plank */}
          <g transform="rotate(12, 140, 100)">
            <rect x="28" y="86" width="224" height="30" rx="4" fill="#d97706" />
            <rect
              x="28"
              y="86"
              width="224"
              height="5"
              rx="2"
              fill="#fde68a"
              opacity="0.35"
            />
            <line
              x1="78"
              y1="86"
              x2="78"
              y2="116"
              stroke="#92400e"
              strokeWidth="1.2"
              opacity="0.5"
            />
            <line
              x1="130"
              y1="86"
              x2="130"
              y2="116"
              stroke="#92400e"
              strokeWidth="1.2"
              opacity="0.5"
            />
            <line
              x1="195"
              y1="86"
              x2="195"
              y2="116"
              stroke="#92400e"
              strokeWidth="1.2"
              opacity="0.5"
            />
            <path
              d="M38 94 Q80 92 120 95 Q165 98 200 94 Q225 91 248 93"
              stroke="#b45309"
              strokeWidth="0.6"
              fill="none"
              opacity="0.4"
            />
          </g>

          {/* Top plank — the fallen one */}
          <g transform="rotate(-22, 140, 52)">
            <rect x="48" y="38" width="204" height="30" rx="4" fill="#f59e0b" />
            <rect
              x="48"
              y="38"
              width="204"
              height="5"
              rx="2"
              fill="#fef3c7"
              opacity="0.4"
            />
            <line
              x1="88"
              y1="38"
              x2="88"
              y2="68"
              stroke="#d97706"
              strokeWidth="1.2"
              opacity="0.5"
            />
            <line
              x1="148"
              y1="38"
              x2="148"
              y2="68"
              stroke="#d97706"
              strokeWidth="1.2"
              opacity="0.5"
            />
            <line
              x1="210"
              y1="38"
              x2="210"
              y2="68"
              stroke="#d97706"
              strokeWidth="1.2"
              opacity="0.5"
            />
            <path
              d="M58 46 Q100 44 140 47 Q175 50 220 46 Q238 44 248 45"
              stroke="#b45309"
              strokeWidth="0.6"
              fill="none"
              opacity="0.4"
            />
          </g>

          {/* Hard hat */}
          <g transform="translate(166, 16) rotate(28)">
            <ellipse cx="22" cy="20" rx="25" ry="11" fill="#facc15" />
            <rect x="4" y="17" width="36" height="11" rx="3" fill="#facc15" />
            <rect x="0" y="25" width="44" height="6" rx="2" fill="#ca8a04" />
            {/* Stripe on hard hat */}
            <rect
              x="18"
              y="17"
              width="4"
              height="11"
              fill="#fef08a"
              opacity="0.6"
            />
          </g>

          {/* Impact star burst */}
          <g opacity="0.75">
            <line
              x1="62"
              y1="30"
              x2="50"
              y2="16"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="64"
              y1="27"
              x2="70"
              y2="13"
              stroke="#f97316"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="60"
              y1="32"
              x2="44"
              y2="30"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="58"
              y1="28"
              x2="52"
              y2="18"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>

          {/* Flying splinters */}
          <g opacity="0.5">
            <rect
              x="40"
              y="50"
              width="12"
              height="3"
              rx="1"
              fill="#d97706"
              transform="rotate(-35 40 50)"
            />
            <rect
              x="28"
              y="68"
              width="9"
              height="2.5"
              rx="1"
              fill="#b45309"
              transform="rotate(15 28 68)"
            />
            <rect
              x="55"
              y="62"
              width="7"
              height="2"
              rx="1"
              fill="#f59e0b"
              transform="rotate(-55 55 62)"
            />
          </g>

          {/* Nails popping out */}
          <g fill="#94a3b8">
            <rect
              x="88"
              y="24"
              width="3"
              height="8"
              rx="1"
              transform="rotate(-22, 88, 24)"
            />
            <rect
              x="148"
              y="28"
              width="3"
              height="8"
              rx="1"
              transform="rotate(-22, 148, 28)"
            />
          </g>
        </svg>
      </div>

      {/* Status code */}
      <span className="text-7xl md:text-9xl font-bold leading-none mb-2 text-foreground">
        {statusCode}
      </span>

      {/* Headline */}
      <h1 className="text-2xl md:text-3xl font-bold mb-3 text-center text-foreground">
        Timber! Something collapsed.
      </h1>

      {/* Message */}
      <p className="text-base md:text-lg text-center max-w-sm mb-8 text-muted-foreground">
        {message}
      </p>

      <Button asChild>
        <Link to="/">Back to Base Camp</Link>
      </Button>

      <p className="mt-10 text-xs text-muted-foreground">
        🌲 No old-growth trees were harmed in this error.
      </p>
    </div>
  );
};

export default ErrorComponent;
