---
name: tst-report-ui
description: Use for responsive, UX, UI, navigation or visual refactors of the TST Report without modifying report data, scoring or content.
---

# TST Report UI

## Preserve
Never modify:
- scoring
- report data
- Firebase logic
- test logic
- textual content unless explicitly requested
- family/current calculations
- core visual identity

## Workflow
1. Search relevant symbols first.
2. Read only directly involved files.
3. Find layout root cause before patching children.
4. Prefer structural fixes over repeated local CSS overrides.
5. Keep React state minimal.
6. Reuse existing components/styles where appropriate.

## Layout
- Responsive from mobile through ultrawide.
- Avoid arbitrary fixed desktop widths.
- Prefer `width:100%` + intentional outer max width.
- Main layouts should use `minmax(0,1fr)`.
- Restrict text measure locally, not the whole page.
- Avoid unnecessary min-height and excessive vertical padding.
- Prevent horizontal overflow.

## Navigation
Macro report navigation and local section navigation must remain conceptually distinct.
Use clear active, hover, focus and keyboard states.

## Dense content
Use progressive disclosure.
Do not show large undifferentiated walls of tags/data when a useful summary can precede them.
Do not invent data-derived rankings/categories.

## QA
When UI changed, verify:
390, 768, 1280, 1440, 1728, 1920, 2560.

Check:
- overflow
- resize
- sticky offsets
- navigation
- long content
- visual continuity
- keyboard interaction

Use available browser/visual-QA skill when applicable.

## Output
Keep audit and final report concise.
Do not paste unchanged code or large diffs into chat.
