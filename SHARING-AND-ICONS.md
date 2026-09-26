# Sharing cards and flat icons

All ten game pages have their own title, description, canonical URL, and Open Graph and Twitter metadata. The shared 1200 by 630 PNG is `assets/sharing-card-v2.png`; its editable HTML source is `design/sharing-card.html`.

The site uses local vector artwork in `assets/flat-icons.svg`. Main interface symbols are Lucide icons. Illustrated game symbols use OpenMoji 17.0.0 monochrome outlines. Credits and license files are linked from the homepage.

Static page icons are SVG markup. `flat-icons.js` converts symbol tokens emitted by the existing games into matching SVGs, including changing sound and game controls. It observes text changes only, skips inputs and editable content, and never accesses saved game state. The original symbol strings remain internal identifiers. New symbols must be added to the sprite, map, and runtime dictionary together. Keep complete Unicode sequences, including family and profession combinations, together.

Classic image export loads the same vector artwork through `FlatIcons.image`, so exported pictures also avoid platform emoji. Wallet rules, prices, rewards, saves, and world geometry are unchanged.

Checks: all 22 existing Node tests, all 28 video availability checks, all nine pages at phone and desktop widths, sound and Need or Want controls, SVG-to-canvas export, and sharing metadata checks.
