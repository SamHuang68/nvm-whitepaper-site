# FIDO2、Secure Element 與 NVM 安全性證據台帳

審閱日期：2026-09-04
觀點：中立的 NVM Knowledge Hub 編輯者
用途：公開網站與後續 SharePoint 知識資料庫
狀態：主要來源交叉查核完成；特定產品實作仍須依目標版本與認證範圍重新確認

## 執行結論

FIDO2／WebAuthn／CTAP 定義 authenticator 行為、credential 語義，以及註冊與登入驗證流程；FIDO Authenticator Security and Privacy Requirements 則定義安全認證成果。它們不強制 Secure Element，也不指定 OTP、PUF、EEPROM、Flash、MTP、MRAM 或任何 bitcell。OTP、PUF 與可更新 NVM 的角色分工可形成一套有價值的高安全參考架構，但必須標示為 `REFERENCE ARCHITECTURE` 或 `IMPLEMENTATION-SPECIFIC`。

版本狀態（2026-09-04）：WebAuthn Level 3 已於 2026-08-25 成為 W3C Recommendation。FIDO 認證頁把 ASPR v1.7 列為 ACTIVE；但所連結的 v1.7 文件本身仍標示 Review Draft，並明示不應作為實作依據。v1.6 有效至 2027-01-13；v1.5.1 未列到期日，且 L3／L3+ 仍必須使用 v1.5.1。網站因此分開呈現「認證頁狀態」與「來源文件成熟度」，不把 ACTIVE 擴張解讀成 Final Specification。

網站採用以下證據層級：

1. `SPECIFICATION`：現行 WebAuthn、CTAP 與 metadata 規範直接建立的語義。
2. `HISTORICAL SPECIFICATION`：僅用於追溯術語演進、不得凌駕現行規範的歷史文件。
3. `CERTIFICATION REQUIREMENT`：FIDO security level 或 Protection Profile 建立的安全成果與評估條件。
4. `NAMED IMPLEMENTATION`：具名產品資料表或官方架構頁揭露的實作。
5. `VENDOR COLLATERAL`：廠商技術簡報揭露的控制類別，不能取代 data sheet 或 Security Target。
6. `INDEPENDENT ATTACK`：原始攻擊研究或獨立評估建立的受測攻擊路徑。
7. `INDEPENDENT RESEARCH`：學術研究建立的機制、假設與限制。
8. `REFERENCE ARCHITECTURE`：由前述證據推導、但未被 FIDO 強制或未由單一產品完整證明的設計模式。

## 核心主張台帳

### C01｜FIDO2 不要求 Secure Element

- 判定：`SPECIFICATION`
- 安全措辭：FIDO2 定義 authenticator 行為與安全語義，不限定必須由 Secure Element 實作；SE、TPM、TEE、受保護 SoC 子系統及其他合規邊界均可能承擔 authenticator 角色。
- 來源：W3C WebAuthn Level 3 §1、§6；FIDO ASPR v1.7 僅用於記錄認證頁的 ACTIVE 狀態，不能作為實作依據；v1.6 §2 支持一般認證邊界；涉及 L3／L3+ 時，認證基準改依 v1.5.1 與官方有效版本表。
- 限制：功能合規不等於取得較高 FIDO security level；認證範圍與攻擊能力仍須另行判定。

### C02｜Attestation 與 authentication 是不同階段

- 判定：`SPECIFICATION`
- 安全措辭：Attestation 是註冊時可選用的 authenticator 來源與特性證據；日常登入由綁定 RP 的 credential private key 簽署 authentication assertion。
- 來源：WebAuthn Level 3 §5.4.7、§6.5、§7.1、§7.2。
- 限制：驗證 attestation signature 不等於自動證明產品已取得 FIDO security certification；RP 還需可信 metadata 與本地政策。

### C03｜Attestation private key 不一定存在，也不一定放在 OTP

