/**
 * Redaction utilities for PII protection while preserving financial data
 */

// Redaction patterns
const PII_PATTERNS = {
  // Names (common patterns, preserve financial terms)
  names: /\b(?!(?:USD|SGD|AUD|EUR|MYR|THB|PHP|IDR|VND|KRW|JPY|CNY|HKD|TWD|INR|BTC|ETH|USDT|USDC|BNB|ADA|XRP|DOT|SOL|MATIC|AVAX|ATOM|LINK|UNI|AAVE|SUSHI|CRV|YFI|COMP|MKR|SNX|BAL|ZRX|STORJ|ALGO|XTZ|EOS|TRX|NEO|VET|IOTA|ZIL|ONT|QTUM|ICX|ZEN|KMD|WAVES|LSK|ARK|STRAT|NAV|RDD|DOGE|LTC|BCH|BSV|ETC|DASH|ZEC|XMR|DCR|DGB|RVN|MONA|VTC|FAIR|XVG|BURST|SC|SIA|MUSIC|PPC|NMC|FTC|CVC|BAT|REP|GNT|ANT|DNT|STORJ|MANA|ZRX|OMG|KNC|LOOM|HOT|MATIC|CELR|COTI|ONE|ANKR|DOCK|DATA|CTXC|WAN|FUN|POWR|STORJ|FUEL|MTL|RCN|OST|STX|SAND|OCEAN|PERL|ALPHA|BETA|SXP|CTK|WIN|TKO|BURGER|BAKE|SPARTA|AUTO|CAKE|BEL|WING|FLAME|REEF|OGN|DODO|ALICE|AUDIO|C98|CHESS|MASK|SLP|AXS|CTK|RAMP|FIDA|RAY|SUNNY|SNY|ETF|ILP|CPF|HDB|OCBC|UOB|DBS|POSB|NTUC|GREAT EASTERN|AIA|PRUDENTIAL|AVIVA|ZURICH|MSIG|LIBERTY|TOKIO MARINE|QBE|CHUBB|ALLIANZ|AXA|FWD|INCOME|RAFFLES HEALTH|FULLERTON|MAYBANK|CIMB|HSBC|CITIBANK|STANDARD CHARTERED|RHB|PHILLIP|POEMS|TIGER|MOOMOO|SAXO|INTERACTIVE BROKERS|TD AMERITRADE|CHARLES SCHWAB|FIDELITY|VANGUARD|BLACKROCK|ISHARES|SPDR|SPY|QQQ|VTI|VXUS|VEA|VWO|BND|AGG|TLT|GLD|SLV|QQQ|ARKK|ARKG|ARKQ|ARKW|ARKF|SPYG|SPYV|IVV|VTI|VOO|SPY|DIA|MDY|IWM|EFA|EEM|VEA|VWO|VXUS|BND|AGG|LQD|HYG|TLT|SHY|IEF|TIPS|SCHZ|VTEB|MUB|PFF|VNQ|VNQI|IYR|XLRE|REET|USRT|XLE|XLF|XLK|XLI|XLP|XLY|XLV|XLU|XLRE|XLB|KRE|KBE|IYF|IAT|IHI|IBB|XBI|ARKG|ARKK|ARKQ|ARKW|ARKF|ICLN|TAN|PBW|QCLN|FAN|SMOG|HDRO|LIT|BATT|DRIV|BOTZ|ROBO|IRBO|UBOT|EDOC|FINX|HACK|CIBR|BUG|IHAK|WCLD|SKYY|CLOU|IETC|DTEC|FTEC|XSD|PSJ|IGV|SMH|SOXX|XTH|QTEC|FDN|PNQI|ONEQ|SCHG|QQQ|TQQQ|SQQQ|UPRO|SPXU|TNA|TZA|UDOW|SDOW|UGL|UGLD|AGQ|ZSL|UCO|SCO|UNG|KOLD|BOIL|UUP|UDN|DXY|EUO|FXE|ULE|YCL|DBV|EWJ|FXI|ASHR|KWEB|MCHI|YANG|YINN|FXI|ASHR|GXC|FLCH|CAF|EWY|EWS|EWT|THD|VNM|INDA|MINDX|SENSEX|UOB|DBS|OCBC|SGX|REITS|S68|A17U|C6L|C09|C52|C61U|D05|H13|H15|H78|J36|J37|J69U|M44U|ME8U|N2IU|NS8U|OV8|RW0U|SB0U|T82U|UD1U|J91U))[A-Z][a-z]{1,}\s+[A-Z][a-z]{1,}\b/g,
  
  // Email addresses
  emails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Phone numbers (Singapore format and common international)
  phones: /(?:\+65\s?)?(?:[896]\d{7}|[39]\d{7}|\d{4}\s?\d{4})/g,
  
  // Policy/Account numbers (preserve amounts)
  policyNumbers: /\b(?:POL|POLICY|ACC|ACCOUNT|REF|ID|NO\.?)\s*:?\s*[A-Z0-9]{6,}\b/gi,
  
  // NRIC/ID numbers
  nricIds: /\b[STFG]\d{7}[A-Z]\b/g,
  
  // Company names (excluding financial institutions)
  companies: /\b(?!(?:USD|SGD|AUD|EUR|MYR|THB|PHP|IDR|VND|KRW|JPY|CNY|HKD|TWD|INR|BTC|ETH|USDT|USDC|BNB|ADA|XRP|DOT|SOL|MATIC|AVAX|ATOM|LINK|UNI|AAVE|SUSHI|CRV|YFI|COMP|MKR|SNX|BAL|ZRX|STORJ|ALGO|XTZ|EOS|TRX|NEO|VET|IOTA|ZIL|ONT|QTUM|ICX|ZEN|KMD|WAVES|LSK|ARK|STRAT|NAV|RDD|DOGE|LTC|BCH|BSV|ETC|DASH|ZEC|XMR|DCR|DGB|RVN|MONA|VTC|FAIR|XVG|BURST|SC|SIA|MUSIC|PPC|NMC|FTC|CVC|BAT|REP|GNT|ANT|DNT|STORJ|MANA|ZRX|OMG|KNC|LOOM|HOT|MATIC|CELR|COTI|ONE|ANKR|DOCK|DATA|CTXC|WAN|FUN|POWR|STORJ|FUEL|MTL|RCN|OST|STX|SAND|OCEAN|PERL|ALPHA|BETA|SXP|CTK|WIN|TKO|BURGER|BAKE|SPARTA|AUTO|CAKE|BEL|WING|FLAME|REEF|OGN|DODO|ALICE|AUDIO|C98|CHESS|MASK|SLP|AXS|CTK|RAMP|FIDA|RAY|SUNNY|SNY|ETF|ILP|CPF|HDB|OCBC|UOB|DBS|POSB|NTUC|GREAT|EASTERN|AIA|PRUDENTIAL|AVIVA|ZURICH|MSIG|LIBERTY|TOKIO|MARINE|QBE|CHUBB|ALLIANZ|AXA|FWD|INCOME|RAFFLES|HEALTH|FULLERTON|MAYBANK|CIMB|HSBC|CITIBANK|STANDARD|CHARTERED|RHB|PHILLIP|POEMS|TIGER|MOOMOO|SAXO|INTERACTIVE|BROKERS|TD|AMERITRADE|CHARLES|SCHWAB|FIDELITY|VANGUARD|BLACKROCK|ISHARES|SPDR|SPY|QQQ|VTI|VXUS|VEA|VWO|BND|AGG|TLT|GLD|SLV|MINISTRY|GOVERNMENT|MAS|CPF|IRAS|ACRA|SPRING|SINGAPORE|ESG|CSR))\b[A-Z][A-Z0-9\s&]{2,}(?:\s+(?:PTE|LTD|LIMITED|CORP|CORPORATION|INC|LLC|LLP)\.?)\b/g
};

