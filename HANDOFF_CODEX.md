# HANDOFF CODEX

## Summary

Added integration contract tests for the data consumed by the Report TST result graphs. The suite loads the real `buildReportData` module through Vite, so JSON, TypeScript bridges, content sources, theoretical maxima, and the production adapter are exercised without copying the scientific calculation into the tests.

No report component, scientific scoring rule, content file, stylesheet, or production configuration was modified.

## Changed files

- `test/reportGraphDataContract.test.js`
  - verifies the five-family mapping and canonical presence of zero-valued families;
  - distinguishes raw points, percentage presence, and normalized radar values;
  - verifies percentage rounding totals exactly 100;
  - verifies stable ordering under ties;
  - verifies all 11 subcurrents against their family and theoretical maximum;
  - verifies empty, partial, and historical records;
  - verifies saved historical subdisposition handling.
- `HANDOFF_CODEX.md`
  - records verification, findings, limitations, and integration instructions.

## Decisions and assumptions

- Kept changes inside Codex ownership: tests and the required handoff only.
- Used the existing `node:test` runner and Vite dependency; no package or lockfile changes were needed.
- Treated numeric Firestore fields as numbers, matching the documented schema. Numeric strings remain an unresolved historical-data risk described below.
- Kept zero-valued families in every contract. Where an existing normalized visualization represents zero as level 1 for visibility, the test explicitly keeps raw value `0` and percentage `0` separate from normalized value `1`.
- Did not alter scientific logic or visual components owned by Claude Code and Antigravity.

## Commands executed

```text
git rev-parse --show-toplevel
git branch --show-current
git status --short
npm test
npm run lint
npm run build
npx eslint test/reportGraphDataContract.test.js
git diff --check
npm run dev -- --host 127.0.0.1
```

Read-only browser verification was performed at `1440x900`, `768x1024`, and `375x812` on `/risultati/report`.

## Verification results

- Branch: `ai/codex`.
- Tests: 12 passed, 0 failed.
- ESLint: passed.
- Production build: passed; 1221 modules transformed.
- Typecheck: unavailable; no typecheck script is configured.
- Browser console on the empty report state: no warnings or errors.
- Horizontal overflow on the empty report state: none at desktop, tablet, or mobile viewport.
- Empty report actions remain keyboard-focusable (`tabIndex=0`).
- `change_reviewer`: confirmed the Vite test loader closes cleanly and the suite is stable across repeated runs.

## Unresolved integration findings

These findings are demonstrable in the current source but are outside Codex file ownership. They must be resolved or explicitly accepted when integrating the visual redesign.

1. **Radar, petals, and ranking do not share one tested UI transformer.** `SintesiCorrenti` recalculates its radar in `buildTotalScoreRadarData`, while `EmotionalShape` independently recalculates petal size. A ratio of `0.2` becomes level `1` in the radar and `2.2` in the petals. The new data-contract suite cannot detect a divergence introduced inside those private component functions.
2. **Displayed percentage can disagree between views.** The report adapter uses integer largest-remainder percentages that total 100; the detail panel independently recalculates one-decimal percentages. Three equal values can be displayed as `34/33/33` in one view and `33.3/33.3/33.3` in another.
3. **Zero can be mistaken for a measured level.** Raw zero and presence zero are rendered with a minimum normalized graphic level of 1. Visibility is correct, but the legend and tooltip must make the distinction explicit.
4. **Tie policy is inconsistent across presentation.** Persisted prevalence uses `blu, rosso, verde, giallo, grigio`; the visual ranking starts from `Verde, Rosso, Blu, Giallo, Grigio`. Equal scores can therefore show Blu as prevalent while Verde appears first.
5. **Historical numeric strings aggregate incorrectly.** A read-only reproducer produced `blu: "5200"` from `BLU_1="5"` and `BLU_2="2"`, because `computeColorTotals` does not coerce each operand before addition. Resulting presence was `99%` instead of the numeric result. The Firestore schema specifies numbers, but legacy imports should be audited.
6. **Derived historical subdisposition is not consistently consumed.** `buildReportData` derives `sottodisposizionePrevalente` when a saved field is absent, but `ReportShell` passes the raw saved field to `SintesiCorrenti` instead of the derived value.
7. **One historical subcurrent has no theoretical denominator.** `GRIGIO_2_Intellettuale_Saggio` has theoretical maximum `0`; a positive historical value is therefore displayed as `0%`.
8. **Petal family assignment depends on color distance.** `assignFamilies` infers families from hardcoded colors instead of using the existing `familyKey`, so a palette change can associate a value with the wrong petal.
9. **Keyboard and reduced-motion gaps remain in the current UI.** Clickable ranking rows are `<li>` elements without keyboard semantics; radar and petal selection are mouse-only; petal animations do not honor reduced motion.
10. **Copy and metric contract are not aligned.** A percentage radar is passed by the adapter but ignored by `SintesiCorrenti`; current captioning can describe a percentage while the visible radar uses the 1-7 scale.

## Browser verification limits

The Codex worktree had no authenticated result or report record in route/session state. The route correctly rendered the safe `Report non disponibile` state, but the complete graphs, tooltips, scrolling sections, keyboard interactions, contrast, overlap, and animation performance could not be exercised with real data. Those checks must be repeated after integration using a real or approved synthetic report fixture.

## Integration instructions

1. Cherry-pick the Codex commit into the integration branch after the redesigned visual components and data changes are present.
2. Run `npm test`, `npm run lint`, and `npm run build`.
3. Resolve the findings above with the owning branches. Prefer one exported pure view-model transformer consumed by ranking, radar, petals, tooltip, and legend; add direct tests against that transformer.
4. Repeat browser QA with an actual report at desktop, tablet, and mobile widths, including resize, scroll, keyboard-only navigation, reduced motion, tooltip content, console output, and horizontal overflow.
5. Confirm that all five families remain visible at zero and that the UI labels raw points, profile presence, and normalized graphic value as separate quantities.

## Expected browser behavior

- Ranking, radar, petals, percentages, and subcategories must resolve each value through the same family key and shared view model.
- Zero-valued families remain visible and are explicitly labelled `0` points / `0%`, even if a minimum visual mark is retained.
- Ties follow one documented order across prevalence and ranking.
- Tooltips and legends state the unit shown and are reachable without a pointer.
- No horizontal scrolling or overlapping labels occurs at 1440 px, 768 px, 375 px, or during intermediate resize.
- Empty and historical records render without runtime warnings or missing-family failures.