- 判定：`SPECIFICATION`
- 安全措辭：WebAuthn attestation type 包含 Basic（batch）、Self、AttCA、AnonCA 與 None。Enterprise attestation 是受控部署中的 conveyance／request mode，並非 §6.5.3 的獨立 attestation type。是否存在獨立 attestation private key，以及其生成、保存與輪替方式，取決於 attestation type、conveyance policy 與產品生命週期。
- 來源：WebAuthn Level 3 §5.4.7、§6.5.3；2015 Key Attestation §2 僅作歷史脈絡。
- 限制：Self attestation 直接使用 credential key；None 不提供可辨識的 attestation。不能以單一 OTP 架構泛化全部情境。

### C04｜AAGUID 是型號識別，不是晶片 UID

- 判定：`SPECIFICATION`
- 安全措辭：AAGUID 表示 authenticator 型號或實作品類；實質相同的 authenticator 必須共用 AAGUID，它不是每顆晶片的唯一序號。
- 來源：WebAuthn Level 3 `AAGUID` 定義；FIDO Metadata Statement 3.1。
- 限制：未經 attestation 驗證的 AAGUID 不具密碼學真實性；也不可把內部製造 UID 直接對外暴露為跨 RP correlation handle。

### C05｜Passkey 不是固定的 EEPROM 紀錄

- 判定：`SPECIFICATION`
- 安全措辭：Credential storage modality 可為 client-side discoverable 或 server-side；backup eligibility 是另一個正交維度，可為 single-device 或 multi-device。BE 在 credential 建立後不得改變；BS 表示目前備份狀態且可隨狀態改變，`BE=0, BS=1` 是不合法組合。Credential private key 由 authenticator 的邏輯安全邊界管理，物理持久化可採 secure NVM、authenticated wrapping、seed-based derivation 或受保護的備份機制。
- 來源：WebAuthn Level 3 §4、§6.1.3、§6.2.2；CTAP 2.2 §6.1.3。
- 限制：`client-side` 不必然等於離散 SE 內部；平台與 authenticator 可共同實作儲存邊界。

### C06｜Discoverable 與 server-side credential 形成不同 NVM 壓力

- 判定：`SPECIFICATION`
- 安全措辭：Discoverable credential 必須保留可依 RP ID 找回的 client-side state；server-side credential 可將加密 credential source 封裝於 RP 保存的 credential ID，降低 authenticator 的個別 credential NVM 需求。
- 來源：WebAuthn Level 3 §6.2.2；CTAP 2.2 §6.1.3。
- 限制：Server-side 模式仍需要持久 device root、wrapping key 或可重建 seed，並且需要 context binding、完整性與 anti-rollback。

### C07｜Signature counter 不是每顆裝置必備的 EEPROM 欄位

- 判定：`SPECIFICATION`
- 安全措辭：Signature counter 是可協助 RP 偵測複製風險的選用訊號；可採個別、全域或未實作而持續回傳 0。
- 來源：WebAuthn Level 3 §6.1.1。
- 限制：RP 也保存最近值；counter 異常只是風險訊號，multi-device credential 會使單調性判定更複雜。

### C08｜PUF 可重建裝置根，但不是 FIDO 必備元件

- 判定：`REFERENCE ARCHITECTURE`
- 安全措辭：在特定實作中，SRAM PUF 可在啟動時重建 device-bound root secret，供 KDF、key wrapping 或受保護 NVM 解封裝使用，而不必將 root secret 以明文持久儲存。
- 來源：Synopsys PUF／Secure Storage Solution；NXP LPC55Sxx SRAM PUF 為其他具名產品參考。
- 限制：Enrollment、helper data 完整性、ECC、PVT、老化、失效復原、KDF domain separation、fault 與暫態 side-channel 都仍在威脅面內。

### C09｜實體 OTP 與 logical OTP zone 必須分開

- 判定：`NAMED IMPLEMENTATION`
- 安全措辭：「OTP zone」可能是永久鎖定的可重寫 NVM 區域；名稱本身不證明底層採 Anti-Fuse 或 eFuse。
- 來源：Microchip ATECC608B-TFLXTLS 將 OTP zone 描述為 EEPROM array 的鎖定區。
- 限制：網站談 bitcell、燒錄電流、可視性或面積時，必須證明 physical OTP 類型，不能只看功能區名稱。

### C10｜可更新 NVM 的安全契約不只加密

