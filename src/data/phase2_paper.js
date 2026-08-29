export const phase2Whitepaper = {
  title: 'Selecting NVM by State Contract, Process Boundary and Evidence',
  subtitle: 'A public architecture guide for turning persistent-state requirements into defensible technology decisions',
  author: 'Sam Huang',
  editorialPublisher: 'NVM Knowledge Hub',
  povContractId: 'POV-NVM-WEB-2026-08-29',
  povScopeId: 'POV-NVM-HUB-NEUTRAL-2026-08-29',
  version: 'Public working draft',
  publishDate: '2026-08-29',
  chapters: [
    {
      id: 'state-contract',
      number: '01',
      title: 'Begin With the State Contract',
      lede: 'The first decision is not OTP versus MTP. It is the promise the system must keep after power is removed.',
      paragraphs: [
        'Persistent state carries an owner, update cadence, retention obligation, recovery rule and threat boundary. Two bit arrays of similar size can therefore require very different architectures: an immutable lifecycle transition is not governed like a field-updatable calibration table.',
        'A useful state contract names who may create the state, when it may change, which failures must be recoverable and what evidence proves the contract across process, voltage, temperature and lifecycle conditions.'
      ],
      takeaways: ['Define state before technology', 'Separate immutability from update policy', 'Treat recovery as part of retention'],
      evidenceClass: 'Bounded inference',
      limitation: 'Implementation targets still require product- and process-specific validation.',
      openValidation: 'Name the state owner, update authority, recovery rule and evidence required for the target system.',
      sources: [{ id: 'AI-NVM-INF-001', label: 'NVM persistent-state contract model', url: 'https://samhuang68.github.io/secure-storage-knowledge-hub/ai-nvm-opportunities.html#abstraction', evidenceClass: 'Bounded inference', actor: 'Editorial publisher' }]
    },
    {
      id: 'technology-boundaries',
      number: '02',
      title: 'Map Technology Families to the Contract',
      lede: 'Each NVM family expresses a different compromise among permanence, updates, density, voltage and process integration.',
      paragraphs: [
        'OTP is naturally aligned with immutable or monotonic state. MTP and EEPROM-class structures support bounded changes but introduce endurance, programming-energy and high-voltage questions. Embedded Flash addresses code-rich systems where its process integration is economically justified. MRAM and ReRAM extend the advanced-node portfolio, but availability and qualification remain platform specific.',
        'SRAM PUF is a companion security primitive rather than a peer non-volatile medium. It can derive a device-unique root secret at power-up so persistent memory stores ciphertext or helper data instead of a reusable root key. That architecture raises assurance requirements of its own; it does not erase them.'
      ],
      takeaways: ['Do not model PUF as stored NVM', 'Qualify program and read paths separately', 'Avoid technology labels without a state owner'],
      evidenceClass: 'Bounded inference',
      limitation: 'Technology availability, reliability and security claims vary by supplier and target process.',
      openValidation: 'Confirm the target macro, process option, write path, PVT, lifecycle and security-assurance scope.',
      sources: [
        { id: 'OIP-ARCH-001 · OIP-PUF-001', label: 'Secure Storage public architecture', url: 'https://www.synopsys.com/articles/secure-storage-solution-otp-ip.html', evidenceClass: 'Vendor disclosure', actor: 'Vendor' },
        { id: 'AI-NVM-ADV-004', label: 'Public eNVM portfolio direction', url: 'https://www.tsmc.com/english/dedicatedFoundry/technology/specialty/eflash', evidenceClass: 'Vendor disclosure', actor: 'Foundry' }
      ]
    },
    {
      id: 'node-boundary',
      number: '03',
      title: 'Treat Node Migration as an Integration Decision',
      lede: 'NVM scaling is shaped by device options, mask economics, program voltage and qualification effort—not geometry alone.',
      paragraphs: [
        'Floating-gate MTP relies on an oxide and high-voltage environment capable of preserving programmed charge. A process portfolio that only exposes lower-voltage devices can therefore narrow implementation choices. Dedicated embedded-flash integration can introduce a purpose-built oxide, but additional process complexity changes the commercial equation.',
        'The frequently cited 28 nm boundary for conventional embedded Flash is best read as a clear public commercialization high point, not a law of physics. Beyond it, development difficulty, mask-stack expansion and cost can outweigh the benefit. At more advanced nodes, foundry roadmaps increasingly turn to MRAM or ReRAM, while logic-compatible OTP continues to serve small persistent-state needs.',
        'For advanced-node OTP, a single-VDD read mode can reduce always-on power-domain dependencies and simplify power sequencing. Programming can remain a separate event that uses an I/O supply as the foundation for an internal charge pump. Public architecture should state that separation without disclosing proprietary circuit detail.'
      ],
      takeaways: ['Node names are not portability proof', 'Separate read simplification from program infrastructure', 'Model mask and qualification cost as system constraints'],
      evidenceClass: 'Bounded inference',
      limitation: 'Vendor-specific voltage coverage, mask counts and product roadmaps require internal portfolio evidence before customer use.',
      openValidation: 'Confirm the exact process option, macro, read/program supplies, mask stack, qualification and commercial availability.',
      sources: [
        { id: 'AI-NVM-ADV-003', label: 'Measured 28 nm eFlash implementation example', url: 'https://doi.org/10.1109/IMW48823.2020.9108118', evidenceClass: 'Published implementation example', actor: 'Independent evaluator' },
        { id: 'AI-NVM-ADV-004', label: 'Public foundry eNVM portfolio', url: 'https://www.tsmc.com/english/dedicatedFoundry/technology/specialty/eflash', evidenceClass: 'Vendor disclosure', actor: 'Foundry' },
        { id: 'AI-NVM-ADV-005', label: 'Direct core-supply read for a listed OTP macro', url: 'https://www.synopsys.com/dw/doc.php/ds/e/dwc_nvm_xhf_otp_ds.pdf', evidenceClass: 'Vendor disclosure', actor: 'Vendor' },
        { id: 'OWNER-NOTE-PGM-IO-001', label: 'Programming supply as charge-pump input', url: 'https://samhuang68.github.io/secure-storage-knowledge-hub/ai-nvm-opportunities.html#advanced-nodes', evidenceClass: 'Bounded inference', actor: 'Author', sourceRole: 'owner-provided' }
      ]
    },
    {
      id: 'decision-evidence',
      number: '04',
      title: 'Make the Decision Evidence-Aware',
      lede: 'A decision matrix is useful only when it makes uncertainty visible instead of converting assumptions into specifications.',
      paragraphs: [
        'Public evidence can establish mechanisms, disclosed product availability and demonstrated use cases. Supplier claims may describe performance or qualification. Architecture inference can connect those facts to a system proposal. Target-silicon evidence is still required to close PVT, retention, endurance, power and attack-resilience claims for a specific implementation.',
        'Every comparison row should therefore carry a source class, scope, limitation, review status and next validation action. Unsupported precision should be removed; a categorical range with an explicit evidence gap is more trustworthy than an exact number without provenance.'
      ],
      takeaways: ['Never let UI polish promote an assumption to fact', 'Bind every claim to scope and limitation', 'Use open gaps to drive the next validation action'],
      evidenceClass: 'Bounded inference',
      limitation: 'This public workbench intentionally excludes confidential qualification and customer data.',
      openValidation: 'Bind each target claim to a source, scope, limitation, reviewed revision and next validation owner.',
      sources: [{ id: 'EVIDENCE-LEDGER', label: 'NVM Knowledge Hub evidence ledger', url: 'https://samhuang68.github.io/secure-storage-knowledge-hub/memory-evidence.html', evidenceClass: 'Bounded inference', actor: 'Editorial publisher' }]
    },
    {
      id: 'enterprise-transfer',
      number: '05',
      title: 'Transfer the Knowledge, Not Just the Page',
      lede: 'SharePoint migration succeeds when content has a stable contract before it enters the corporate system.',
      paragraphs: [
        'The canonical record begins with Technology Family, State Contract, Application Domain and Process Node. Evidence Class, Source, Limitation and Review Status make the record governable. Operational fields such as owner, visibility, review date and migration ID make it maintainable.',
        'The public site supplies a clean knowledge spine. The internal SharePoint version can add confidential product data, foundry qualification, customer context and validation artifacts without changing the information architecture. Copilot then operates over governed metadata rather than an unstructured document dump.'
      ],
      takeaways: ['Preserve the eight-field content contract', 'Keep public and restricted evidence separate', 'Make review status machine-readable'],
      evidenceClass: 'Bounded inference',
      limitation: 'Final column types, permissions and retention policies must align with the company tenant.',
      openValidation: 'Map public keys to corporate Person fields, permissions, content types, retention and review workflow after migration.',
      sources: [{ id: 'POV-NVM-WEB-2026-08-29', label: 'Public POV and release contract', url: 'https://samhuang68.github.io/secure-storage-knowledge-hub/data/institutional-pov-contract.json', evidenceClass: 'Direct observation', actor: 'Editorial publisher' }]
    }
  ]
};
