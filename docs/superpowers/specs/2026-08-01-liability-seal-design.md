# Liability Insurance Seal — Design

**Date:** 2026-08-01
**Status:** Approved
**Scope:** `index.html`, `lv.html`, `css/style.css`

## Goal

Add the exali professional indemnity ("liability insured") seal for SIA "Gulbis Solutions" to
both language versions of the site, with enough context that a visitor understands whose
insurance it is.

## Findings

Three facts about the exali-supplied snippet drive the implementation.

**The supplied dimensions stretch the image.** The seal PNGs are not square, but exali's
snippet declares square `width`/`height`, forcing a ~11% horizontal stretch:

| Snippet declares | Actual file |
| ---------------- | ----------- |
| 65 × 65          | 58 × 65     |
| 90 × 90          | 81 × 90     |
| 120 × 120        | 108 × 120   |

Use the intrinsic dimensions.

**The images have no alpha channel.** All three are 24-bit RGB with a white background baked
in — a cool blue-on-white badge. The dark theme background is a deep warm brown (`#1A1216`),
so the seal needs a deliberate frame or it lands as a bare white rectangle.

**There is no Latvian verification page.** `exali.com/lv-lv/seal/GulbisSolutions` returns
HTTP 200 but serves the identical English page (`<html lang="en">`). Both pages therefore link
to the same `en-lv` URL; only `title` and `alt` text are translated.

## Decisions

### Placement: footer

The footer is where trust and legal marks are conventionally looked for, it already exists on
both pages, and using it leaves the personal voice of the content above undisturbed.

Layout is a centered vertical stack:

```
        ┌──────────┐
        │  exali   │
        │ LIABILITY│      seal, 81 × 90, links to verification page
        │ INSURED  │
        └──────────┘
   SIA "Gulbis Solutions"   new line
     © Bernards Gulbis 2026  existing
  Built with vanilla HTML, CSS & JS   existing
```

**Rejected:** the Contact section. It gets more views, but the seal would sit inside a
`stagger` grid of equal-weight interactive cards and read as a fourth contact method.

### Size: 90 (81 × 90), dropping to 65 (58 × 65) on narrow viewports

At 65 the "LIABILITY INSURED" wordmark is too small to read, which defeats the purpose of a
trust mark. At 120 the seal becomes the largest element in a footer whose text is 0.8–0.9rem,
pulling focus from the content above. 90 is legible without dominating.

The narrow-viewport step-down uses the same 90px image scaled down by CSS rather than swapping
to the 65px file — one request, and the downscale is sharper than the separately-rendered
small asset.

### Dark mode: white card, not opacity

Wrap the seal in a white container with ~8px padding and a small border-radius, applied in
**both** themes. Against the near-white light theme (`--bg-primary: #FFF8F0`) the frame is
effectively invisible; against the dark theme it reads as an intentional framed badge rather
than an image whose background leaked through.

Do not dim the seal with `opacity` in dark mode. A faded certification mark reads as hedging.

### Hotlink the image, do not self-host

Self-hosting would keep the site within exali's usage terms only ambiguously, and — more
importantly — a local copy would keep asserting active cover after a policy lapsed. Hotlinking
means the seal reflects live policy status.

### Company mention: footer line only

One line naming SIA "Gulbis Solutions" directly under the seal, styled like the existing
`.footer__note`. This gives the seal context without turning a personal portfolio into a
business page. No About-section copy, no dedicated trust block.

## Implementation

### Markup

Placed as the first child of `.footer .container`, before `.footer__text`.

```html
<a class="footer__seal" href="https://www.exali.com/en-lv/seal/GulbisSolutions"
   target="_blank" rel="nofollow noopener noreferrer"
   title="Professional indemnity insurance verification — opens in new tab">
    <img src="https://www.exali.com/siegel/siegel_com-2_f6eb44accbf84f1c5acf4309551ce900.png"
         width="81" height="90" loading="lazy"
         alt="exali liability insurance seal for SIA &quot;Gulbis Solutions&quot;">
</a>
<p class="footer__company">SIA &ldquo;Gulbis Solutions&rdquo;</p>
```

Changes from exali's snippet, and why:

- `border="0"` removed — HTML4 presentational attribute, obsolete.
- `rel="nofollow"` → `rel="nofollow noopener noreferrer"` — `target="_blank"` without
  `noopener` exposes the opener window to the destination.
- Square `width`/`height` → intrinsic `81`/`90` — prevents the stretch, and reserves layout
  space so nothing reflows when the image loads.
- `loading="lazy"` added — the footer is below the fold.
- `alt` rewritten from "Continue to EU Digital Professions from SIA 'Gulbis Solutions'" to
  describe what the image *is*. The original describes the link's destination, which is the
  `title`'s job.

### Latvian variant (`lv.html`)

Same `href` and `src`. Translated attributes:

- `title`: `Profesionālās civiltiesiskās atbildības apdrošināšanas apliecinājums — atveras jaunā cilnē`
- `alt`: `exali atbildības apdrošināšanas zīmogs SIA &bdquo;Gulbis Solutions&ldquo;`
- Company line: `SIA &bdquo;Gulbis Solutions&ldquo;` — Latvian quotation convention is
  low-opening `„` / high-closing `"`, unlike the English `“ ”`.

### Styles (`css/style.css`)

Added to the existing Footer block, after `.footer__note`:

- `.footer__seal` — `display: inline-block`, bottom margin ~1rem, `background: #FFFFFF`
  (literal, not `--card-bg`, since the frame must stay white in dark mode),
  `border-radius: 12px` to match the site's dominant card radius, ~8px padding, and a subtle
  shadow using the existing `--card-shadow` variable so it sits in the same visual language as
  `.stat-card`.
- `.footer__seal img` — `display: block` to kill the inline-descender gap.
- `.footer__seal:hover` — slight `translateY` lift, consistent with existing hover treatments.
- `.footer__company` — same color and font-size as `.footer__note`, small bottom margin.
- Inside the existing `@media (max-width: 900px)` block: seal image scales to
  `width: 58px; height: 65px`.

No `prefers-reduced-motion` handling is needed — the existing global rule at the end of the
file already neutralizes all transitions.

## Verification

Manual, matching how the rest of this site is checked — there is no test suite.

1. Both pages render the seal at 81 × 90 with no horizontal distortion (compare against the
   source PNG's proportions).
2. Light and dark themes both show the seal framed cleanly; toggle between them.
3. Narrow viewport (< 900px) shows the smaller seal, footer does not overflow.
4. The link opens the exali verification page in a new tab and resolves to the
   "EU Digital Professions SIA 'Gulbis Solutions', Riga" page.
5. Keyboard: the seal is reachable by Tab and shows a visible focus ring.
6. Latvian page shows Latvian `title`/`alt` and `„Gulbis Solutions"` quoting.

## Out of scope

- Any About-section or hero copy about self-employment.
- A dedicated trust/credentials block.
- Self-hosting or optimising the seal asset.
