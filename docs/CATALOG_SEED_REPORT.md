# CUSAT Catalogue Seed Report

Source: `lib/cusat-catalog.ts` on `phase-1-supabase-foundation`.

## Departments
- 32 department/school/centre entries are present.
- IDs are already stable slugs and are retained as stable database slugs.
- 104 programme entries are present in the source catalogue.

## Programme normalisation
The catalogue contains programme names with inconsistent spacing:
- `Five- Year Integrated M.Sc. in Chemistry` → `Five-Year Integrated M.Sc. in Chemistry`
- `Five- Year Integrated M.Sc. in Computer Science (Artificial Intelligence & Data Science)` → `Five-Year Integrated M.Sc. in Computer Science (Artificial Intelligence & Data Science)`
- `Five- Year Integrated M.Sc. in Mathematics` → `Five-Year Integrated M.Sc. in Mathematics`
- `Five- Year Integrated M.Sc. in Photonics` → `Five-Year Integrated M.Sc. in Photonics`
- `Five- Year Integrated M.Sc. in Physics` → `Five-Year Integrated M.Sc. in Physics`
- `Five- Year Integrated M.Sc. in Statistics` → `Five-Year Integrated M.Sc. in Statistics`

## Same-name programmes that must NOT be merged
The following names occur under different departments and therefore represent separate catalogue records:
- B.Tech Civil Engineering — CUCEK and School of Engineering
- B.Tech Information Technology — CUCEK and School of Engineering
- B.Tech Computer Science & Engineering — CUCEK and School of Engineering
- B.Tech Electrical & Electronics Engineering — CUCEK and School of Engineering
- B.Tech Electronics & Communication Engineering — CUCEK and School of Engineering
- Master of Computer Applications (Regular) — CUCEK and Department of Computer Applications
- Master of Computer Applications (Cost Sharing) — CUCEK and Department of Computer Applications

These retain distinct stable IDs and department foreign keys.

## Other observations
- Lateral-entry programmes remain separate records because entry semester is materially different.
- Stream 1 / Stream 2 programmes remain separate records.
- Programme IDs from the source catalogue are retained as stable slugs.
- No programme was deleted solely because its display name matched another programme in a different department.

## Seed decision
The seed should preserve the source catalogue's semantic distinctions while normalising obvious typography only.