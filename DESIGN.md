# DESIGN.md: itsnathan.id

Source of direction: the owner's personal deck identity (`nathan-deck` skill). This file transcribes it for the web and records the few places where the web needs a different value.

## Design Read
Reading this as: personal engineering and research portfolio for recruiters and research collaborators, in the nathan-deck visual language (clean white cards, teal accents, Poppins), dial `ENERGY 2 / RHYTHM 2 / MOTION 1`.

- **ENERGY 2:** a teal-dark hero band gives one clear focal point; the rest stays calm white and pale teal.
- **RHYTHM 2:** consistent card language with a few deliberate breaks: split hero, flagship project, horizontal skill rows, publication list, two-column career log, honors table, teal-dark contact band.
- **MOTION 1:** hover and focus states plus the theme transition. No scroll reveals, no loops.

## Tokens (from nathan-deck)
| Token | Hex | Use |
|---|---|---|
| TEAL | `#249DB2` | Rules, underlines, badges, focus ring, decoration. Text only in dark mode. |
| TEAL_DK | `#1A7484` | Hero and contact band, primary buttons, links and labels in light mode |
| TEAL_DEEP | `#12545F` | Button hover, chip text |
| TEAL_TINT | `#EAF6F8` | Chip wash, text on teal-dark band |
| INK | `#2B2B2B` / `#1A1A1A` | Body and headings |
| CHARCOAL | `#444441` | Paragraph ink only, never a background |
| GREY | `#6B7280` | Secondary text |
| LINE | `#E3E8EC` | Hairlines, card borders |
| WHITE | `#FFFFFF` | Page and card fill |

## Web adjustments
- `#249DB2` on white is 3.2:1, so small text uses `#1A7484` (5.4:1) in light mode.
- `#6B7280` on `#EAF6F8` is 4.4:1, so alternate sections use `#F4F9FA` and grey text never sits on TEAL_TINT.
- `LGREY #9AA3AD` (2.6:1) is not used for text.
- Dark mode is derived from the teal family: background `#0E1E22`, surface `#14292E`, line `#24404A`, text `#EAF6F8`, muted `#A3B7BC`, accent `#249DB2` (5.3:1), button text `#0E1E22` on `#249DB2` (5.3:1).

## Typography
Poppins for headings and body, as in the deck. No monospace.

## Identity motif
Each section heading carries a short teal underline and a two-digit teal number pill (the deck's page badge). Hero and contact mirror the deck's dark cover and closing slides.

## Reasons (R-31)
- **Color:** the owner's teal deck palette, one accent family on white, so site and talks read as one identity.
- **Layout:** each section takes the shape of its data (flagship project, publication list, honors table) instead of one repeated card grid.
- **Typography:** Poppins matches the deck and stays readable at small sizes.
- **Cards:** white cards with a LINE border and no shadow, as in the deck; only the modal and mobile menu are elevated.
- **Radius:** 12px cards, 8px buttons, pill only for chips and number badges.
- **Icons:** none. Real project screenshots carry the visuals.
- **Copy:** one clause per line, plain words, no meta-narration (deck writing rules).