/**
 * Redacts PII from text while preserving financial data
 */
export function redactPII(text: string): string {
  let redactedText = text;
  
  // Apply redaction patterns
  redactedText = redactedText.replace(PII_PATTERNS.emails, '[EMAIL]');
  redactedText = redactedText.replace(PII_PATTERNS.phones, '[PHONE••••]');
  redactedText = redactedText.replace(PII_PATTERNS.policyNumbers, '[ID••••]');
  redactedText = redactedText.replace(PII_PATTERNS.nricIds, '[NRIC••••]');
  redactedText = redactedText.replace(PII_PATTERNS.names, '[NAME]');
  redactedText = redactedText.replace(PII_PATTERNS.companies, '[COMPANY]');
  
  return redactedText;
}

/**
 * Validates that exactly 3 descriptors are provided
 */
export function validateDescriptorCount(descriptors: string[]): boolean {
  return Array.isArray(descriptors) && descriptors.length === 3;
}

/**
 * Validates that descriptors are from the allowed taxonomy
 */
export function validateDescriptorTaxonomy(descriptors: string[], allowedDescriptors: string[]): boolean {
  return descriptors.every(descriptor => allowedDescriptors.includes(descriptor));
}

/**
 * Checks if text contains required number of drills (2-3)
 */
export function validateDrillCount(text: string): boolean {
  // Count drill patterns like "1)", "•", or numbered lists
  const drillPatterns = [
    /\d+\)\s+/g,
    /•\s+/g,
    /\*\s+/g,
    /-\s+/g
  ];
  
  let drillCount = 0;
  drillPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) drillCount += matches.length;
  });
  
  return drillCount >= 2 && drillCount <= 3;
}

/**
 * Finance domain descriptors
 */
export const TONE_DESCRIPTORS = [
  'encouraging', 'confident', 'neutral', 'warm', 'empathetic', 'assertive',
  'concise', 'rushed', 'tentative', 'verbose', 'defensive', 'dismissive',
  'abrasive', 'condescending', 'collaborative', 'consultative', 'persuasive',
  'skeptical', 'disengaged', 'enthusiastic', 'monotone'
];

export const VISUAL_PRESENCE_DESCRIPTORS = [
  'grounded', 'open', 'closed', 'animated', 'static', 'tense', 'relaxed',
  'expansive', 'contained', 'purposeful', 'fidgety', 'upright', 'slouched',
  'pacing', 'still', 'engaged', 'distracted', 'professional', 'casual'
];