- 判定：`CERTIFICATION REQUIREMENT`
- 安全措辭：所有位於 authenticator 內的 authenticator security parameter 都必須防止修改或置換；secret parameter 還須防止未授權洩露。儲存在 authenticator 邊界外的 parameter，另須使用允許的密碼功能防止修改與重播舊資料。內部可更新 NVM 的 freshness／rollback 政策則須依具體生命週期與威脅模型另行定義。
- 來源：FIDO Authenticator Security and Privacy Requirements v1.6 §3.2；GlobalPlatform FIDO2 SE Protection Profile。
- 限制：單純 XOR、address scrambling 或未驗證加密不能建立完整安全邊界。

### C11｜FIDO L3／L3+ 定義結果，不指定四項固定電路

- 判定：`CERTIFICATION REQUIREMENT`
- 安全措辭：FIDO 高安全等級對物理竄改、側道、timing 與 fault injection 設定可驗證結果及攻擊能力門檻；constant-time、masking、blinding、經目標晶片評估的隨機化、active shield、sensor、zeroization 與 scrambling 都只是可能對策。
- 來源：FIDO Authenticator Security and Privacy Requirements v1.5.1 §3.5 requirements 5.1、5.3–5.9；其中 5.4 明定祕密金鑰使用次數上限；FIDO Authenticator Certification Levels、Level 3 與 Level 3+ 官方說明。認證頁目前把 v1.7 列為 ACTIVE，但 v1.7 來源文件仍是 Review Draft 且不應作為實作依據；v1.6 可支援一般 ASP／storage protection 語意並有效至 2027-01-13；L3／L3+ 仍須使用 v1.5.1。
- 限制：單一 countermeasure 的存在不能推出已取得 L3／L3+；認證必須涵蓋確切 TOE、版本、設定與所有可行攻擊路徑。

### C12｜「恆定功耗使曲線水平並讓 DPA 失效」不成立

- 判定：`REJECTED`
- 安全措辭：Constant-time、masking、blinding 與經目標晶片評估的隨機化，可降低祕密相依 timing 或 leakage；但真實電路仍有切換、路由、負載、glitch 與製程差異，必須以目標晶片量測驗證。
- 來源：FIDO v1.5.1 requirements 5.5–5.7；NinjaLab EUCLEAK 完整報告；IACR ePrint 2024/1380；Coron 與 Kizhvatov，CHES 2010。
- 限制：Timing constant 不代表 power／EM constant；隨機延遲也可能被重新對齊、平均或建模，不能取代目標晶片量測。

### C13｜Tamper response 不等於全面擦除 EEPROM

- 判定：`REJECTED AS UNIVERSAL CLAIM`
- 安全措辭：偵測攻擊後，產品可歸零目標祕密、銷毀 wrapping key、使物件失效、鎖定、reset、進入安全錯誤狀態或 decommission；實際回應動作、銷毀對象、涵蓋範圍與反應時間，必須由具名產品的 Security Target、資料表、實驗室報告或量測證據建立。
- 來源：FIDO v1.5.1 requirement 5.3 note；GlobalPlatform FIDO2 SE Protection Profile v1.0 的 FCS_CKM.4 與 FPT_PHP.3；FIPS 140-3 IG 僅作 module-specific 範圍參考。
- 限制：未找到 FIDO 對「幾微秒內抹除整顆 EEPROM」的通用要求或量測證據。

### C14｜Address scrambling 不是密碼學保密

- 判定：`REFERENCE ARCHITECTURE`
- 安全措辭：Address／data scrambling 可提高實體映射與自動化逆向成本，但必須搭配加密、完整性、存取控制與 tamper response。
- 來源：NXP P40 Security Target Lite 第 4、60–64 頁；STMicroelectronics 公開簡報第 4 頁。這些只能證明具名 TOE／廠商揭露的機制，不能反推為 FIDO 通用要求。
- 限制：FIDO 不要求 scrambling；PUF-derived per-device mapping 必須固定標示為 `proposed architecture／configuration-specific feature`，除非特定產品有直接證據。

### C15｜EUCLEAK 是實作層攻擊，不是 FIDO2 協定破解

