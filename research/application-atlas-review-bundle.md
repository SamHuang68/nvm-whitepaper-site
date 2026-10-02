# Application Atlas review bundle

Freeze: R24-NVM-APPLICATION-ATLAS-2026-09-04
POV: neutral NVM Knowledge Hub editor
Rule: a vendor page is disclosed capability, not independent proof, a customer design win, qualification, shipment or royalty.

## Candidate cases

1. OAI accelerator RoT — OCP OAI-OAM names immutable RoT behavior and OTP as an example. It does not select vendor, density, PUF or location.
2. HBM repair — NVIDIA documents persistent fuse-programmed repair and attestation impact; Micron distinguishes volatile soft repair from permanent hard repair. Fuse technology and die location are not public or universal.
3. AI SoC SRAM/cache repair — Synopsys STAR Memory System can interface with OTP or foundry eFuse. Density crossover and product design wins are not public.
4. BMC secure boot — ASPEED socsec documents OTP image, key, patch and ECC flows for supported devices. Do not generalize to every BMC.
5. Caliptra RoT — public fuse fields include UDS seed, hashes, revocation and lifecycle state. A standards-compliant PUF may supply an obfuscation key; it complements rather than removes lifecycle fuses.
6. RP2350 security — Raspberry Pi documents Synopsys OTP for keys, locks and provisioning. IOActive extracted state from the tested 40-nm family. This defeats absolute invisibility claims, not every antifuse macro.
7. SHIELD dielet — DARPA documents a 28-nm dielet with a 256-bit NVM-programmed secret; a Kilopass disclosure cites a 320-bit OTP block. Public bit allocation remains unresolved.
8. DDR5 PMIC — Renesas P8911 discloses MTP configuration and persistent error logging in a JEDEC-compatible device. It does not prove one physical MTP architecture is mandatory.
9. DDR5 SPD Hub — Renesas SPD5118 discloses a 1,024-byte EEPROM in sixteen protected blocks. Endurance and ownership remain integration inputs.
10. Automotive digital power — MPS MPQ2967 discloses on-chip MTP with CRC/ECC for configuration and fault parameters. Capacity, endurance, process and IP supplier are not disclosed.
11. Edge-vision sensor — ST VD55G1 discloses at least 1 Kbit embedded OTP for traceability and customer data. It does not state AI models, calibration or root keys.
12. Environmental sensor — Bosch BME280 stores factory trim coefficients in NVM and prevents customer changes. Cell type, node and IP supplier are not disclosed.
13. FPGA RoT — eMemory announces Achronix Speedster7t adoption of NeoFuse and NeoPUF. Achronix separately confirms PUF-backed key protection in the family, but does not name eMemory or NeoFuse. These are participant disclosures, not an independent attack certification.
14. Retimer opportunity — TI and Microchip public products load state from external EEPROM or SPI flash. Embedded MTP/eFlash/MRAM is a bounded opportunity hypothesis.
15. Photonic PCM — a peer-reviewed GST photonic switch demonstrates nonvolatile state without static hold power. It is research-grade, not commercial OTP/MTP availability.
16. OAI UBB FRU — OAI-UBB requires one BMC-accessible board-level FRU EEPROM using the IPMI FRU format. It does not require SoC integration, embedded MTP, a particular density or supplier.
17. ELSFP saved configuration — OIF ELSFP-CMIS defines User NV RAM and two host-selected save slots plus a factory set. It leaves the physical NVM implementation, density and endurance open.
18. FIDO authenticator state — WebAuthn Level 3 became a W3C Recommendation on 2026-08-25, and CTAP 2.2 is a FIDO Proposed Standard. They define credential-source and storage-modality behavior without mandating a Secure Element, PUF or memory type. The FIDO certification table lists v1.7 as ACTIVE even though the linked document remains a Review Draft and says it is not an implementation basis; v1.6 remains active until 2027-01-13, while v1.5.1 has no listed expiry and remains mandatory for L3/L3+ certification.

## Portfolio history

Synopsys had MTP capability before acquiring Sidense in 2017 and Kilopass in 2018. Sidense added publicly described 1T-Fuse OTP; Kilopass added 1T/2T antifuse OTP, code-storage and security positioning. The current DesignWare portfolio unifies OTP, FTP and MTP. Public records do not establish one-to-one genealogy for every current macro.

## Required public labels

- PUBLIC REQUIREMENT — a public specification defines the state behavior
- NAMED IMPLEMENTATION — a named product or program discloses an implementation
- INDEPENDENT OBSERVATION — a third party measured or attacked it
- VENDOR DISCLOSURE — a vendor describes capability or adoption
- BOUNDED INFERENCE — application fit is plausible but not implemented in the cited source
- EMERGING RESEARCH — peer-reviewed research without commercial product evidence

Every expanded case must show: persistent payload; write cadence; first reader after power-up; operational consumer; candidate technology; what the source proves; what it does not prove; validation gate; exact links.

Interaction: desktop master-detail with a case rail and native HTML/SVG state flow. Mobile uses a select or accordion and one-column detail; no horizontal dragging at 312 px. Minimum target 44 px. Preserve selected case across language changes. English and Traditional Chinese must be complete.
