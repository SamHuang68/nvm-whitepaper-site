# NVM Whitepaper & Decision Studio

A public, evidence-governed workbench within the [NVM Knowledge Hub](https://hub.samhuang68.org/). It turns NVM state requirements into readable whitepapers, technology comparisons and SharePoint-ready content records.

## Knowledge architecture

- **NVM Overview** — state contracts, technology families and process-node lenses
- **Technical Whitepaper** — architecture narrative with evidence class and limitation per chapter
- **Decision Matrix** — illustrative selection profiles, never unqualified product specifications
- **SharePoint Taxonomy** — canonical and operational metadata for later Copilot use
- **Content Templates** — reusable, functional outlines for governed authoring
- **Application Atlas** — 18 bilingual cases with persistent-state flows, public sources and explicit limits
- **FIDO2 Security** — protocol semantics, implementation examples and hardware assurance boundaries
- **Foundry Roadmap** — 30 scoped claims from 19 milestones, with maturity filters and source evidence

Canonical transfer fields:

`Technology Family → State Contract → Application Domain → Process Node → Evidence Class → Source → Limitation → Review Status`

## Public boundary

This repository contains public working material only. Vendor-specific qualification, confidential portfolio data, customer context and target-silicon results belong in the restricted company SharePoint edition.

The `research/` files in this repository are curated public evidence ledgers, bilingual roadmap inputs and sanitized validation receipts required by the site or its checks. Local review transcripts, intermediate research, execution state and tool caches are not release inputs. Preserve those privately when preparing a public source branch.

The standalone Studio retains its own source and deployment lineage. The broader NVM Knowledge Hub includes related learning material and an integrated whitepaper tool; updates to this repository do not replace that site's content or deployments.

## Local use

```powershell
npm ci
npm run check
npm run dev
```

Open `http://localhost:4175/`.

For full browser validation, first run `npm run build` and keep `npm run preview` running on port 4175. With Playwright Chromium installed, run:

```powershell
npm run qa:i18n
npm run qa:render
npm run qa:roadmap
npm run qa:experience
npm run qa:accessibility
npm run qa:diagrams
```

These checks cover both languages, all eight views, responsive layouts, keyboard navigation, source disclosure and roadmap filtering. QA output is local and ignored by Git.

The experience regression also checks browser history, shareable matrix filters and exports, malformed chapter links, deferred panel creation, and clipboard success or manual recovery. Set `NVM_QA_BROWSER=msedge` and `NVM_QA_HEADED=1` to run that check in an installed, visible Microsoft Edge window. `NVM_QA_BASE` can target the published site for the same acceptance checks.

`qa:accessibility` uses the already installed Playwright Chromium, Firefox and WebKit engines at 1280, 390 and 320 CSS pixels in both languages. It checks all eight views with axe-core (WCAG A/AA rules and best practices), tab-panel entry, skip navigation, menu escape, history focus, responsive table headers, descriptive control names and reduced motion. Chromium also verifies table headers in its platform accessibility tree and exercises forced colors. A missing engine fails the command; it does not install software. Set `NVM_QA_ENGINES=edge` for an installed Edge run, or a comma-separated engine list for a targeted rerun. Set `NVM_QA_ENGINE=firefox` or `webkit` to run the experience regression in those engines.

These are automated browser-engine, viewport and semantic checks. WebKit is not Safari, a narrow viewport is not a physical phone, and an accessibility tree is not audible screen-reader testing. The report preserves axe's incomplete/manual-review items separately from violations. Physical iPhone/Android, Safari on Apple hardware, and VoiceOver/NVDA/Narrator listening still need a real-device/assistive-technology session; these checks do not establish complete WCAG conformance.

`qa:diagrams` covers all five standalone diagrams in the same three engines and widths, with both themes, reachable toolbar targets, keyboard node focus, finder dismissal and an actual SVG download. After regenerating the pinned Archify HTML, run `npm run prepare:diagrams` to restore the main landmark, interactive SVG grouping, guided-view grouping, Chinese content language and mobile toolbar wrapping. `npm run check` verifies that this preparation is present; graph data and viewer runtime remain unchanged.

## Build and deployment

```powershell
npm run build
npm run preview
```

`npm run build` produces a preview build. A releasable build must come from a clean `master` commit:

```powershell
npm run check
npm run build:pages
npm run release:pages
```

The release build writes `dist/.nojekyll` and `dist/deploy-manifest.json`. The manifest binds the artifact set to the exact source commit, source tree, package-lock hash, POV contract and Knowledge Hub governance reference. It is generated after the source commit and is not source-controlled metadata.

The reviewed source lives on `master`. The compiled `dist` output is published from the root of `gh-pages` at <https://samhuang68.github.io/nvm-whitepaper-site/>. After publication, verify that local `dist`, `origin/master`, `origin/gh-pages` and anonymous GitHub Pages all resolve to the same source and artifact hashes:

```powershell
npm run check:deploy
npm run check:deploy:live
```

The branch-based publishing path remains compatible with GitHub credentials that do not carry workflow-edit scope, while the manifest prevents an old or hand-edited `gh-pages` branch from being mistaken for the current source.
