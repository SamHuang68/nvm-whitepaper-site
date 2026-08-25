export const nvmIpSpecs = [
  {
    id: 'immutable',
    profile: 'Immutable identity',
    family: 'OTP',
    contract: 'Program once; verify throughout life',
    nodeLens: 'Broad logic-node applicability; provider-specific implementation',
    updateModel: 'None or monotonic lifecycle transition',
    strongestFit: 'Boot trust, device identity, lifecycle state',
    boundary: 'Rotation and recovery require a system-level mechanism',
    evidenceStatus: 'Architecture baseline'
  },
  {
    id: 'bounded',
    profile: 'Bounded calibration',
    family: 'MTP / EEPROM class',
    contract: 'Rare, controlled updates',
    nodeLens: 'Constrained by device stack, programming supply and process option',
    updateModel: 'Manufacturing plus limited field changes',
    strongestFit: 'Trim, remap, calibration tables',
    boundary: 'Endurance and retention must be qualified together',
    evidenceStatus: 'Platform evidence required'
  },
  {
    id: 'code',
    profile: 'Code-rich embedded state',
    family: 'Embedded Flash',
    contract: 'Managed firmware updates',
    nodeLens: 'Commercial fit depends on integration and mask economics',
    updateModel: 'Signed update with recovery path',
    strongestFit: 'Embedded code and larger configuration sets',
    boundary: 'Do not treat the 28 nm commercialization boundary as a physics law',
    evidenceStatus: 'Node-specific decision'
  },
  {
    id: 'advanced',
    profile: 'Advanced-node embedded state',
    family: 'MRAM / ReRAM',
    contract: 'Adaptive or code-bearing state',
    nodeLens: 'Foundry module and qualification status dominate',
    updateModel: 'Application-specific',
    strongestFit: 'Advanced-node capacity where a qualified module exists',
    boundary: 'Availability does not establish target application readiness',
    evidenceStatus: 'Foundry evidence required'
  },
  {
    id: 'secure',
    profile: 'Secure persistent repository',
    family: 'OTP + SRAM PUF + crypto',
    contract: 'Ciphertext persists; root key is regenerated',
    nodeLens: 'System architecture spans memory, logic and security controls',
    updateModel: 'Controlled encrypted transactions',
    strongestFit: 'Secrets protected above physically observable storage',
    boundary: 'PUF reliability and physical attack assurance remain validation obligations',
    evidenceStatus: 'Architecture inference'
  }
];
