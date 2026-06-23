"""Generate per-resource SVG logo thumbnails (slug from init_db url)."""
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "assets" / "images" / "resources"

THEMES = {
    "01-gk-2026-outline": ("#4338ca", "#e0e7ff", "scroll"),
    "02-prep-plan-guide": ("#0d9488", "#ccfbf1", "calendar"),
    "03-gk-2025-xingce": ("#4338ca", "#e0e7ff", "paper"),
    "04-gk-2024-xingce": ("#4f46e5", "#e0e7ff", "papers"),
    "05-mock-xingce-1": ("#b45309", "#fef3c7", "timer"),
    "06-yanyu-chengyu": ("#0369a1", "#e0f2fe", "chat"),
    "07-yanyu-pianduan": ("#0284c7", "#e0f2fe", "lines"),
    "08-shuliang-formulas": ("#7c3aed", "#ede9fe", "sigma"),
    "09-shuliang-100": ("#6d28d9", "#ede9fe", "grid"),
    "10-tuili-tuxing": ("#be123c", "#ffe4e6", "shapes"),
    "11-ziliao-susuan": ("#0f766e", "#ccfbf1", "chart"),
    "12-changshi-shizheng": ("#059669", "#d1fae5", "globe"),
    "13-shenlun-template": ("#b45309", "#fef3c7", "pen"),
    "14-gk-2025-shenlun": ("#d97706", "#fef3c7", "essay"),
    "15-gk-2026-notice": ("#475569", "#f1f5f9", "megaphone"),
    "16-provincial-policy": ("#334155", "#f1f5f9", "map"),
    "17-gk-tiaoji": ("#64748b", "#f1f5f9", "swap"),
    "18-gk-2026-shenlun-outline": ("#c2410c", "#ffedd5", "clipboard"),
    "19-gk-2023-xingce": ("#3730a3", "#e0e7ff", "trend"),
    "20-mock-xingce-2": ("#a16207", "#fef9c3", "stopwatch"),
    "21-luoji-panduan-50": ("#9f1239", "#ffe4e6", "logic"),
    "22-shenlun-sucai-2026": ("#ea580c", "#ffedd5", "bulb"),
    "23-gk-position-guide": ("#0e7490", "#cffafe", "compass"),
}

