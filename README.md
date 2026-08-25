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

The reviewed source lives on `master`. The compiled `dist` output is published from the root of the `gh-pages` branch, with a `.nojekyll` marker, at <https://samhuang68.github.io/nvm-whitepaper-site/>. This branch-based source keeps deployment compatible with GitHub credentials that do not carry workflow-edit scope.
