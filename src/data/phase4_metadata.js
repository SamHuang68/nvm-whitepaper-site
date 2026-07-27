/**
 * Phase-4: Metadata & Taxonomy System
 * Taxonomy structures for SharePoint Search and internal asset classification.
 */

export const phase4Metadata = {
  taxonomyGroups: [
    {
      category: 'Process Node (製程節點)',
      tags: ['130nm BCD', '80nm HV', '55nm ULP', '40nm LP', '28nm HPC+', '22nm ULP', '12nm FFC']
    },
    {
      category: 'NVM IP Type (IP 種類)',
      tags: ['Logic OTP', 'Logic MTP', 'Antifuse OTP', 'Embedded Flash', 'ReRAM', 'PUF Security']
    },
    {
      category: 'Application Domain (應用領域)',
      tags: ['Automotive Grade 0', 'Automotive Grade 1', 'Edge AI MCU', 'Consumer IoT', 'Smart Card / eSIM', 'Industrial Control']
    },
    {
      category: 'Confidentiality Level (機密等級)',
      tags: ['Public Marketing', 'Internal Confidential', 'Customer Restricted NDA', 'Foundry Qualified']
    }
  ],

  searchIndex: [
    { id: 'item_1', title: 'Automotive Grade-0 Logic OTP IP Spec', tags: ['28nm HPC+', 'Logic OTP', 'Automotive Grade 0', 'Internal Confidential'] },
    { id: 'item_2', title: 'Logic MTP Zero Mask Cost Advantage Paper', tags: ['40nm LP', 'Logic MTP', 'Consumer IoT', 'Public Marketing'] },
    { id: 'item_3', title: 'Edge AI MCU Memory Selector Guide', tags: ['22nm ULP', 'ReRAM', 'Edge AI MCU', 'Customer Restricted NDA'] },
    { id: 'item_4', title: 'Smart Card Anti-DPA PUF Security Whitepaper', tags: ['55nm ULP', 'PUF Security', 'Smart Card / eSIM', 'Internal Confidential'] }
  ]
};
