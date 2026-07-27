/**
 * Phase-3: Article Templates Data
 * Modular templates: Solution Brief, Tech Deep Dive, Product Spec Sheet.
 */

export const phase3Templates = [
  {
    id: 'solution_brief',
    type: 'Solution Brief',
    title: 'Automotive Grade-0 Logic OTP IP Solution Brief',
    targetAudience: 'System Architects, Product Managers',
    summary: 'A 2-page concise overview detailing AEC-Q100 Grade 0 compliance for trim and security key storage.',
    sections: [
      { heading: 'Market Challenge', body: 'Strict AEC-Q100 Grade 0 specs demand 150°C retention without inflating mask costs.' },
      { heading: 'NVM IP Solution', body: '0-mask Logic OTP with integrated anti-tamper security and low power read.' },
      { heading: 'Key Differentiators', body: '100% CMOS compatible, zero process adders, 100K read endurance.' }
    ]
  },
  {
    id: 'tech_deep_dive',
    type: 'Tech Deep Dive',
    title: 'High-Temperature Oxide Breakdown Physics in Antifuse OTP',
    targetAudience: 'Semiconductor Engineers, IP Selection Leads',
    summary: 'Comprehensive technical white paper on atomic-level silicon breakdown mechanisms under HTOL stress.',
    sections: [
      { heading: 'Physical Mechanism', body: 'Nanometer-scale dielectric soft-breakdown transitioning to stable metallic filament formation.' },
      { heading: 'Reliability Modeling', body: 'Arrhenius thermal extrapolation verifying 10+ year data retention at 150°C junction temperature.' },
      { heading: 'Test Methodology', body: 'Wafer Level Reliability (WLR) and high-voltage stress test vector profiles.' }
    ]
  },
  {
    id: 'product_spec_sheet',
    type: 'Product Spec Sheet',
    title: '28nm HPC+ Logic MTP IP Technical Specification',
    targetAudience: 'CAD Engineers, SoC Integration Engineers',
    summary: 'Complete pinout, timing specs, power numbers, and layout dimensions for CAD integration.',
    sections: [
      { heading: 'Macro Specifications', body: 'Density: 64Kb - 512Kb, Power Supply: 0.9V Core / 1.8V IO, Area: 0.08mm² @ 64Kb.' },
      { heading: 'Interface & Timing', body: 'Parallel SRAM-like interface, T_read = 12ns, T_write = 1.2ms per word.' },
      { heading: 'Deliverables', body: 'GDSII, LEF, Liberty (.lib), Verilog Model, DRC/LVS Runsets.' }
    ]
  }
];