- 判定：`INDEPENDENT ATTACK`
- 安全措辭：EUCLEAK 利用 Infineon ECDSA library 中非 constant-time modular inversion 所產生的近場 EM 洩漏，從 YubiKey 5Ci 恢復一把 FIDO ECDSA 私鑰；Yubico 另行公布受影響的修正前產品世代。公開示範需要實體持有、拆開裝置外殼、專業量測、離線分析與可重複觸發 ECDSA 簽章；報告以 200 次簽章得到 5 次成功恢復，平均每次成功約需 40 次簽章，但不是通用最低值。
- 來源：NinjaLab EUCLEAK 完整報告第 12、15–16、58、62 頁；IACR ePrint 2024/1380 §5.4.3、§5.5；Yubico YSA-2024-03 的 Summary、Affected 與 FIDO use-case sections。
- 限制：不能推論所有 Infineon 晶片、所有 YubiKey、所有 ECDSA library 或所有 FIDO authenticator 都有相同弱點。

### C16｜AES-256 不足以證明整套系統「後量子安全」

- 判定：`REJECTED AS SYSTEM CLAIM`
- 安全措辭：依 NIST 對目前已知量子搜尋方法與 Grover 平行化限制的說明，AES-256 預期仍保有相當安全餘裕；但 FIDO 架構的 authentication、attestation、PKI、firmware update、provisioning 與遷移仍可能使用 ECC／RSA 或其他演算法，必須端到端逐項評估。
- 來源：NIST Post-Quantum Cryptography FAQ 的 AES／Grover 問答；WebAuthn algorithm model。
- 限制：網站不使用「Post-Quantum safe AES-256-bit cryptography」來概括整個 secure storage 或 FIDO solution。

## 記憶體與安全資產映射

| 安全資產 | 可能實作 | 證據狀態 | 必須保留的限制 |
|---|---|---|---|
| Immutable boot policy／lifecycle／trust anchor | OTP、ROM、鎖定 NVM | Reference architecture | FIDO 未指定媒介；不可逆佈署放大保管與復原風險 |
| Device-bound root／KEK | SRAM PUF、受保護金鑰 NVM、key ladder | Reference architecture／named implementation | PUF helper data、PVT、fault、暫態 leakage 仍需驗證 |
| Discoverable credential state | Secure EEPROM／Flash／MTP／MRAM 或受保護平台儲存 | Specification semantics | 必須處理更新原子性、rollback、刪除與復原 |
| Server-side credential source | Authenticated wrapped blob，由 RP 或 host 保存 | Specification semantics | Authenticator 仍需持久 wrapping root／seed |
| Attestation material | Basic／batch attestation key；Self 使用 credential key；AttCA／AnonCA 的 CA-mediated material；enterprise attestation 的設定／材料；或 None | Attestation type／conveyance dependent | 不能固定映射到 OTP；需考慮隱私、撤銷與 blast radius |
| Signature counter | Per-credential、global 或未實作 | Optional specification feature | 只是一項風險訊號，不是可靠的唯一 clone detector |
| Transient key material | Secure SRAM、key register、crypto engine | Product-specific | 揮發性不等於不可觀察，仍有 side-channel／fault／debug 風險 |

## 側道與物理攻擊矩陣

| 攻擊面 | 認證適用範圍 | 要求成果 | 可能實作對策—並非 FIDO 指定電路 | 殘餘風險與查核點 |
|---|---|---|---|---|
| Power／EM／timing | Req. 5.4 適用 L1+ 以上；reqs. 5.5 與 5.7 適用 L3 以上；req. 5.6 適用 L1+、L2+ 以上，L2 另有相關指引 | 金鑰操作不得超過定義上限；功耗／EM 洩漏與遠端可觀察 timing 變化不得使祕密／私密 ASP 低於宣稱強度；L3 以上的密碼運算時間不得依祕密值而改變 | Constant-time、masking、blinding、經目標晶片評估的隨機化 | 需要 target-silicon leakage assessment；沒有單一配方保證成功 |
| Fault injection | 依認證等級適用；L3／L3+ 採對應 attack-potential evaluation | 不得洩漏祕密或繞過安全目標 | Sensor、冗餘檢查、結果驗證、hardened control flow、safe failure | Sensor dead zone、精準 laser、multi-fault 與 response race |
| Probing／delayering／FIB | L3 以上；實體竄改成果與搭配認證 | 在受評估攻擊強度內不得暴露可直接使用的祕密 | Active shield、加密 NVM、受保護 bus、tamper response、split secret | Backside probing、shield bypass、net identification 與組合攻擊 |
| NVM substitution／rollback | 所有宣稱的 ASP 防護；邊界外儲存另須防 stale-data replay | State 必須具完整性與 context binding；外部 state 另須 freshness protection | AEAD／MAC、版本綁定、monotonic state、atomic update | 單純 encryption 或 scrambling 不解決 rollback |
| Debug／test path | 依 requirement level labels | 出貨裝置不得保留可破壞安全目標的介面 | Lifecycle lock、authentication、fuse gating、field disable | Fault-assisted unlock、殘留 command 與錯誤 lifecycle transition |