ICONS = {
    "scroll": '<path d="M24 14h16v28H24z" fill="#fff" opacity=".92"/><path d="M22 14c-2 0-4 2-4 4v24c0 2 2 4 4 4h2V14z" fill="#fff" opacity=".55"/><path d="M42 14c2 0 4 2 4 4v24c0 2-2 4-4 4h-2V14z" fill="#fff" opacity=".55"/><path d="M28 22h8M28 28h12M28 34h10" stroke="{fg}" stroke-width="2" stroke-linecap="round"/>',
    "calendar": '<rect x="18" y="20" width="28" height="24" rx="4" fill="#fff" opacity=".95"/><path d="M18 26h28" stroke="{fg}" stroke-width="2"/><path d="M24 16v8M40 16v8" stroke="#fff" stroke-width="3" stroke-linecap="round"/><rect x="24" y="30" width="6" height="6" rx="1.5" fill="{fg}" opacity=".8"/><rect x="34" y="30" width="6" height="6" rx="1.5" fill="{fg}" opacity=".5"/>',
    "paper": '<rect x="20" y="14" width="24" height="32" rx="3" fill="#fff"/><path d="M26 22h12M26 28h12M26 34h8" stroke="{fg}" stroke-width="2" stroke-linecap="round"/><circle cx="42" cy="38" r="8" fill="{fg}"/><path d="M39 38l2 2 4-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    "papers": '<rect x="16" y="18" width="22" height="28" rx="3" fill="#fff" opacity=".7"/><rect x="24" y="14" width="22" height="28" rx="3" fill="#fff" opacity=".85"/><rect x="32" y="18" width="22" height="28" rx="3" fill="#fff"/><path d="M38 26h10M38 32h10M38 38h6" stroke="{fg}" stroke-width="2" stroke-linecap="round"/>',
    "timer": '<circle cx="32" cy="34" r="14" fill="#fff"/><path d="M32 26v10l6 4" stroke="{fg}" stroke-width="2.5" stroke-linecap="round"/><path d="M26 18h12" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
    "chat": '<rect x="14" y="18" width="22" height="16" rx="6" fill="#fff"/><rect x="28" y="28" width="22" height="16" rx="6" fill="#fff" opacity=".9"/><path d="M20 30l-4 4v-4" fill="#fff"/>',
    "lines": '<rect x="16" y="16" width="32" height="32" rx="8" fill="#fff"/><path d="M22 24h20M22 30h16M22 36h20" stroke="{fg}" stroke-width="2.5" stroke-linecap="round"/>',
    "sigma": '<text x="32" y="40" text-anchor="middle" font-size="28" font-weight="800" fill="#fff" font-family="Lexend,Arial,sans-serif">∑</text>',
    "grid": '<rect x="16" y="16" width="32" height="32" rx="8" fill="#fff"/><path d="M16 28h32M16 36h32M28 16v32M36 16v32" stroke="{fg}" stroke-width="1.5" opacity=".6"/>',
    "shapes": '<circle cx="24" cy="26" r="8" fill="#fff"/><rect x="30" y="30" width="14" height="14" rx="2" fill="#fff" opacity=".9"/><polygon points="40,18 48,34 32,34" fill="#fff" opacity=".75"/>',
    "chart": '<rect x="16" y="16" width="32" height="32" rx="8" fill="#fff"/><rect x="22" y="34" width="5" height="10" fill="{fg}"/><rect x="30" y="28" width="5" height="16" fill="{fg}" opacity=".75"/><rect x="38" y="22" width="5" height="22" fill="{fg}" opacity=".55"/>',
    "globe": '<circle cx="32" cy="32" r="16" fill="#fff"/><ellipse cx="32" cy="32" rx="16" ry="6" stroke="{fg}" stroke-width="1.5" fill="none"/><path d="M32 16v32M16 32h32" stroke="{fg}" stroke-width="1.5" opacity=".5"/>',
    "pen": '<rect x="18" y="16" width="28" height="34" rx="4" fill="#fff"/><path d="M24 24h20M24 30h16M24 36h12" stroke="{fg}" stroke-width="2" stroke-linecap="round"/><path d="M42 40l6 6" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M42 40l6 6" stroke="{fg}" stroke-width="2" stroke-linecap="round"/>',
    "essay": '<rect x="18" y="14" width="28" height="36" rx="4" fill="#fff"/><path d="M24 22h16M24 28h18M24 34h14M24 40h10" stroke="{fg}" stroke-width="2" stroke-linecap="round"/>',
    "megaphone": '<path d="M18 28h10l14-8v24l-14-8H18z" fill="#fff"/><rect x="14" y="26" width="6" height="12" rx="2" fill="#fff" opacity=".8"/>',
    "map": '<path d="M20 18l12 6 12-6v28l-12 6-12-6z" fill="#fff"/><path d="M32 24v28M20 18v28" stroke="{fg}" stroke-width="2"/>',
    "swap": '<path d="M20 24h18M34 20l4 4-4 4M44 40H26M30 36l-4 4 4 4" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    "clipboard": '<rect x="20" y="18" width="24" height="30" rx="4" fill="#fff"/><rect x="26" y="14" width="12" height="8" rx="3" fill="#fff" opacity=".85"/><path d="M26 28h12M26 34h12M26 40h8" stroke="{fg}" stroke-width="2" stroke-linecap="round"/>',
    "trend": '<path d="M16 40L28 30l8 6 12-14" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="48" cy="22" r="3" fill="#fff"/>',
    "stopwatch": '<circle cx="32" cy="36" r="13" fill="#fff"/><path d="M32 30v8l5 3" stroke="{fg}" stroke-width="2.5" stroke-linecap="round"/><rect x="28" y="16" width="8" height="6" rx="2" fill="#fff"/>',
    "logic": '<circle cx="22" cy="32" r="6" fill="#fff"/><circle cx="42" cy="24" r="6" fill="#fff" opacity=".85"/><circle cx="42" cy="40" r="6" fill="#fff" opacity=".85"/><path d="M28 30l8-4M28 34l8 4" stroke="#fff" stroke-width="2"/>',
    "bulb": '<circle cx="32" cy="28" r="12" fill="#fff"/><rect x="28" y="38" width="8" height="6" rx="2" fill="#fff" opacity=".9"/><path d="M28 24c2-2 8-2 8 0" stroke="{fg}" stroke-width="2" stroke-linecap="round" fill="none"/>',
    "compass": '<circle cx="32" cy="32" r="16" fill="#fff"/><path d="M32 20l4 12-12 4 4-12z" fill="{fg}"/><circle cx="32" cy="32" r="2" fill="#fff"/>',
}

TEMPLATE = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="bg" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
      <stop stop-color="{bg}"/>
      <stop offset="1" stop-color="{fg}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#bg)"/>
  {icon}
</svg>
'''


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for slug, (fg, _soft, icon_key) in THEMES.items():
        icon = ICONS[icon_key].format(fg=fg)
        bg = _soft
        svg = TEMPLATE.format(bg=bg, fg=fg, icon=icon)
        (OUT / f"{slug}.svg").write_text(svg, encoding="utf-8")
    print(f"Wrote {len(THEMES)} logos to {OUT}")


if __name__ == "__main__":
    main()