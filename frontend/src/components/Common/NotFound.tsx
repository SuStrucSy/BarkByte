import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex flex-col h-screen items-center justify-center p-4 overflow-hidden bg-background">
      {/* Grain texture */}
      <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none">
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

      {/* Forest illustration */}
      <div className="relative mb-6">
        <svg
          width="300"
          height="200"
          viewBox="0 0 300 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ground */}
          <ellipse
            cx="150"
            cy="188"
            rx="125"
            ry="9"
            fill="#92400e"
            opacity="0.2"
          />

          {/* Back trees — muted */}
          <g opacity="0.3">
            <rect x="48" y="100" width="7" height="58" rx="2" fill="#92400e" />
            <polygon points="51,45 28,106 74,106" fill="#166534" />
            <polygon points="51,68 32,112 70,112" fill="#15803d" />
          </g>
          <g opacity="0.3">
            <rect x="244" y="105" width="7" height="53" rx="2" fill="#92400e" />
            <polygon points="247,50 224,110 270,110" fill="#166534" />
            <polygon points="247,72 228,116 266,116" fill="#15803d" />
          </g>

          {/* Mid trees */}
          <g opacity="0.55">
            <rect x="70" y="108" width="9" height="70" rx="2" fill="#78350f" />
            <polygon points="74,42 48,112 100,112" fill="#15803d" />
            <polygon points="74,66 52,118 96,118" fill="#16a34a" />
          </g>
          <g opacity="0.55">
            <rect x="220" y="108" width="9" height="70" rx="2" fill="#78350f" />
            <polygon points="224,42 198,112 250,112" fill="#15803d" />
            <polygon points="224,66 202,118 246,118" fill="#16a34a" />
          </g>

          {/* Front trees — full color */}
          <rect x="94" y="112" width="12" height="76" rx="2" fill="#92400e" />
          <polygon points="100,36 68,116 132,116" fill="#166534" />
          <polygon points="100,60 72,122 128,122" fill="#15803d" />
          <polygon points="100,82 76,128 124,128" fill="#16a34a" />

          <rect x="194" y="112" width="12" height="76" rx="2" fill="#92400e" />
          <polygon points="200,36 168,116 232,116" fill="#166534" />
          <polygon points="200,60 172,122 228,122" fill="#15803d" />
          <polygon points="200,82 176,128 224,128" fill="#16a34a" />

          {/* Lost person */}
          <g transform="translate(135, 108)">
            {/* Legs */}
            <line
              x1="14"
              y1="40"
              x2="11"
              y2="56"
              stroke="#1e40af"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <line
              x1="17"
              y1="40"
              x2="20"
              y2="56"
              stroke="#1e40af"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Body */}
            <rect x="8" y="20" width="13" height="22" rx="4" fill="#3b82f6" />
            {/* Arms raised in confusion */}
            <line
              x1="8"
              y1="25"
              x2="0"
              y2="16"
              stroke="#3b82f6"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <line
              x1="21"
              y1="25"
              x2="29"
              y2="16"
              stroke="#3b82f6"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Head */}
            <circle cx="14.5" cy="13" r="8" fill="#fbbf24" />
            {/* Hard hat */}
            <ellipse cx="14.5" cy="8" rx="10" ry="4.5" fill="#f59e0b" />
            <rect x="6" y="6" width="17" height="5" rx="1.5" fill="#f59e0b" />
            <rect x="4" y="10" width="21" height="3" rx="1" fill="#d97706" />
          </g>

          {/* Floating question marks — colorful */}
          <text
            x="117"
            y="106"
            fill="#f97316"
            fontSize="15"
            fontWeight="bold"
            opacity="0.85"
          >
            ?
          </text>
          <text
            x="166"
            y="100"
            fill="#a855f7"
            fontSize="20"
            fontWeight="bold"
            opacity="0.7"
          >
            ?
          </text>
          <text
            x="113"
            y="132"
            fill="#ec4899"
            fontSize="11"
            fontWeight="bold"
            opacity="0.6"
          >
            ?
          </text>

          {/* Dotted circular trail */}
          <path
            d="M150 162 Q118 150 113 166 Q108 180 135 180 Q162 180 167 166 Q170 150 150 162"
            stroke="#d97706"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="4 3"
            opacity="0.55"
          />

          {/* Compass — broken */}
          <g transform="translate(228, 28)">
            <circle
              cx="15"
              cy="15"
              r="13"
              stroke="#6366f1"
              strokeWidth="1.8"
              fill="#eef2ff"
              className="dark:fill-#1e1b4b"
              opacity="0.85"
            />
            <circle cx="15" cy="15" r="2.5" fill="#6366f1" opacity="0.9" />
            <line
              x1="15"
              y1="15"
              x2="23"
              y2="23"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.9"
            />
            <line
              x1="15"
              y1="15"
              x2="7"
              y2="7"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
            />
            <text
              x="9"
              y="12"
              fill="#6366f1"
              fontSize="6"
              fontWeight="bold"
              opacity="0.8"
            >
              N?
            </text>
          </g>

          {/* Birds */}
          <g opacity="0.45">
            <path
              d="M58 48 Q63 43 68 48"
              stroke="#16a34a"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M238 68 Q243 63 248 68"
              stroke="#16a34a"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M76 78 Q80 74 84 78"
              stroke="#15803d"
              strokeWidth="1.5"
              fill="none"
            />
          </g>

          {/* Falling leaf */}
          <ellipse
            cx="185"
            cy="72"
            rx="5"
            ry="3"
            fill="#22c55e"
            opacity="0.6"
            transform="rotate(-30 185 72)"
          />
          <ellipse
            cx="105"
            cy="90"
            rx="4"
            ry="2.5"
            fill="#16a34a"
            opacity="0.5"
            transform="rotate(20 105 90)"
          />
        </svg>
      </div>

      <span className="text-7xl md:text-9xl font-bold leading-none mb-2 text-foreground">
        404
      </span>

      <h1 className="text-2xl md:text-3xl font-bold mb-3 text-center text-foreground">
        Lost in the woods.
      </h1>

      <p className="text-base md:text-lg text-center max-w-sm mb-8 text-muted-foreground">
        Our crew searched the entire site but couldn't find this page. It may
        have been moved, removed, or never built.
      </p>

      <Button asChild>
        <Link to="/">Back to Base Camp</Link>
      </Button>

      <p className="mt-10 text-xs text-muted-foreground">
        🧭 Even the compass is confused.
      </p>
    </div>
  );
};

export default NotFound;
