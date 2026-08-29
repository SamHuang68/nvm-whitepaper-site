export const phase4Metadata = {
  schemaVersion: '1.0',
  packageId: 'NVM-SHAREPOINT-PREVIEW-PUBLIC',
  packageRevision: '2026-08-29-r24',
  povContractId: 'POV-NVM-WEB-2026-08-29',
  povScopeId: 'POV-NVM-HUB-NEUTRAL-2026-08-29',
  evidenceTaxonomy: ['Direct observation', 'Public requirement', 'Vendor disclosure', 'Published implementation example', 'Bounded inference', 'Open validation'],
  actorTaxonomy: ['Author', 'Editorial publisher', 'Vendor', 'Foundry', 'Standards body', 'Contributor', 'Independent evaluator'],
  canonicalFields: [
    { field: 'Technology Family', internalKey: 'TechnologyFamily', type: 'Choice', required: true, values: ['OTP', 'MTP', 'eFlash', 'MRAM', 'ReRAM', 'Companion', 'Cross-family'], visibility: 'Public/Restricted', indexed: true, purpose: 'Technology or companion primitive', example: 'OTP' },
    { field: 'State Contract', internalKey: 'StateContract', type: 'Choice', required: true, values: ['Immutable', 'Monotonic', 'Bounded', 'Adaptive', 'Operational', 'Multiple'], visibility: 'Public/Restricted', indexed: true, purpose: 'Persistence promise and update semantics', example: 'Immutable' },
    { field: 'Application Domain', internalKey: 'ApplicationDomain', type: 'Managed metadata', required: true, values: ['Security and identity', 'Secure boot and lifecycle', 'Power and mixed signal', 'Board-level security', 'Platform cryptographic services', 'Embedded code and configuration', 'Advanced-node embedded state', 'AI systems and heterogeneous packages', 'AI systems'], visibility: 'Public/Restricted', indexed: true, purpose: 'System context that gives the state meaning', example: 'Security and identity' },
    { field: 'Process Node', internalKey: 'ProcessNode', type: 'Single line text', required: false, values: 'Bounded public wording', visibility: 'Public/Restricted', indexed: true, purpose: 'Node or platform boundary without implying qualification', example: 'Advanced-node logic' },
    { field: 'Evidence Class', internalKey: 'EvidenceClass', type: 'Choice', required: true, values: ['Direct observation', 'Public requirement', 'Vendor disclosure', 'Published implementation example', 'Bounded inference', 'Open validation'], visibility: 'Public/Restricted', indexed: true, purpose: 'How the source supports the claim', example: 'Bounded inference' },
    { field: 'Source', internalKey: 'SourceLocator', type: 'Hyperlink or text', required: true, values: 'Public URL or restricted-library ID', visibility: 'Scope-controlled', indexed: false, purpose: 'Traceable source locator', example: 'Public evidence ledger' },
    { field: 'Limitation', internalKey: 'Limitation', type: 'Multiple lines text', required: true, values: 'Free text', visibility: 'Public/Restricted', indexed: false, purpose: 'What the evidence does not establish', example: 'Target-silicon PVT pending' },
    { field: 'Review Status', internalKey: 'ReviewStatus', type: 'Choice', required: true, values: ['Draft', 'Reviewed', 'Approved', 'Evidence required'], visibility: 'Public/Restricted', indexed: true, purpose: 'Governed maturity of the exact record revision', example: 'Evidence required' }
  ],
  operationalFields: [
    { displayName: 'Content Owner Key', internalKey: 'ContentOwnerKey', type: 'Single line text', required: true, visibility: 'Public key', indexed: true },
    { displayName: 'Editorial Publisher Key', internalKey: 'EditorialPublisherKey', type: 'Single line text', required: true, visibility: 'Public key', indexed: true },
    { displayName: 'Visibility', internalKey: 'Visibility', type: 'Choice', required: true, visibility: 'Public', indexed: true },
    { displayName: 'POV Contract ID', internalKey: 'POVContractID', type: 'Single line text', required: true, visibility: 'Public', indexed: true },
    { displayName: 'Last Reviewed', internalKey: 'LastReviewed', type: 'Date only', required: true, visibility: 'Public/Restricted', indexed: true },
    { displayName: 'Migration ID', internalKey: 'MigrationID', type: 'Single line text', required: true, visibility: 'Public/Restricted', indexed: true }
  ],
  publicRecords: [
    {
      RecordID: 'PUB-NVM-001', RecordRevision: '2026-08-29:PUB-NVM-001:r1', Title: 'Immutable Device Identity Architecture',
      TechnologyFamily: 'OTP', StateContract: 'Immutable', ApplicationDomain: 'Security and identity', ProcessNode: 'Node-specific implementation', EvidenceClass: 'Bounded inference', SourceLocator: 'https://www.synopsys.com/articles/secure-storage-solution-otp-ip.html', Limitation: 'Target-silicon lifecycle and security assurance remain implementation-specific', ReviewStatus: 'Draft',
      SourceID: 'OIP-PUF-001', SourceActor: 'Vendor', LastReviewed: '2026-08-29', ReviewerKey: 'nvm-hub', ContentOwnerKey: 'sam-huang', EditorialPublisherKey: 'nvm-hub', Visibility: 'Public', POVContractID: 'POV-NVM-WEB-2026-08-29', MigrationID: 'PUB-NVM-001'
    },
    {
      RecordID: 'PUB-NVM-002', RecordRevision: '2026-08-29:PUB-NVM-002:r1', Title: 'Bounded Calibration Selection Note',
      TechnologyFamily: 'Cross-family', StateContract: 'Bounded', ApplicationDomain: 'Power and mixed signal', ProcessNode: 'Platform-specific device-voltage boundary', EvidenceClass: 'Bounded inference', SourceLocator: 'https://www.synopsys.com/dw/nvmipselector.php', Limitation: 'Programming voltage, endurance, retention and power-fail behavior require target-platform confirmation', ReviewStatus: 'Evidence required',
      SourceID: 'PORTFOLIO-SELECTOR-001', SourceActor: 'Vendor', LastReviewed: '2026-08-29', ReviewerKey: 'nvm-hub', ContentOwnerKey: 'sam-huang', EditorialPublisherKey: 'nvm-hub', Visibility: 'Public', POVContractID: 'POV-NVM-WEB-2026-08-29', MigrationID: 'PUB-NVM-002'
    },
    {
      RecordID: 'PUB-NVM-003', RecordRevision: '2026-08-29:PUB-NVM-003:r1', Title: 'AI Package Persistent-State Map',
      TechnologyFamily: 'Cross-family', StateContract: 'Multiple', ApplicationDomain: 'AI systems', ProcessNode: 'Multi-die and advanced-node', EvidenceClass: 'Bounded inference', SourceLocator: 'https://drive.google.com/file/d/1VODBOiUpNS8bLWpfNfbyBtdBLhtIAsEm/view', Limitation: 'The OCP-listed Lightmatter contribution is not an adopted specification; component ownership and NVM fit remain architecture candidates', ReviewStatus: 'Draft',
      SourceID: 'AI-NVM-OCP-001..004', SourceActor: 'Contributor', LastReviewed: '2026-08-29', ReviewerKey: 'nvm-hub', ContentOwnerKey: 'sam-huang', EditorialPublisherKey: 'nvm-hub', Visibility: 'Public', POVContractID: 'POV-NVM-WEB-2026-08-29', MigrationID: 'PUB-NVM-003'
    }
  ]
};
