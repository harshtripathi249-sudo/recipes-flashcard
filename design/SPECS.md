# Landing page design notes

`landing-prototype.html` is the early visual prototype. The finished design lives in the app:

- `src/components/HeroSection.jsx`, `src/components/RecipePhoto.jsx`
- hero, browse and shelf styles in `src/index.css` (section "LANDING HERO")

Design decisions carried into the app:
- Deep green panel (`#1F4331`) with a cream headline; one large featured photograph with a thin offset outline and a plain caption (title, cuisine, credit).
- Tomato (`#C8412B`) only for the primary action, small labels and focus rings.
- Fraunces for headlines (italic accent line), Plus Jakarta Sans for UI, hairline rules, 4-8px radii.
- Motion: one-time entrance (text rise, photo wipe) and one-time scroll reveals for the cookbook shelf. Nothing loops. All of it is off under `prefers-reduced-motion`.
- No decorative or floating imagery. Photos are real and credited (see ../CREDITS.md).
