# NVM Whitepaper & Decision Studio

A public, evidence-governed workbench within the [NVM Knowledge Hub](https://samhuang68.github.io/secure-storage-knowledge-hub/). It turns NVM state requirements into readable whitepapers, technology comparisons and SharePoint-ready content records.

## Knowledge architecture

- **NVM Overview** — state contracts, technology families and process-node lenses
- **Technical Whitepaper** — architecture narrative with evidence class and limitation per chapter
- **Decision Matrix** — illustrative selection profiles, never unqualified product specifications
- **SharePoint Taxonomy** — canonical and operational metadata for later Copilot use
- **Content Templates** — reusable, functional outlines for governed authoring

Canonical transfer fields:

`Technology Family → State Contract → Application Domain → Process Node → Evidence Class → Source → Limitation → Review Status`

## Public boundary

This repository contains public working material only. Vendor-specific qualification, confidential portfolio data, customer context and target-silicon results belong in the restricted company SharePoint edition.

## Local use

```powershell
npm ci
npm run check
npm run dev
```

Open `http://localhost:4175/`.

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
