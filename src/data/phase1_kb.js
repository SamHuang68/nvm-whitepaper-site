/**
 * Phase-1: NVM Knowledge Base Data
 * Covers Applications, Foundry Intelligence, and Competitor Matrix.
 */

export const phase1KnowledgeBase = {
  applications: [
    {
      id: 'automotive',
      title: 'Automotive & Mobility (Grade 0/1)',
      icon: '🚗',
      description: 'Zero-defect requirements with operational temp up to 150°C and 10+ years retention.',
      keyMetrics: { retention: '10+ Years @ 150°C', endurance: '100K Cycles', zeroDefect: 'AEC-Q100 Grade 0' },
      useCases: ['Trim Bit Storage', 'Engine Control Units (ECU)', 'ADAS Sensor Calibration', 'Battery Management (BMS)'],
      techReq: 'High Reliability, Zero Extra Mask, Extended Temperature Tolerance'
    },
    {
      id: 'ai_mcu',
      title: 'Edge AI & Microcontrollers (MCU)',
      icon: '🧠',
      description: 'Ultra-low latency weight storage and security key storage for edge neural accelerators.',
      keyMetrics: { latency: '<15ns Read', power: 'Sub-uA Standby', density: '256Kb - 16Mb' },
      useCases: ['AI Model Weights', 'Secure Boot Keys', 'Code Storage (XIP)', 'Feature Configuration'],
      techReq: 'High Speed Read, Low Read Power, High Security Against DPA Attacks'
    },
    {
      id: 'iot',
      title: 'Ultra-Low Power IoT & Wearables',
      icon: '⌚',
      description: 'Energy-harvesting and battery-constrained devices requiring sub-uA sleep currents.',
      keyMetrics: { power: '0.1uA Standby', voltage: '0.9V - 3.6V Wide Range', cost: 'Minimum Silicon Area' },
      useCases: ['BLE Beacon Config', 'Medical Wearable Logs', 'Smart Metering Calibration', 'RF Tag IDs'],
      techReq: 'Logic OTP/MTP, Smallest Footprint, Standard CMOS Process Compatibility'
    },
    {
      id: 'smartcard',
      title: 'Smart Card & Secure Elements',
      icon: '💳',
      description: 'Cryptographic chipsets requiring high anti-tamper security and multi-OTP key protection.',
      keyMetrics: { security: 'Anti-DPA / Anti-Laser', writeVoltage: 'On-chip Charge Pump', endurance: '10K Cycles' },
      useCases: ['Banking SIM/eSIM', 'Government ID', 'Hardware Crypto Keys', 'Payment Terminals'],
      techReq: 'High Security OTP, Physical Unclonable Function (PUF) Integration'
    }
  ],

  foundryIntelligence: [
    {
      foundry: 'TSMC',
      nodes: ['80nm', '40nm', '28nm HPC+', '22nm ULP/ULL', '12nm FFC'],
      features: 'High yield maturity, logic-compatible OTP/MTP IP qualification across BCD, HV, and ULP nodes.',
      advantage: 'Zero additional mask steps needed for standard Logic OTP/MTP cores.'
    },
    {
      foundry: 'UMC',
      nodes: ['110nm', '55nm ULP', '40nm LP', '22nm ULP'],
      features: 'Robust automotive Grade 1 qualification, competitive PPA for IoT eNVM.',
      advantage: 'Cost-effective OTP/MTP macros with built-in high voltage pumps.'
    },
    {
      foundry: 'GlobalFoundries',
      nodes: ['130nm BCD', '55nm ULP', '22FDX (FD-SOI)'],
      features: 'Ultra-low voltage read capabilities suited for FD-SOI body-bias optimizations.',
      advantage: 'Low-power read operation below 0.8V.'
    }
  ],

  competitorMatrix: [
    {
      type: 'Logic OTP (Antifuse / Poly Fuse)',
      maskCount: '0 (Standard Logic)',
      costIndex: '1.0x (Baseline)',
      readSpeed: '<10 ns',
      retention: '10 Years @ 150°C',
      yieldRisk: 'Very Low',
      bestFor: 'Trim bits, Security Keys, Single-write Chip IDs'
    },
    {
      type: 'Logic MTP (Floating Gate / Charge Trap)',
      maskCount: '0 (Standard Logic)',
      costIndex: '1.1x',
      readSpeed: '<15 ns',
      retention: '10 Years @ 125°C',
      yieldRisk: 'Low',
      bestFor: 'Field-updatable Parameters, Calibration, Microcode Updates'
    },
    {
      type: 'Embedded Flash (eFlash)',
      maskCount: '+8 to +12 Extra Masks',
      costIndex: '1.4x - 1.6x',
      readSpeed: '<20 ns',
      retention: '10 Years @ 125°C',
      yieldRisk: 'Medium (Thermal Budget Impact)',
      bestFor: 'Large Code Storage (>4MB) on legacy nodes (>40nm)'
    },
    {
      type: 'Emerging NVM (ReRAM / MRAM)',
      maskCount: '+3 to +5 Extra Masks',
      costIndex: '1.3x - 1.5x',
      readSpeed: '<10 ns',
      retention: '10 Years @ 105°C',
      yieldRisk: 'High (Process Scaling Challenges)',
      bestFor: 'High-density Edge AI Weights on FinFET nodes'
    }
  ]
};
