/**
 * Automatic Legal & Prohibited Goods Detection Engine
 * Ensures all listed products and custom categories on Shopza comply with legal commerce laws.
 */

export interface LegalityCheckResult {
  isLegal: boolean;
  category?: string;
  reason?: string;
  detectedTerms?: string[];
}

interface ContrabandRule {
  category: string;
  reason: string;
  regex: RegExp;
}

const PROHIBITED_RULES: ContrabandRule[] = [
  {
    category: "Firearms, Weapons & Explosives",
    reason:
      "Sale of firearms, handguns, ammunition, automatic weapons, silencers, explosive devices, switchblades, or military munitions is strictly prohibited by law.",
    regex:
      /\b(firearm|firearms|handgun|handguns|pistol|pistols|revolver|assault rifle|ar-15|glock|shotgun|ammunition|ammo|bullets|silencer|suppressor|grenade|bomb|explosive|c4|dynamite|switchblade|butterfly knife|brass knuckles|taser gun)\b/i,
  },
  {
    category: "Illegal Narcotics & Controlled Substances",
    reason:
      "Sale of illegal narcotics, prescription-only drugs without license, unprescribed opioids, psychedelic substances, or chemical precursors is prohibited.",
    regex:
      /\b(cocaine|heroin|methamphetamine|crystal meth|fentanyl|lsd|psilocybin|magic mushrooms|ecstasy|mdma|crack cocaine|oxycodone|hydrocodone|xanax|adderall|illegal drug|illicit substance|weed brownies|narcotic)\b/i,
  },
  {
    category: "Counterfeit Currency, Forged Documents & Financial Fraud",
    reason:
      "Sale of fake currency, counterfeit banknotes, forged IDs, cloned credit cards, passports, or stolen banking data is illegal under federal fraud statutes.",
    regex:
      /\b(counterfeit (money|bills|cash|currency|dollars|banknotes)|fake id|fake passport|cloned (card|cards|credit card)|credit card dump|stolen cc|ssn dump|forged check|money laundering)\b/i,
  },
  {
    category: "Stolen Property & Cyber Exploit Tools",
    reason:
      "Sale of stolen goods, carding logs, ransomware, malware, spyware, keyloggers, or unauthorized credential access tools is prohibited.",
    regex:
      /\b(stolen goods|stolen property|ransomware|keylogger|trojan virus|botnet|ddos attack tool|carding log|hacked accounts|cracked serials|exploit kit)\b/i,
  },
  {
    category: "Endangered Species & Prohibited Wildlife Parts",
    reason:
      "Sale of parts from endangered or protected wildlife, including elephant ivory, tiger bone, rhino horn, and sea turtle shells, is prohibited under CITES.",
    regex:
      /\b(elephant ivory|ivory carving|raw ivory|rhino horn|tiger skin|tiger bone|sea turtle shell|endangered animal|poached skin|whale teeth|bear bile)\b/i,
  },
  {
    category: "Human Remains & Organs",
    reason:
      "Sale of human organs, tissues, blood, or trafficking services is strictly illegal and violates human rights legislation.",
    regex:
      /\b(human organ|kidney for sale|human kidney|human liver|human tissue|human blood|human skull|human trafficking)\b/i,
  },
  {
    category: "Hazardous Chemical & Radioactive Materials",
    reason:
      "Sale of toxic chemicals, nerve agents, radioactive isotopes, poisonous biohazards, or restricted pesticides is prohibited.",
    regex:
      /\b(uranium|plutonium|radioactive material|ricin|cyanide poison|anthrax|sarin gas|hazardous biohazard|toxic chemical weapon)\b/i,
  },
  {
    category: "Tobacco & Vapes for Minors",
    reason:
      "Unregulated distribution of tobacco, e-cigarettes, or nicotine vape products to underage consumers without age verification is restricted.",
    regex:
      /\b(vape for teens|underage vape|unregulated vape juice|ghost vape|puff bar bulk)\b/i,
  },
];

/**
 * Screen product title, description, category, and tags for legal compliance.
 */
export function checkProductLegality(input: {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
}): LegalityCheckResult {
  const combinedText = [
    input.title || "",
    input.description || "",
    input.category || "",
    ...(input.tags || []),
  ]
    .join(" ")
    .toLowerCase();

  for (const rule of PROHIBITED_RULES) {
    const match = combinedText.match(rule.regex);
    if (match) {
      return {
        isLegal: false,
        category: rule.category,
        reason: rule.reason,
        detectedTerms: [match[0]],
      };
    }
  }

  return {
    isLegal: true,
  };
}

/**
 * Common legal category suggestions that users can quickly select or inspire custom categories
 */
export const POPULAR_LEGAL_CATEGORIES: string[] = [
  "Electronics & Gadgets",
  "Fashion & Apparel",
  "Home Decor & Furniture",
  "Beauty & Skincare",
  "Health & Wellness",
  "Sports & Fitness",
  "Handcrafted & Artisanal",
  "Books & Stationery",
  "Collectibles & Art",
  "Jewelry & Watches",
  "Automotive Accessories",
  "Toys & Hobbies",
  "Pet Supplies",
  "Gourmet Foods & Coffee",
  "Sustainable & Eco Goods",
];