以上各列只呈現「要求成果」與「可能對策」的映射；不代表任何具名產品已通過該認證。產品認證主張必須另附 TOE、版本、package、configuration、實驗室與 certificate evidence。

## 產品範例的正確使用方式

- Synopsys Secure Storage Solution：可證明特定產品頁揭露 SRAM PUF、OTP、secure controller 與 crypto integration；不能證明這是 FIDO 必備架構。
- NXP SE050：可證明 persistent secure object、transient object 與受保護 remote-memory 模式並存；不能泛化所有 SE 的物件模型。
- Infineon OPTIGA Trust M：可證明具名產品提供 tamper-resistant NVM、key slot、data object 與 counter；不能推論其使用 PUF。
- STSAFE-L010／A100：可證明特定 personalization、partition 或 wrapping 模式；不能直接證明 FIDO2 認證或所有產品世代共用同一架構。
- Microchip ATECC608B-TFLXTLS：可反證「OTP zone 一定是 Anti-Fuse」；它不能代表所有 logical OTP zone 都在 EEPROM。

## 交付前驗證關卡

1. 明確選定 roaming token、platform authenticator、SE applet、TEE／TPM 或 SoC security subsystem。
2. 分別選定 credential storage modality（client-side discoverable／server-side）與 backup eligibility（single-device／multi-device），並獨立追蹤目前的 BS backup state。
3. 分別定義可接受的 attestation type（Basic／batch、Self、AttCA、AnonCA、None）與 RP attestation conveyance policy（none、indirect、direct、enterprise）。
4. 盤點每項 authenticator security parameter 的儲存位置、防護、輸入輸出、更新與銷毀。
5. 把 OTP、PUF 與可更新 NVM 角色綁定到 provisioning custody、撤銷、rollback、復原與掉電行為。
6. 在確切 silicon、library、firmware、package 與設定上完成 SCA、fault 與 physical attack 評估。
7. 讓所有 certification claim 對應到 TOE、版本、security level、伴隨認證與評估日期；L3／L3+ 必須以 ASPR v1.5.1 與對應 mapping table 作為 certification baseline。

## 主要來源

