/**
 * NVM IP Specs for Interactive Comparison Matrix
 */

export const nvmIpSpecs = [
  {
    name: 'NeoOTP-28HPC+',
    type: 'Logic OTP',
    node: '28nm HPC+',
    density: '64Kb - 512Kb',
    extraMasks: 0,
    readVoltage: '0.9V',
    readLatency: '8 ns',
    retention: '10 Years @ 150°C',
    endurance: '1 Cycle',
    grade: 'AEC-Q100 Grade 0',
    areaPerKb: '0.0012 mm²'
  },
  {
    name: 'NeoMTP-40LP',
    type: 'Logic MTP',
    node: '40nm LP',
    density: '16Kb - 256Kb',
    extraMasks: 0,
    readVoltage: '1.1V',
    readLatency: '12 ns',
    retention: '10 Years @ 125°C',
    endurance: '1,000 Cycles',
    grade: 'AEC-Q100 Grade 1',
    areaPerKb: '0.0035 mm²'
  },
  {
    name: 'eFlash-40ULP',
    type: 'Embedded Flash',
    node: '40nm ULP',
    density: '512Kb - 4Mb',
    extraMasks: 10,
    readVoltage: '1.2V',
    readLatency: '20 ns',
    retention: '10 Years @ 125°C',
    endurance: '100,000 Cycles',
    grade: 'AEC-Q100 Grade 1',
    areaPerKb: '0.0008 mm²'
  },
  {
    name: 'NeoPUF-22ULP',
    type: 'PUF Security',
    node: '22nm ULP',
    density: '1Kb - 16Kb',
    extraMasks: 0,
    readVoltage: '0.8V',
    readLatency: '5 ns',
    retention: '15 Years @ 150°C',
    endurance: '1 Cycle',
    grade: 'AEC-Q100 Grade 0',
    areaPerKb: '0.0010 mm²'
  }
];