1. [W3C Web Authentication Level 3](https://www.w3.org/TR/webauthn-3/)
2. [FIDO CTAP 2.2 Proposed Standard](https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html)
3. [FIDO Authenticator Security and Privacy Requirements v1.7 Review Draft](https://fidoalliance.org/specs/fido-security-requirements/fido-authenticator-security-requirements-v1.7-rd-20260506.html)
4. [FIDO Authenticator Security and Privacy Requirements v1.6](https://fidoalliance.org/specs/fido-security-requirements/fido-authenticator-security-requirements-v1.6-fd-20250312.html)
5. [FIDO Authenticator Security and Privacy Requirements v1.5.1](https://fidoalliance.org/specs/fido-security-requirements/fido-authenticator-security-requirements-v1.5.1-fd-20251016.html)
6. [FIDO Authenticator Certification Levels](https://fidoalliance.org/certification/authenticator-certification-levels/)
7. [FIDO Authenticator Level 3](https://fidoalliance.org/certification/authenticator-certification-levels/authenticator-level-3/)
8. [FIDO Authenticator Level 3+](https://fidoalliance.org/certification/authenticator-certification-levels/authenticator-level-3-plus/)
9. [FIDO Metadata Statement 3.1](https://fidoalliance.org/specs/mds/fido-metadata-statement-v3.1-ps-20250521.html)
10. [FIDO 2.0 Key Attestation Format，2015 歷史文件](https://fidoalliance.org/specs/fido-v2.0-ps-20150904/fido-key-attestation-v2.0-ps-20150904.html)
11. [GlobalPlatform FIDO2 Secure Element Protection Profile](https://globalplatform.org/specs-library/fido2-se-protection-profile/)
12. [NinjaLab EUCLEAK 完整報告](https://ninjalab.io/wp-content/uploads/2024/09/20240903_eucleak.pdf)
13. [IACR ePrint 2024/1380](https://eprint.iacr.org/2024/1380.pdf)
14. [Yubico YSA-2024-03](https://www.yubico.com/support/security-advisories/ysa-2024-03/)
15. [Synopsys Secure Storage Solution for OTP](https://www.synopsys.com/designware-ip/memories-logic-libraries/secure-storage-otp-ip.html)
16. [Synopsys Physical Unclonable Function IP](https://www.synopsys.com/designware-ip/security-ip/cryptography-ip/puf/security-puf-ip.html)
17. [NXP EdgeLock SE050 data sheet](https://cache.nxp.com/docs/en/data-sheet/SE050-DATASHEET.pdf)
18. [Infineon OPTIGA Trust M data sheet](https://www.infineon.com/assets/row/public/documents/30/49/infineon-optiga-trust-m-datasheet-en.pdf)
19. [STMicroelectronics STSAFE-L010](https://www.st.com/en/secure-mcus/stsafe-l010.html)
20. [NXP AN12324 — LPC55Sxx SRAM PUF](https://www.nxp.com/docs/en/application-note/AN12324.pdf)
21. [Microchip ATECC608B-TFLXTLS data sheet](https://ww1.microchip.com/downloads/en/DeviceDoc/ATECC608B-TFLXTLS-CryptoAuthentication-Data-Sheet-DS40002249A.pdf)
22. [STMicroelectronics STSAFE-A100 data sheet](https://www.st.com/resource/en/datasheet/stsafe-a100.pdf)
23. [IACR ePrint 2015/854](https://eprint.iacr.org/2015/854)
24. [IACR ePrint 2017/493](https://eprint.iacr.org/2017/493.pdf)
25. [Common Criteria Security IC Platform Protection Profile v2.0](https://www.commoncriteriaportal.org/nfs/ccpfiles/files/ppfiles/pp0084V2b_pdf.pdf)
26. [NIST FIPS 140-3 Implementation Guidance](https://csrc.nist.gov/CSRC/media/Projects/cryptographic-module-validation-program/documents/fips%20140-3/FIPS%20140-3%20IG.pdf)
27. [STMicroelectronics 車用數位金鑰硬體安全元件技術簡報](https://www.st.com/content/dam/OLM%20Email%20Marketing/2023/asia_pac/events/2023-st-tw-techday/sm03_st-automotive-hw-secure-element-for-digital-key.pdf)
28. [NXP P40 Security Target Lite](https://www.commoncriteriaportal.org/files/epfiles/P40_HW_SecurityTargetLite_v15.pdf)
29. [Coron 與 Kizhvatov，CHES 2010](https://www.iacr.org/archive/ches2010/62250090/62250090.pdf)
30. [NIST Post-Quantum Cryptography FAQ](https://csrc.nist.gov/Projects/Post-Quantum-Cryptography/faqs)

## 未解問題

- Synopsys 公開資料是否能證明 address scrambling 的確切 configuration、key source 與 threat coverage；目前只能標示為 proposed／configuration-specific。
- 目標 FIDO 產品的 attestation model、credential modality、security level 與 companion certification 尚未指定。
- Tamper sensor、active shield、zeroization 範圍與反應時間必須由目標產品 Security Target 或量測證據建立。
- 若要宣稱 post-quantum security，必須對 authentication、attestation、PKI、firmware update 與 provisioning 的完整演算法鏈逐項查核。
