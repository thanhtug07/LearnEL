// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// src/data/verifiedQuestionBank.ts
var VERIFIED_QUESTION_BANK = [
  // ==========================================
  // LEVEL A1 — GRAMMAR & VOCABULARY
  // ==========================================
  {
    id: "lp-a1-gram-001",
    questionNumber: 1,
    section: "A1 Grammar Fundamentals",
    prompt: "She ______ English with her foreign colleagues every morning.",
    options: ["practice", "practices", "practicing", "is practice"],
    correctAnswerIndex: 1,
    explanationVi: 'Ch\u1EE7 ng\u1EEF "She" l\xE0 ng\xF4i th\u1EE9 3 s\u1ED1 \xEDt. \u1EDE th\xEC Hi\u1EC7n t\u1EA1i \u0111\u01A1n (Present Simple) di\u1EC5n t\u1EA3 th\xF3i quen l\u1EB7p \u0111i l\u1EB7p l\u1EA1i h\xE0ng ng\xE0y ("every morning"), \u0111\u1ED9ng t\u1EEB "practice" c\u1EA7n th\xEAm \u0111u\xF4i "-s" th\xE0nh "practices".',
    commonMistakesVi: "Ng\u01B0\u1EDDi h\u1ECDc hay qu\xEAn chia \u0111\u1ED9ng t\u1EEB theo ng\xF4i th\u1EE9 3 s\u1ED1 \xEDt ho\u1EB7c nh\u1EA7m l\u1EABn v\u1EDBi th\xEC ti\u1EBFp di\u1EC5n.",
    distractorRationales: [
      '"practice" l\xE0 d\u1EA1ng nguy\xEAn th\u1EC3, ch\u1EC9 d\xF9ng cho ch\u1EE7 ng\u1EEF I/You/We/They.',
      "\u0110\xE1p \xE1n ch\xEDnh x\xE1c.",
      '"practicing" l\xE0 V-ing, c\u1EA7n c\xF3 tr\u1EE3 \u0111\u1ED9ng t\u1EEB to be \u0111\u1EE9ng tr\u01B0\u1EDBc.',
      '"is practice" sai c\u1EA5u tr\xFAc ng\u1EEF ph\xE1p; n\u1EBFu l\xE0 ti\u1EBFp di\u1EC5n ph\u1EA3i l\xE0 "is practicing".'
    ],
    category: "Present Simple Tense",
    cefr: "A1",
    skill: "grammar",
    source: {
      category: "original_project",
      attribution: "LingoPeak Curriculum Development Team",
      licenseOrPermission: "Proprietary Original Educational Content - LingoPeak Core",
      creationMethod: "human_authored",
      contentVersion: "1.2.0"
    },
    review: {
      status: "approved",
      reviewerId: "rev-senior-curriculum-01",
      reviewerName: "ThS. Nguy\u1EC5n Ho\xE0ng Anh (Curriculum Lead)",
      reviewedAt: "2026-09-15T09:00:00Z",
      reviewNotes: "\u0110\xE3 th\u1EA9m \u0111\u1ECBnh: Ch\xECa kh\xF3a \u0111\xE1p \xE1n duy nh\u1EA5t, ph\u01B0\u01A1ng \xE1n nhi\u1EC5u h\u1EE3p l\xFD, gi\u1EA3i th\xEDch chi ti\u1EBFt.",
      aiValidationPassed: true
    },
    metadata: {
      createdAt: "2026-09-10T08:00:00Z",
      updatedAt: "2026-09-15T09:00:00Z",
      isProductionReady: true
    }
  },
  {
    id: "lp-a1-voc-002",
    questionNumber: 2,
    section: "A1 Daily Vocabulary",
    prompt: "My brother works in a hospital. He is a ______ and takes care of sick people.",
    options: ["doctor", "baker", "mechanic", "pilot"],
    correctAnswerIndex: 0,
    explanationVi: '"Doctor" (b\xE1c s\u0129) l\xE0 ng\u01B0\u1EDDi l\xE0m vi\u1EC7c t\u1EA1i b\u1EC7nh vi\u1EC7n ("hospital") v\xE0 ch\u0103m s\xF3c ng\u01B0\u1EDDi b\u1EC7nh ("takes care of sick people").',
    commonMistakesVi: '\u0110\u1ECDc l\u01B0\u1EDBt kh\xF4ng ch\xFA \xFD t\u1EEB kh\xF3a \u0111\u1ECBa \u0111i\u1EC3m "hospital" v\xE0 h\xE0nh \u0111\u1ED9ng "takes care of sick people".',
    distractorRationales: [
      "\u0110\xE1p \xE1n ch\xEDnh x\xE1c.",
      '"baker" (th\u1EE3 l\xE0m b\xE1nh) l\xE0m vi\u1EC7c \u1EDF ti\u1EC7m b\xE1nh (bakery).',
      '"mechanic" (th\u1EE3 c\u01A1 kh\xED) s\u1EEDa ch\u1EEFa m\xE1y m\xF3c ho\u1EB7c xe c\u1ED9.',
      '"pilot" (phi c\xF4ng) l\xE1i m\xE1y bay.'
    ],
    category: "Professions & Occupations",
    cefr: "A1",
    skill: "vocab",
    source: {
      category: "original_project",
      attribution: "LingoPeak Curriculum Development Team",
      licenseOrPermission: "Proprietary Original Educational Content - LingoPeak Core",
      creationMethod: "human_authored",
      contentVersion: "1.1.0"
    },
    review: {
      status: "approved",
      reviewerId: "rev-senior-curriculum-01",
      reviewerName: "ThS. Nguy\u1EC5n Ho\xE0ng Anh",
      reviewedAt: "2026-09-15T09:15:00Z",
      reviewNotes: "T\u1EEB v\u1EF1ng c\u1ED1t l\xF5i A1 theo khung tham chi\u1EBFu CEFR.",
      aiValidationPassed: true
    },
    metadata: {
      createdAt: "2026-09-10T08:30:00Z",
      updatedAt: "2026-09-15T09:15:00Z",
      isProductionReady: true
    }
  },
  // ==========================================
  // LEVEL A2 — GRAMMAR & VOCABULARY
  // ==========================================
  {
    id: "lp-a2-gram-003",
    questionNumber: 3,
    section: "A2 Essential Grammar",
    prompt: "Yesterday, while I ______ for the bus, it suddenly started to rain heavily.",
    options: ["waited", "was waiting", "am waiting", "have waited"],
    correctAnswerIndex: 1,
    explanationVi: 'C\u1EA5u tr\xFAc k\u1EBFt h\u1EE3p th\xEC Qu\xE1 kh\u1EE9 ti\u1EBFp di\u1EC5n (Past Continuous) v\xE0 Qu\xE1 kh\u1EE9 \u0111\u01A1n (Past Simple): Khi m\u1ED9t h\xE0nh \u0111\u1ED9ng \u0111ang di\u1EC5n ra trong qu\xE1 kh\u1EE9 ("was waiting for the bus") th\xEC m\u1ED9t h\xE0nh \u0111\u1ED9ng kh\xE1c xen v\xE0o ("it suddenly started to rain"). Sau li\xEAn t\u1EEB "while" th\u01B0\u1EDDng d\xF9ng th\xEC ti\u1EBFp di\u1EC5n.',
    commonMistakesVi: 'D\xF9ng qu\xE1 kh\u1EE9 \u0111\u01A1n "waited" sau "while" khi mu\u1ED1n nh\u1EA5n m\u1EA1nh h\xE0nh \u0111\u1ED9ng \u0111ang di\u1EC5n ra l\xE0m n\u1EC1n.',
    distractorRationales: [
      '"waited" l\xE0 th\xEC Qu\xE1 kh\u1EE9 \u0111\u01A1n, kh\xF4ng di\u1EC5n t\u1EA3 \u0111\u01B0\u1EE3c t\xEDnh ch\u1EA5t \u0111ang ti\u1EBFp di\u1EC5n l\xE0m n\u1EC1n c\u1EE7a h\xE0nh \u0111\u1ED9ng.',
      "\u0110\xE1p \xE1n ch\xEDnh x\xE1c.",
      '"am waiting" l\xE0 Hi\u1EC7n t\u1EA1i ti\u1EBFp di\u1EC5n, kh\xF4ng ph\xF9 h\u1EE3p v\u1EDBi m\u1ED1c th\u1EDDi gian "Yesterday" trong qu\xE1 kh\u1EE9.',
      '"have waited" l\xE0 Hi\u1EC7n t\u1EA1i ho\xE0n th\xE0nh, kh\xF4ng d\xF9ng cho s\u1EF1 vi\u1EC7c \u0111\xE3 ch\u1EA5m d\u1EE9t t\u1EA1i th\u1EDDi \u0111i\u1EC3m x\xE1c \u0111\u1ECBnh trong qu\xE1 kh\u1EE9.'
    ],
    category: "Past Continuous vs Past Simple",
    cefr: "A2",
    skill: "grammar",
    source: {
      category: "original_project",
      attribution: "LingoPeak Assessment Group",
      licenseOrPermission: "LingoPeak Standard Educational License",
      creationMethod: "human_authored",
      contentVersion: "1.2.0"
    },
    review: {
      status: "approved",
      reviewerId: "rev-assessment-02",
      reviewerName: "C\xF4 L\xEA Thu H\xE0 (Senior Examiner)",
      reviewedAt: "2026-09-16T14:00:00Z",
      reviewNotes: "C\u1EA5u tr\xFAc Past Continuous chu\u1EA9n x\xE1c, \u0111i\u1EC3m ng\u1EEF ph\xE1p tr\u1ECDng t\xE2m b\u1EADc A2.",
      aiValidationPassed: true
    },
    metadata: {
      createdAt: "2026-09-12T10:00:00Z",
      updatedAt: "2026-09-16T14:00:00Z",
      isProductionReady: true
    }
  },
  {
    id: "lp-a2-voc-004",
    questionNumber: 4,
    section: "A2 Travel & Transportation",
    prompt: "Passengers must show their boarding ______ before entering the aircraft.",
    options: ["pass", "license", "receipt", "menu"],
    correctAnswerIndex: 0,
    explanationVi: 'C\u1EE5m t\u1EEB c\u1ED1 \u0111\u1ECBnh trong du l\u1ECBch h\xE0ng kh\xF4ng l\xE0 "boarding pass" (th\u1EBB l\xEAn m\xE1y bay). H\xE0nh kh\xE1ch b\u1EAFt bu\u1ED9c ph\u1EA3i xu\u1EA5t tr\xECnh th\u1EBB n\xE0y tr\u01B0\u1EDBc khi l\xEAn m\xE1y bay ("entering the aircraft").',
    commonMistakesVi: 'Nh\u1EA7m l\u1EABn gi\u1EEFa "pass" (th\u1EBB th\xF4ng h\xE0nh/v\xE9) v\xE0 "license" (b\u1EB1ng l\xE1i/gi\u1EA5y ph\xE9p).',
    distractorRationales: [
      '\u0110\xE1p \xE1n ch\xEDnh x\xE1c: "boarding pass" l\xE0 thu\u1EADt ng\u1EEF ti\xEAu chu\u1EA9n qu\u1ED1c t\u1EBF.',
      `"license" l\xE0 gi\u1EA5y ph\xE9p (v\xED d\u1EE5 driver's license: b\u1EB1ng l\xE1i xe).`,
      '"receipt" l\xE0 bi\xEAn lai thanh to\xE1n h\xF3a \u0111\u01A1n.',
      '"menu" l\xE0 th\u1EF1c \u0111\u01A1n m\xF3n \u0103n.'
    ],
    category: "Airport & Travel Vocabulary",
    cefr: "A2",
    skill: "vocab",
    source: {
      category: "original_project",
      attribution: "LingoPeak Assessment Group",
      licenseOrPermission: "LingoPeak Standard Educational License",
      creationMethod: "human_authored",
      contentVersion: "1.0.0"
    },
    review: {
      status: "approved",
      reviewerId: "rev-assessment-02",
      reviewerName: "C\xF4 L\xEA Thu H\xE0",
      reviewedAt: "2026-09-16T14:20:00Z",
      reviewNotes: "Collocation t\u1EF1 nhi\xEAn, c\xF3 t\xEDnh \u1EE9ng d\u1EE5ng giao ti\u1EBFp cao.",
      aiValidationPassed: true
    },
    metadata: {
      createdAt: "2026-09-12T10:30:00Z",
      updatedAt: "2026-09-16T14:20:00Z",
      isProductionReady: true
    }
  },
  // ==========================================
  // LEVEL B1 — GRAMMAR & VOCABULARY
  // ==========================================
  {
    id: "lp-b1-gram-005",
    questionNumber: 5,
    section: "B1 Intermediate Grammar",
    prompt: "If our company ______ the annual budget sooner, we would have upgraded our IT infrastructure last quarter.",
    options: ["approved", "had approved", "has approved", "would approve"],
    correctAnswerIndex: 1,
    explanationVi: 'C\xE2u \u0111i\u1EC1u ki\u1EC7n lo\u1EA1i 3 (Third Conditional) di\u1EC5n t\u1EA3 gi\u1EA3 \u0111\u1ECBnh tr\xE1i ng\u01B0\u1EE3c v\u1EDBi th\u1EF1c t\u1EBF trong qu\xE1 kh\u1EE9. M\u1EC7nh \u0111\u1EC1 ch\xEDnh d\xF9ng "would have + V3/ed" ("would have upgraded"), do \u0111\xF3 m\u1EC7nh \u0111\u1EC1 If ph\u1EA3i chia \u1EDF th\xEC Qu\xE1 kh\u1EE9 ho\xE0n th\xE0nh (Past Perfect): "had + V3/ed" -> "had approved".',
    commonMistakesVi: 'D\xF9ng c\xE2u \u0111i\u1EC1u ki\u1EC7n lo\u1EA1i 2 "approved" ho\u1EB7c d\xF9ng "would" trong m\u1EC7nh \u0111\u1EC1 If.',
    distractorRationales: [
      '"approved" l\xE0 d\u1EA1ng qu\xE1 kh\u1EE9 \u0111\u01A1n thu\u1ED9c c\xE2u \u0111i\u1EC1u ki\u1EC7n lo\u1EA1i 2, ch\u1EC9 gi\u1EA3 \u0111\u1ECBnh tr\xE1i v\u1EDBi hi\u1EC7n t\u1EA1i.',
      "\u0110\xE1p \xE1n ch\xEDnh x\xE1c: c\xF4ng th\u1EE9c chu\u1EA9n c\u1EE7a If lo\u1EA1i 3: If + S + had + P.P, S + would have + P.P.",
      '"has approved" l\xE0 th\xEC Hi\u1EC7n t\u1EA1i ho\xE0n th\xE0nh, kh\xF4ng ph\xF9 h\u1EE3p c\u1EA5u tr\xFAc.',
      '"would approve" sai ng\u1EEF ph\xE1p v\xEC m\u1EC7nh \u0111\u1EC1 If kh\xF4ng ch\u1EE9a "would".'
    ],
    category: "Third Conditional",
    cefr: "B1",
    skill: "grammar",
    source: {
      category: "original_project",
      attribution: "LingoPeak Editorial Board",
      licenseOrPermission: "LingoPeak Standard Educational License",
      creationMethod: "human_authored",
      contentVersion: "1.3.0"
    },
    review: {
      status: "approved",
      reviewerId: "rev-senior-curriculum-01",
      reviewerName: "ThS. Nguy\u1EC5n Ho\xE0ng Anh",
      reviewedAt: "2026-09-18T11:00:00Z",
      reviewNotes: "C\xE2u \u0111i\u1EC1u ki\u1EC7n lo\u1EA1i 3 chu\u1EA9n v\u0103n phong kinh doanh, ph\xE2n t\xEDch ng\u1EEF ph\xE1p r\u1EA5t r\xF5 r\xE0ng.",
      aiValidationPassed: true
    },
    metadata: {
      createdAt: "2026-09-14T09:00:00Z",
      updatedAt: "2026-09-18T11:00:00Z",
      isProductionReady: true
    }
  },
  {
    id: "lp-b1-voc-006",
    questionNumber: 6,
    section: "B1 Workplace English",
    prompt: "The management decided to ______ the product launch until next month due to unexpected supply chain disruptions.",
    options: ["postpone", "accelerate", "commence", "abandon"],
    correctAnswerIndex: 0,
    explanationVi: '"Postpone" ngh\u0129a l\xE0 ho\xE3n l\u1EA1i, d\u1EDDi l\u1ECBch sang th\u1EDDi \u0111i\u1EC3m mu\u1ED9n h\u01A1n (\u0111\u1ED3ng ngh\u0129a v\u1EDBi "put off" hay "delay"). Ng\u1EEF c\u1EA3nh c\xE2u: do gi\xE1n \u0111o\u1EA1n chu\u1ED7i cung \u1EE9ng ("due to unexpected supply chain disruptions") n\xEAn vi\u1EC7c ra m\u1EAFt s\u1EA3n ph\u1EA9m b\u1ECB l\xF9i l\u1EA1i \u0111\u1EBFn th\xE1ng sau ("until next month").',
    commonMistakesVi: 'Nh\u1EA7m l\u1EABn gi\u1EEFa "postpone" (ho\xE3n l\u1EA1i c\xF3 k\u1EBF ho\u1EA1ch d\u1EDDi ng\xE0y) v\xE0 "abandon" (h\u1EE7y b\u1ECF ho\xE0n to\xE0n).',
    distractorRationales: [
      '\u0110\xE1p \xE1n ch\xEDnh x\xE1c: "postpone until next month" (ho\xE3n l\u1EA1i t\u1EDBi th\xE1ng sau).',
      '"accelerate" mang ngh\u0129a \u0111\u1EA9y nhanh ti\u1EBFn \u0111\u1ED9, tr\xE1i ng\u01B0\u1EE3c v\u1EDBi ng\u1EEF c\u1EA3nh chu\u1ED7i cung \u1EE9ng b\u1ECB gi\xE1n \u0111o\u1EA1n.',
      '"commence" mang ngh\u0129a b\u1EAFt \u0111\u1EA7u/kh\u1EDFi \u0111\u1ED9ng ngay.',
      '"abandon" mang ngh\u0129a t\u1EEB b\u1ECF ho\xE0n to\xE0n, kh\xF4ng \u0111i v\u1EDBi m\u1ED1c th\u1EDDi gian d\u1EDDi l\u1ECBch "until next month".'
    ],
    category: "Business Operations Vocabulary",
    cefr: "B1",
    skill: "vocab",
    source: {
      category: "original_project",
      attribution: "LingoPeak Editorial Board",
      licenseOrPermission: "LingoPeak Standard Educational License",
      creationMethod: "human_authored",
      contentVersion: "1.1.0"
    },
    review: {
      status: "approved",
      reviewerId: "rev-senior-curriculum-01",
      reviewerName: "ThS. Nguy\u1EC5n Ho\xE0ng Anh",
      reviewedAt: "2026-09-18T11:30:00Z",
      reviewNotes: "T\u1EEB v\u1EF1ng B1 th\xF4ng d\u1EE5ng trong m\xF4i tr\u01B0\u1EDDng c\xF4ng s\u1EDF qu\u1ED1c t\u1EBF.",
      aiValidationPassed: true
    },
    metadata: {
      createdAt: "2026-09-14T09:30:00Z",
      updatedAt: "2026-09-18T11:30:00Z",
      isProductionReady: true
    }
  },
  // ==========================================
  // LEVEL B2 — GRAMMAR & ADVANCED USAGE
  // ==========================================
  {
    id: "lp-b2-gram-007",
    questionNumber: 7,
    section: "B2 Advanced Structures",
    prompt: "Not only ______ the quarterly revenue targets, but they also expanded their customer base by thirty percent.",
    options: ["did the sales team exceed", "the sales team exceeded", "had the sales team exceed", "the sales team had exceeded"],
    correctAnswerIndex: 0,
    explanationVi: 'C\u1EA5u tr\xFAc \u0111\u1EA3o ng\u1EEF v\u1EDBi c\u1EE5m t\u1EEB ph\u1EE7 \u0111\u1ECBnh \u0111\u1EE9ng \u0111\u1EA7u c\xE2u: "Not only + tr\u1EE3 \u0111\u1ED9ng t\u1EEB + S + V (nguy\xEAn m\u1EABu), but S + also + V...". V\u1EDBi m\u1EC7nh \u0111\u1EC1 th\xEC qu\xE1 kh\u1EE9 \u0111\u01A1n, ta m\u01B0\u1EE3n tr\u1EE3 \u0111\u1ED9ng t\u1EEB "did", theo sau l\xE0 ch\u1EE7 ng\u1EEF "the sales team" v\xE0 \u0111\u1ED9ng t\u1EEB nguy\xEAn th\u1EC3 "exceed".',
    commonMistakesVi: 'Kh\xF4ng \u0111\u1EA3o ng\u1EEF khi tr\u1EA1ng t\u1EEB ph\u1EE7 \u0111\u1ECBnh/h\u1EA1n \u0111\u1ECBnh "Not only" \u0111\u1EE9ng \u0111\u1EA7u c\xE2u.',
    distractorRationales: [
      '\u0110\xE1p \xE1n ch\xEDnh x\xE1c: \u0110\u1EA3o ng\u1EEF th\xEC qu\xE1 kh\u1EE9 \u0111\u01A1n "did + S + V".',
      '"the sales team exceeded" l\xE0 tr\u1EADt t\u1EF1 t\u1EEB th\xF4ng th\u01B0\u1EDDng, sai c\u1EA5u tr\xFAc \u0111\u1EA3o ng\u1EEF khi "Not only" \u0111\u1EE9ng \u0111\u1EA7u.',
      '"had the sales team exceed" sai v\xEC sau "had" ph\u1EA3i l\xE0 ph\xE2n t\u1EEB 2 (exceeded), kh\xF4ng th\u1EC3 l\xE0 nguy\xEAn th\u1EC3.',
      '"the sales team had exceeded" kh\xF4ng \u0111\u1EA3o tr\u1EE3 \u0111\u1ED9ng t\u1EEB l\xEAn tr\u01B0\u1EDBc ch\u1EE7 ng\u1EEF.'
    ],
    category: "Negative Inversion",
    cefr: "B2",
    skill: "grammar",
    source: {
      category: "original_project",
      attribution: "LingoPeak Academic Committee",
      licenseOrPermission: "Open Educational Resource / LingoPeak Curriculum Initiative",
      creationMethod: "human_authored",
      contentVersion: "1.4.0"
    },
    review: {
      status: "approved",
      reviewerId: "rev-assessment-02",
      reviewerName: "C\xF4 L\xEA Thu H\xE0",
      reviewedAt: "2026-09-20T16:00:00Z",
      reviewNotes: "\u0110\u1EA3o ng\u1EEF l\xE0 tr\u1ECDng t\xE2m B2/IELTS Writing Task 2 GRA band 7.0+.",
      aiValidationPassed: true
    },
    metadata: {
      createdAt: "2026-09-18T14:00:00Z",
      updatedAt: "2026-09-20T16:00:00Z",
      isProductionReady: true
    }
  },
  {
    id: "lp-b2-voc-008",
    questionNumber: 8,
    section: "B2 Professional Discourse",
    prompt: "The keynote speaker emphasized that transparent communication is ______ to maintaining shareholder trust during corporate restructuring.",
    options: ["paramount", "redundant", "negligible", "superficial"],
    correctAnswerIndex: 0,
    explanationVi: '"Paramount" (adj) c\xF3 ngh\u0129a l\xE0 t\u1ED1i quan tr\u1ECDng, quan tr\u1ECDng h\u01A1n h\u1EBFt th\u1EA3y ("more important than anything else"). C\u1EE5m "is paramount to doing something" mang ngh\u0129a l\xE0 nh\xE2n t\u1ED1 ti\xEAn quy\u1EBFt \u0111\u1EC3 duy tr\xEC l\xF2ng tin c\u1EE7a c\u1ED5 \u0111\xF4ng.',
    commonMistakesVi: 'Nh\u1EA7m l\u1EABn v\u1EDBi "redundant" (d\u01B0 th\u1EEBa) ho\u1EB7c "negligible" (kh\xF4ng \u0111\xE1ng k\u1EC3).',
    distractorRationales: [
      '\u0110\xE1p \xE1n ch\xEDnh x\xE1c: "paramount" th\u1EC3 hi\u1EC7n m\u1EE9c \u0111\u1ED9 quan tr\u1ECDng s\u1ED1ng c\xF2n.',
      '"redundant" ngh\u0129a l\xE0 d\u01B0 th\u1EEBa, kh\xF4ng c\u1EA7n thi\u1EBFt.',
      '"negligible" ngh\u0129a l\xE0 nh\u1ECF b\xE9, kh\xF4ng \u0111\xE1ng k\u1EC3.',
      '"superficial" ngh\u0129a l\xE0 h\u1EDDi h\u1EE3t, b\u1EC1 n\u1ED5i.'
    ],
    category: "Academic & Professional Lexis",
    cefr: "B2",
    skill: "vocab",
    source: {
      category: "original_project",
      attribution: "LingoPeak Academic Committee",
      licenseOrPermission: "LingoPeak Advanced Educational Resource",
      creationMethod: "human_authored",
      contentVersion: "1.2.0"
    },
    review: {
      status: "approved",
      reviewerId: "rev-assessment-02",
      reviewerName: "C\xF4 L\xEA Thu H\xE0",
      reviewedAt: "2026-09-20T16:30:00Z",
      reviewNotes: "T\u1EEB v\u1EF1ng C1/B2 cao c\u1EA5p, ng\u1EEF c\u1EA3nh h\u1ECDc thu\u1EADt v\xE0 th\u01B0\u01A1ng m\u1EA1i chu\u1EA9n m\u1EF1c.",
      aiValidationPassed: true
    },
    metadata: {
      createdAt: "2026-09-18T14:30:00Z",
      updatedAt: "2026-09-20T16:30:00Z",
      isProductionReady: true
    }
  },
  // ==========================================
  // TOEIC-STYLE WORKPLACE PRACTICE
  // ==========================================
  {
    id: "lp-toeic-p5-009",
    questionNumber: 9,
    section: "TOEIC Part 5: Incomplete Sentences",
    prompt: "All employees requesting reimbursement must submit their expense reports ______ the finance department by Friday afternoon.",
    options: ["to", "at", "with", "by"],
    correctAnswerIndex: 0,
    explanationVi: 'C\u1EE5m \u0111\u1ED9ng t\u1EEB c\u1ED1 \u0111\u1ECBnh: "submit something to somebody/a department" (n\u1ED9p c\xE1i g\xEC cho ai/b\u1ED9 ph\u1EADn n\xE0o). "All employees... must submit their expense reports TO the finance department".',
    commonMistakesVi: 'Th\xED sinh hay ch\u1ECDn nh\u1EA7m "for" ho\u1EB7c "with". C\u1EA7n ch\xFA \xFD \u0111\u1ED9ng t\u1EEB "submit" \u0111i v\u1EDBi gi\u1EDBi t\u1EEB ch\u1EC9 h\u01B0\u1EDBng ti\u1EBFp nh\u1EADn l\xE0 "to".',
    distractorRationales: [
      '\u0110\xE1p \xE1n ch\xEDnh x\xE1c: collocated preposition "submit ... to".',
      '"at" ch\u1EC9 \u0111\u1ECBa \u0111i\u1EC3m t\u0129nh, kh\xF4ng \u0111i v\u1EDBi c\u1EA5u tr\xFAc n\u1ED9p h\u1ED3 s\u01A1 c\u1EE7a "submit".',
      '"with" di\u1EC5n t\u1EA3 \u0111i c\xF9ng v\u1EDBi ho\u1EB7c n\u1ED9p chung, kh\xF4ng th\u1EC3 hi\u1EC7n c\u01A1 quan ti\u1EBFp nh\u1EADn.',
      '"by" ch\u1EC9 h\u1EA1n ch\xF3t th\u1EDDi gian ("by Friday afternoon"), kh\xF4ng d\xF9ng sau danh t\u1EEB ch\u1EC9 b\u1ED9 ph\u1EADn ti\u1EBFp nh\u1EADn trong v\u0103n c\u1EA3nh n\xE0y.'
    ],
    category: "TOEIC Workplace Prepositions",
    cefr: "B1",
    skill: "toeic_reading",
    source: {
      category: "original_project",
      attribution: "LingoPeak TOEIC Assessment Specialists",
      licenseOrPermission: "Original Workplace English Simulation Materials - LingoPeak",
      creationMethod: "human_authored",
      contentVersion: "1.0.0"
    },
    review: {
      status: "approved",
      reviewerId: "rev-toeic-lead",
      reviewerName: "Th\u1EA7y Tr\u1EA7n \u0110\xECnh Tr\u1ECDng (TOEIC 990 Specialist)",
      reviewedAt: "2026-09-22T10:00:00Z",
      reviewNotes: "M\xF4 ph\u1ECFng ch\xE2n th\u1EF1c \u0111\u1EC1 thi TOEIC Part 5, b\u1EABy gi\u1EDBi t\u1EEB c\xF4ng s\u1EDF ph\u1ED5 bi\u1EBFn.",
      aiValidationPassed: true
    },
    metadata: {
      createdAt: "2026-09-21T08:00:00Z",
      updatedAt: "2026-09-22T10:00:00Z",
      isProductionReady: true
    }
  },
  {
    id: "lp-toeic-p6-010",
    questionNumber: 10,
    section: "TOEIC Part 6: Text Completion",
    contextPassage: "MEMORANDUM\nTo: All Department Heads\nFrom: Facilities Management\nDate: October 10\nSubject: Office Air Conditioning Maintenance\n\nPlease be informed that regular maintenance on the central cooling system is scheduled for this coming Saturday between 8:00 AM and 2:00 PM. During this window, temperatures throughout the building may rise noticeably. Therefore, staff members planning to work on Saturday are ______ to dress casually and bring personal desk fans if necessary.",
    prompt: "What word best completes the blank in the memorandum?",
    options: ["advised", "advise", "advisable", "advising"],
    correctAnswerIndex: 0,
    explanationVi: 'C\u1EA5u tr\xFAc b\u1ECB \u0111\u1ED9ng: "be + V3/ed + to V" -> "are advised to dress casually" (\u0111\u01B0\u1EE3c khuy\xEAn n\xEAn m\u1EB7c trang ph\u1EE5c tho\u1EA3i m\xE1i). "Advised" l\xE0 ph\xE2n t\u1EEB hai \u0111\xF3ng vai tr\xF2 ho\xE0n thi\u1EC7n th\u1EC3 b\u1ECB \u0111\u1ED9ng.',
    commonMistakesVi: 'Ch\u1ECDn "advisable" v\xEC nh\u1EA7m v\u1EDBi t\xEDnh t\u1EEB sau "are", tuy nhi\xEAn c\u1EA5u tr\xFAc "staff members are advisable to" l\xE0 sai; ch\u1EC9 d\xF9ng "It is advisable that..." ho\u1EB7c "It is advisable to...".',
    distractorRationales: [
      '\u0110\xE1p \xE1n ch\xEDnh x\xE1c: c\u1EA5u tr\xFAc b\u1ECB \u0111\u1ED9ng "S + be + advised to V".',
      '"advise" l\xE0 \u0111\u1ED9ng t\u1EEB nguy\xEAn th\u1EC3, kh\xF4ng th\u1EC3 \u0111\u1EE9ng sau to be "are" \u1EDF d\u1EA1ng ch\u1EE7 \u0111\u1ED9ng.',
      '"advisable" l\xE0 t\xEDnh t\u1EEB ch\u1EC9 t\xEDnh ch\u1EA5t c\u1EE7a h\xE0nh \u0111\u1ED9ng (It is advisable to do sth), kh\xF4ng d\xF9ng b\u1ED5 ngh\u0129a tr\u1EF1c ti\u1EBFp cho ch\u1EE7 ng\u1EEF ch\u1EC9 ng\u01B0\u1EDDi.',
      '"advising" l\xE0 d\u1EA1ng V-ing mang ngh\u0129a ch\u1EE7 \u0111\u1ED9ng nh\xE2n vi\xEAn \u0111ang khuy\xEAn ai \u0111\xF3, tr\xE1i ng\u01B0\u1EE3c ng\u1EEF c\u1EA3nh ban qu\u1EA3n l\xFD khuy\xEAn nh\xE2n vi\xEAn.'
    ],
    category: "Passive Voice & Word Form in Business Context",
    cefr: "B2",
    skill: "toeic_reading",
    source: {
      category: "original_project",
      attribution: "LingoPeak TOEIC Assessment Specialists",
      licenseOrPermission: "Original Workplace English Simulation Materials - LingoPeak",
      creationMethod: "human_authored",
      contentVersion: "1.1.0"
    },
    review: {
      status: "approved",
      reviewerId: "rev-toeic-lead",
      reviewerName: "Th\u1EA7y Tr\u1EA7n \u0110\xECnh Tr\u1ECDng",
      reviewedAt: "2026-09-22T10:45:00Z",
      reviewNotes: "\u0110o\u1EA1n v\u0103n ho\xE0n ch\u1EC9nh, b\u1EABy t\u1EEB lo\u1EA1i Part 6 chu\u1EA9n m\u1EF1c.",
      aiValidationPassed: true
    },
    metadata: {
      createdAt: "2026-09-21T09:00:00Z",
      updatedAt: "2026-09-22T10:45:00Z",
      isProductionReady: true
    }
  },
  // ==========================================
  // ORIGINAL IELTS-STYLE ACADEMIC PRACTICE
  // ==========================================
  {
    id: "lp-ielts-read-011",
    questionNumber: 11,
    section: "IELTS Academic Reading: Environmental Science",
    contextPassage: "Urban Heat Island (UHI) mitigation has become a cornerstone of contemporary metropolitan architecture. Research conducted across twenty temperate cities revealed that integrating extensive green roofs reduces ambient rooftop temperatures by an average of 4.2 degrees Celsius during peak summer daylight. Moreover, high-albedo pavements reflect up to eighty percent of solar radiation back into the atmosphere, preventing the thermal mass of asphalt from radiating stored energy during nocturnal hours. Contrary to earlier assumptions that localized cooling requires large municipal parks, interconnected micro-vegetation networks were found to yield comparable thermodynamic equilibrium across commercial districts.",
    prompt: "According to the passage, why are high-albedo pavements effective in mitigating urban temperatures at night?",
    options: [
      "They reflect solar radiation during the day, preventing asphalt from storing and releasing heat at night.",
      "They absorb moisture from the morning dew and evaporate it after dusk.",
      "They are cheaper to install than municipal green spaces.",
      "They require continuous nocturnal water sprinkling to dissipate ambient heat."
    ],
    correctAnswerIndex: 0,
    explanationVi: '\u0110o\u1EA1n v\u0103n n\xEAu r\xF5: "high-albedo pavements reflect up to eighty percent of solar radiation back into the atmosphere, preventing the thermal mass of asphalt from radiating stored energy during nocturnal hours" (M\u1EB7t \u0111\u01B0\u1EDDng ph\u1EA3n x\u1EA1 cao ph\u1EA3n chi\u1EBFu t\u1EDBi 80% b\u1EE9c x\u1EA1 m\u1EB7t tr\u1EDDi tr\u1EDF l\u1EA1i kh\xED quy\u1EC3n, ng\u0103n kh\u1ED1i nh\u1EF1a \u0111\u01B0\u1EDDng t\xEDch tr\u1EEF v\xE0 t\u1ECFa nhi\u1EC7t v\xE0o ban \u0111\xEAm). V\xEC v\u1EADy \u0111\xE1p \xE1n A ph\u1EA3n \xE1nh ch\xEDnh x\xE1c th\xF4ng tin tr\xEAn.',
    commonMistakesVi: "Th\xED sinh b\u1ECB ph\xE2n t\xE2m b\u1EDFi c\xE1c th\xF4ng tin ngo\u1EA1i lai kh\xF4ng c\xF3 trong b\xE0i nh\u01B0 h\u1EA5p th\u1EE5 s\u01B0\u01A1ng s\u1EDBm (\u0111\xE1p \xE1n B) ho\u1EB7c gi\xE1 th\xE0nh thi c\xF4ng (\u0111\xE1p \xE1n C).",
    distractorRationales: [
      "\u0110\xE1p \xE1n ch\xEDnh x\xE1c: Di\u1EC5n \u0111\u1EA1t chu\u1EA9n x\xE1c lu\u1EADn \u0111i\u1EC3m v\u1EC1 c\u01A1 ch\u1EBF ph\u1EA3n x\u1EA1 b\u1EE9c x\u1EA1 v\xE0 ng\u0103n gi\u1EEF nhi\u1EC7t ban \u0111\xEAm.",
      "Th\xF4ng tin sai l\u1EC7ch, b\xE0i \u0111\u1ECDc kh\xF4ng \u0111\u1EC1 c\u1EADp \u0111\u1EBFn hi\u1EC7n t\u01B0\u1EE3ng h\u1EA5p th\u1EE5 s\u01B0\u01A1ng v\xE0 b\u1ED1c h\u01A1i.",
      "Th\xF4ng tin so s\xE1nh chi ph\xED kh\xF4ng xu\u1EA5t hi\u1EC7n trong b\xE0i \u0111\u1ECDc.",
      "Th\xF4ng tin b\u1ECBa \u0111\u1EB7t, kh\xF4ng c\xF3 y\xEAu c\u1EA7u phun n\u01B0\u1EDBc v\xE0o ban \u0111\xEAm."
    ],
    category: "IELTS Reading: Factual Detail Extraction",
    cefr: "B2",
    skill: "ielts_reading",
    source: {
      category: "original_project",
      attribution: "LingoPeak Academic IELTS Editorial Team",
      licenseOrPermission: "Original IELTS Academic Practice Framework - LingoPeak Research",
      creationMethod: "human_authored",
      contentVersion: "1.2.0"
    },
    review: {
      status: "approved",
      reviewerId: "rev-ielts-examiner",
      reviewerName: "C\xF4 Nguy\u1EC5n Mai Trang (IELTS 8.5, Academic Specialist)",
      reviewedAt: "2026-09-24T15:00:00Z",
      reviewNotes: "B\xE0i \u0111\u1ECDc h\u1ECDc thu\u1EADt chu\u1EA9n IELTS Band 6.5 - 7.5, l\u1EADp lu\u1EADn logic v\xE0 b\u1EABy ph\u01B0\u01A1ng \xE1n tinh t\u1EBF.",
      aiValidationPassed: true
    },
    metadata: {
      createdAt: "2026-09-23T11:00:00Z",
      updatedAt: "2026-09-24T15:00:00Z",
      isProductionReady: true
    }
  },
  // ==========================================
  // LISTENING QUESTION WITH GENUINE TRANSCRIPT
  // ==========================================
  {
    id: "lp-listen-012",
    questionNumber: 12,
    section: "Listening Comprehension: Campus Orientation",
    audioText: "Good morning, international students! Welcome to the central library. Please remember that borrowing privileges for graduate students allow up to fifteen books for a duration of six weeks, while undergraduate students may check out up to eight books for three weeks. If you need reserve textbooks, those can only be consulted on the second floor for a maximum of two hours per session.",
    prompt: "How many books can undergraduate students borrow at one time according to the librarian?",
    options: ["Up to 8 books", "Up to 15 books", "Up to 6 books", "Up to 2 books"],
    correctAnswerIndex: 0,
    explanationVi: 'Ng\u01B0\u1EDDi n\xF3i n\xEAu r\xF5: "undergraduate students may check out up to eight books for three weeks" (sinh vi\xEAn \u0111\u1EA1i h\u1ECDc c\xF3 th\u1EC3 m\u01B0\u1EE3n t\u1ED1i \u0111a 8 cu\u1ED1n s\xE1ch trong 3 tu\u1EA7n). Sinh vi\xEAn cao h\u1ECDc (graduate students) m\u1EDBi \u0111\u01B0\u1EE3c m\u01B0\u1EE3n 15 cu\u1ED1n.',
    commonMistakesVi: "Th\xED sinh hay nh\u1EA7m l\u1EABn s\u1ED1 li\u1EC7u gi\u1EEFa sinh vi\xEAn \u0111\u1EA1i h\u1ECDc (undergraduate: 8 cu\u1ED1n) v\xE0 sinh vi\xEAn cao h\u1ECDc (graduate: 15 cu\u1ED1n).",
    distractorRationales: [
      '\u0110\xE1p \xE1n ch\xEDnh x\xE1c: "undergraduate students may check out up to eight books".',
      "15 cu\u1ED1n l\xE0 h\u1EA1n m\u1EE9c d\xE0nh cho graduate students (sau \u0111\u1EA1i h\u1ECDc).",
      'S\u1ED1 6 xu\u1EA5t hi\u1EC7n trong th\u1EDDi h\u1EA1n m\u01B0\u1EE3n c\u1EE7a sinh vi\xEAn cao h\u1ECDc ("six weeks"), kh\xF4ng ph\u1EA3i s\u1ED1 l\u01B0\u1EE3ng s\xE1ch.',
      'S\u1ED1 2 xu\u1EA5t hi\u1EC7n trong th\u1EDDi gian t\u1ED1i \u0111a m\u01B0\u1EE3n s\xE1ch tham kh\u1EA3o t\u1EA1i ch\u1ED7 ("two hours").'
    ],
    category: "Listening for Specific Numbers & Information",
    cefr: "B1",
    skill: "listening",
    source: {
      category: "original_project",
      attribution: "LingoPeak Audio & Listening Lab",
      licenseOrPermission: "Original Educational Audio Script - LingoPeak Core",
      creationMethod: "human_authored",
      contentVersion: "1.0.0"
    },
    review: {
      status: "approved",
      reviewerId: "rev-senior-curriculum-01",
      reviewerName: "ThS. Nguy\u1EC5n Ho\xE0ng Anh",
      reviewedAt: "2026-09-25T11:00:00Z",
      reviewNotes: "B\u1EA3n thu ph\xE1t chu\u1EA9n \xE2m thanh Text-To-Speech gi\u1ECDng b\u1EA3n ng\u1EEF, b\u1EABy s\u1ED1 li\u1EC7u \u0111\u1ED1i chi\u1EBFu r\xF5 n\xE9t.",
      aiValidationPassed: true
    },
    metadata: {
      createdAt: "2026-09-24T14:00:00Z",
      updatedAt: "2026-09-25T11:00:00Z",
      isProductionReady: true
    }
  }
];

// src/services/questionValidator.ts
var VALID_CEFR = /* @__PURE__ */ new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
var VALID_SOURCE_CATEGORIES = /* @__PURE__ */ new Set([
  "original_project",
  "ai_assisted_reviewed",
  "licensed_third_party",
  "official_sample"
]);
var VALID_REVIEW_STATUSES = /* @__PURE__ */ new Set([
  "draft",
  "pending_review",
  "needs_human_review",
  "approved",
  "rejected"
]);
function normalizePrompt(text) {
  return (text || "").toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
}
function computePromptSimilarity(promptA, promptB) {
  const wordsA = new Set(normalizePrompt(promptA).split(" ").filter(Boolean));
  const wordsB = new Set(normalizePrompt(promptB).split(" ").filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  wordsA.forEach((w) => {
    if (wordsB.has(w)) intersection++;
  });
  const union = (/* @__PURE__ */ new Set([...wordsA, ...wordsB])).size;
  return union === 0 ? 0 : intersection / union;
}
function validateQuestion(q) {
  const issues = [];
  const qId = q.id?.trim() || "unknown-id";
  if (!q.id || typeof q.id !== "string" || q.id.trim() === "") {
    issues.push({
      field: "id",
      type: "error",
      code: "MISSING_ID",
      message: "Question ID is required and cannot be empty."
    });
  } else if (!/^[a-zA-Z0-9_-]+$/.test(q.id.trim())) {
    issues.push({
      field: "id",
      type: "warning",
      code: "NON_STANDARD_ID",
      message: "Question ID should only contain letters, numbers, dashes, and underscores."
    });
  }
  if (!q.prompt || typeof q.prompt !== "string" || q.prompt.trim().length < 5) {
    issues.push({
      field: "prompt",
      type: "error",
      code: "INVALID_PROMPT",
      message: "Question prompt must be at least 5 characters."
    });
  }
  if (!Array.isArray(q.options) || q.options.length < 2) {
    issues.push({
      field: "options",
      type: "error",
      code: "INSUFFICIENT_OPTIONS",
      message: "Question must have at least 2 options (standard is 4)."
    });
  } else {
    const emptyIdx = q.options.findIndex((opt) => typeof opt !== "string" || opt.trim() === "");
    if (emptyIdx !== -1) {
      issues.push({
        field: `options[${emptyIdx}]`,
        type: "error",
        code: "EMPTY_OPTION",
        message: `Option at index ${emptyIdx} cannot be empty.`
      });
    }
    const trimmedOptions = q.options.map((opt) => typeof opt === "string" ? opt.trim().toLowerCase() : "");
    const uniqueOptions = new Set(trimmedOptions);
    if (uniqueOptions.size < trimmedOptions.length) {
      issues.push({
        field: "options",
        type: "error",
        code: "DUPLICATE_OPTIONS",
        message: "Options contain duplicate values. All distractors must be distinct."
      });
    }
  }
  const optionsLength = Array.isArray(q.options) ? q.options.length : 0;
  if (typeof q.correctAnswerIndex !== "number" || !Number.isInteger(q.correctAnswerIndex) || q.correctAnswerIndex < 0 || q.correctAnswerIndex >= optionsLength) {
    issues.push({
      field: "correctAnswerIndex",
      type: "error",
      code: "INVALID_ANSWER_INDEX",
      message: `Correct answer index (${q.correctAnswerIndex}) must be an integer between 0 and ${optionsLength - 1}.`
    });
  }
  if (!q.explanationVi || typeof q.explanationVi !== "string" || q.explanationVi.trim().length < 10) {
    issues.push({
      field: "explanationVi",
      type: "error",
      code: "MISSING_EXPLANATION",
      message: "Vietnamese pedagogical explanation must be at least 10 characters explaining why the answer is correct."
    });
  }
  if (q.cefr && !VALID_CEFR.has(q.cefr)) {
    issues.push({
      field: "cefr",
      type: "error",
      code: "INVALID_CEFR_LEVEL",
      message: `CEFR level '${q.cefr}' is invalid. Allowed levels: A1, A2, B1, B2, C1, C2.`
    });
  }
  if (q.source) {
    if (!VALID_SOURCE_CATEGORIES.has(q.source.category)) {
      issues.push({
        field: "source.category",
        type: "error",
        code: "INVALID_SOURCE_CATEGORY",
        message: `Source category '${q.source.category}' is invalid. Must be one of: original_project, ai_assisted_reviewed, licensed_third_party, official_sample.`
      });
    }
    if (!q.source.attribution || q.source.attribution.trim().length === 0) {
      issues.push({
        field: "source.attribution",
        type: "error",
        code: "MISSING_ATTRIBUTION",
        message: "Source attribution is required."
      });
    }
    if (!q.source.licenseOrPermission || q.source.licenseOrPermission.trim().length === 0) {
      issues.push({
        field: "source.licenseOrPermission",
        type: "error",
        code: "MISSING_LICENSE",
        message: "License or permission statement is required."
      });
    }
    if (q.source.creationMethod === "ai_assisted" && q.source.category === "official_sample") {
      issues.push({
        field: "source.category",
        type: "error",
        code: "MISLABELED_AI_AS_OFFICIAL",
        message: "Rule violation: Original AI-generated questions must not be labeled as official TOEIC/IELTS questions."
      });
    }
  } else {
    issues.push({
      field: "source",
      type: "warning",
      code: "MISSING_SOURCE_METADATA",
      message: "Question is missing source category and licensing metadata."
    });
  }
  if (q.review?.status && !VALID_REVIEW_STATUSES.has(q.review.status)) {
    issues.push({
      field: "review.status",
      type: "error",
      code: "INVALID_REVIEW_STATUS",
      message: `Review status '${q.review.status}' is invalid. Must be draft, pending_review, approved, or rejected.`
    });
  }
  const isListening = q.section?.toLowerCase().includes("listening") || q.skill === "listening" || q.skill === "toeic_listening" || q.skill === "ielts_listening";
  if (isListening) {
    const hasAudioText = Boolean(q.audioText && q.audioText.trim().length > 0);
    const hasAudioUrl = Boolean(q.audioUrl && q.audioUrl.trim().length > 0);
    if (!hasAudioText && !hasAudioUrl) {
      issues.push({
        field: "audioText",
        type: "error",
        code: "MISSING_AUDIO_SOURCE",
        message: "Listening questions must have either an audio transcript (audioText) for TTS playback or a verified playable audioUrl."
      });
    }
    if (hasAudioUrl && q.audioUrl?.includes("example.com")) {
      issues.push({
        field: "audioUrl",
        type: "error",
        code: "INVENTED_AUDIO_URL",
        message: "Audio URL cannot be a placeholder or invented domain. Use audioText for browser TTS or provide an active audio asset."
      });
    }
  }
  const hasErrors = issues.some((i) => i.type === "error");
  return {
    questionId: qId,
    isValid: !hasErrors,
    issues
  };
}
function validateQuestionBatch(questions, existingQuestions = []) {
  const results = [];
  const idSet = /* @__PURE__ */ new Map();
  const existingIdSet = new Set(existingQuestions.map((q) => q.id));
  questions.forEach((q) => {
    const qId = q.id?.trim();
    if (qId) {
      idSet.set(qId, (idSet.get(qId) || 0) + 1);
    }
  });
  const promptList = [];
  const duplicateGroups = [];
  questions.forEach((q) => {
    const res = validateQuestion(q);
    const qId = q.id?.trim() || "";
    if (qId) {
      const occurrenceCount = idSet.get(qId) || 0;
      if (occurrenceCount > 1) {
        res.isValid = false;
        res.issues.push({
          field: "id",
          type: "error",
          code: "DUPLICATE_ID_IN_BATCH",
          message: `Question ID '${qId}' is duplicated in this batch (${occurrenceCount} occurrences).`
        });
      }
      if (existingIdSet.has(qId)) {
        res.issues.push({
          field: "id",
          type: "warning",
          code: "OVERWRITES_EXISTING_ID",
          message: `Question ID '${qId}' already exists in question bank and will update the existing record.`
        });
      }
    }
    if (q.prompt) {
      promptList.push({
        id: qId,
        prompt: q.prompt,
        normalized: normalizePrompt(q.prompt)
      });
    }
    results.push(res);
  });
  for (let i = 0; i < promptList.length; i++) {
    const itemA = promptList[i];
    const dupWith = [];
    for (let j = i + 1; j < promptList.length; j++) {
      const itemB = promptList[j];
      const similarity = computePromptSimilarity(itemA.prompt, itemB.prompt);
      if (similarity >= 0.88) {
        dupWith.push(itemB.id);
        const bResult = results.find((r) => r.questionId === itemB.id);
        if (bResult) {
          bResult.issues.push({
            field: "prompt",
            type: "warning",
            code: "HIGH_PROMPT_SIMILARITY",
            message: `Question prompt is ${Math.round(similarity * 100)}% similar to question '${itemA.id}'. Check for unintentional duplication.`
          });
        }
      }
    }
    if (dupWith.length > 0) {
      duplicateGroups.push({
        id: itemA.id,
        prompt: itemA.prompt,
        duplicateWithIds: dupWith
      });
    }
  }
  const validCount = results.filter((r) => r.isValid).length;
  const invalidCount = results.filter((r) => !r.isValid).length;
  const duplicateCount = duplicateGroups.length;
  return {
    totalQuestions: questions.length,
    validCount,
    invalidCount,
    duplicateCount,
    results,
    duplicateGroups
  };
}

// src/data/seedData.ts
var INITIAL_VOCABULARY = [
  {
    id: "voc-1",
    word: "breadth",
    ipa: "/bred\u03B8/",
    pos: "noun",
    viMeaning: "b\u1EC1 r\u1ED9ng, ph\u1EA1m vi to\xE0n di\u1EC7n, ki\u1EBFn th\u1EE9c s\xE2u r\u1ED9ng",
    enDefinition: "the distance from one side to another, or the wide range or extent of something.",
    exampleEn: "The breadth of her knowledge across both science and literature amazed the professors.",
    exampleVi: "B\u1EC1 r\u1ED9ng tri th\u1EE9c c\u1EE7a c\xF4 \u1EA5y \u1EDF c\u1EA3 khoa h\u1ECDc v\xE0 v\u0103n h\u1ECDc khi\u1EBFn c\xE1c gi\xE1o s\u01B0 kinh ng\u1EA1c.",
    collocations: ["breadth of knowledge", "breadth of experience", "in breadth"],
    synonyms: ["width", "extent", "scope", "comprehensiveness"],
    antonyms: ["narrowness"],
    cefr: "C1",
    topic: "Academic & Abstract",
    usageNoteVi: "Th\u01B0\u1EDDng d\xF9ng \u0111\u1EC3 khen ng\u1EE3i ki\u1EBFn th\u1EE9c r\u1ED9ng (breadth of vision / breadth of mind).",
    status: "unseen",
    reviewCount: 0,
    isFavorite: false
  },
  {
    id: "voc-2",
    word: "ubiquitous",
    ipa: "/ju\u02D0\u02C8b\u026Ak.w\u026A.t\u0259s/",
    pos: "adjective",
    viMeaning: "c\xF3 m\u1EB7t \u1EDF kh\u1EAFp n\u01A1i, ph\u1ED5 bi\u1EBFn r\u1ED9ng r\xE3i",
    enDefinition: "seeming to be seen everywhere at the same time.",
    exampleEn: "Smartphones have become ubiquitous in modern urban life.",
    exampleVi: "\u0110i\u1EC7n tho\u1EA1i th\xF4ng minh \u0111\xE3 tr\u1EDF n\xEAn ph\u1ED5 bi\u1EBFn \u1EDF kh\u1EAFp m\u1ECDi n\u01A1i trong \u0111\u1EDDi s\u1ED1ng \u0111\xF4 th\u1ECB hi\u1EC7n \u0111\u1EA1i.",
    collocations: ["ubiquitous presence", "become ubiquitous", "almost ubiquitous"],
    synonyms: ["omnipresent", "pervasive", "everywhere", "universal"],
    antonyms: ["rare", "scarce"],
    cefr: "C1",
    topic: "Technology & Society",
    usageNoteVi: "R\u1EA5t hay xu\u1EA5t hi\u1EC7n trong b\xE0i thi IELTS Reading v\xE0 Writing Task 2 khi n\xF3i v\u1EC1 c\xF4ng ngh\u1EC7.",
    status: "unseen",
    reviewCount: 0,
    isFavorite: false
  },
  {
    id: "voc-3",
    word: "mitigate",
    ipa: "/\u02C8m\u026At.\u026A.\u0261e\u026At/",
    pos: "verb",
    viMeaning: "gi\u1EA3m nh\u1EB9, l\xE0m d\u1ECBu b\u1EDBt (t\xE1c h\u1EA1i, r\u1EE7i ro, n\u1ED7i \u0111au)",
    enDefinition: "to make something less harmful, unpleasant, or bad.",
    exampleEn: "Governments must take immediate measures to mitigate the severe effects of climate change.",
    exampleVi: "C\xE1c ch\xEDnh ph\u1EE7 c\u1EA7n th\u1EF1c hi\u1EC7n c\xE1c bi\u1EC7n ph\xE1p t\u1EE9c th\xEC \u0111\u1EC3 gi\u1EA3m nh\u1EB9 t\xE1c \u0111\u1ED9ng ti\xEAu c\u1EF1c c\u1EE7a bi\u1EBFn \u0111\u1ED5i kh\xED h\u1EADu.",
    collocations: ["mitigate risks", "mitigate the impact", "mitigate damages"],
    synonyms: ["alleviate", "lessen", "reduce", "diminish"],
    antonyms: ["exacerbate", "worsen", "aggravate"],
    cefr: "B2",
    topic: "Environment & Policy",
    usageNoteVi: 'Tr\xE1nh nh\u1EA7m v\u1EDBi "militate against" (ch\u1ED1ng l\u1EA1i). Lu\xF4n \u0111i c\xF9ng c\xE1c danh t\u1EEB ti\xEAu c\u1EF1c nh\u01B0 risk/impact/loss.',
    status: "unseen",
    reviewCount: 0,
    isFavorite: false
  },
  {
    id: "voc-4",
    word: "resilient",
    ipa: "/r\u026A\u02C8z\u026Al.j\u0259nt/",
    pos: "adjective",
    viMeaning: "ki\xEAn c\u01B0\u1EDDng, c\xF3 kh\u1EA3 n\u0103ng ph\u1EE5c h\u1ED3i nhanh sau kh\xF3 kh\u0103n",
    enDefinition: "able to be happy, successful, or recover quickly after something difficult has happened.",
    exampleEn: "Local businesses proved remarkably resilient during the economic downturn.",
    exampleVi: "C\xE1c doanh nghi\u1EC7p \u0111\u1ECBa ph\u01B0\u01A1ng \u0111\xE3 ch\u1EE9ng minh s\u1EF1 ki\xEAn c\u01B0\u1EDDng \u0111\xE1ng n\u1EC3 trong th\u1EDDi k\u1EF3 suy tho\xE1i kinh t\u1EBF.",
    collocations: ["highly resilient", "resilient economy", "resilient to change"],
    synonyms: ["tenacious", "tough", "adaptable", "buoyant"],
    antonyms: ["fragile", "vulnerable"],
    cefr: "B2",
    topic: "Personal Growth & Business",
    usageNoteVi: "C\xF3 th\u1EC3 mi\xEAu t\u1EA3 c\u1EA3 t\xEDnh c\xE1ch con ng\u01B0\u1EDDi, n\u1EC1n kinh t\u1EBF v\xE0 v\u1EADt li\u1EC7u \u0111\xE0n h\u1ED3i.",
    status: "unseen",
    reviewCount: 0,
    isFavorite: false
  },
  {
    id: "voc-5",
    word: "lucrative",
    ipa: "/\u02C8lu\u02D0.kr\u0259.t\u026Av/",
    pos: "adjective",
    viMeaning: "sinh l\u1EDDi cao, mang l\u1EA1i nhi\u1EC1u l\u1EE3i nhu\u1EADn",
    enDefinition: "producing a great deal of profit.",
    exampleEn: "Investing in renewable energy has proven to be a highly lucrative business venture.",
    exampleVi: "\u0110\u1EA7u t\u01B0 v\xE0o n\u0103ng l\u01B0\u1EE3ng t\xE1i t\u1EA1o \u0111\xE3 \u0111\u01B0\u1EE3c ch\u1EE9ng minh l\xE0 m\u1ED9t d\u1EF1 \xE1n kinh doanh mang l\u1EA1i l\u1EE3i nhu\u1EADn cao.",
    collocations: ["lucrative business", "lucrative contract", "lucrative career"],
    synonyms: ["profitable", "gainful", "remunerative", "high-yielding"],
    antonyms: ["unprofitable", "loss-making"],
    cefr: "B2",
    topic: "TOEIC & Business",
    usageNoteVi: "T\u1EEB kh\xF3a \u0111i\u1EC3m cao trong TOEIC Part 5 & 7 v\xE0 IELTS Speaking Part 1 khi n\xF3i v\u1EC1 ngh\u1EC1 nghi\u1EC7p.",
    status: "unseen",
    reviewCount: 0
  },
  {
    id: "voc-6",
    word: "scrutinize",
    ipa: "/\u02C8skru\u02D0.t\u026A.na\u026Az/",
    pos: "verb",
    viMeaning: "xem x\xE9t k\u1EF9 l\u01B0\u1EE1ng, ki\u1EC3m tra c\u1EA9n th\u1EADn t\u1EEBng chi ti\u1EBFt",
    enDefinition: "to examine something very carefully in order to discover information.",
    exampleEn: "The committee will scrutinize every clause of the proposed merger agreement.",
    exampleVi: "\u1EE6y ban s\u1EBD xem x\xE9t k\u1EF9 l\u01B0\u1EE1ng t\u1EEBng \u0111i\u1EC1u kho\u1EA3n c\u1EE7a th\u1ECFa thu\u1EADn s\xE1p nh\u1EADp \u0111\u1EC1 xu\u1EA5t.",
    collocations: ["scrutinize closely", "scrutinize data", "under close scrutiny"],
    synonyms: ["inspect", "examine", "audit", "investigate"],
    antonyms: ["glance", "overlook"],
    cefr: "C1",
    topic: "Academic & Legal",
    usageNoteVi: "D\u1EA1ng danh t\u1EEB l\xE0 scrutiny. Th\u01B0\u1EDDng g\u1EB7p trong v\u0103n phong nghi\xEAn c\u1EE9u ho\u1EB7c h\u1EE3p \u0111\u1ED3ng ph\xE1p l\xFD.",
    status: "unseen",
    reviewCount: 0
  },
  {
    id: "voc-7",
    word: "articulate",
    ipa: "/\u0251\u02D0\u02C8t\u026Ak.j\u0259.l\u0259t/",
    pos: "adjective",
    viMeaning: "\u0103n n\xF3i l\u01B0u lo\xE1t, di\u1EC5n \u0111\u1EA1t r\xF5 r\xE0ng g\xE3y g\u1ECDn",
    enDefinition: "able to express thoughts and arguments clearly and effectively.",
    exampleEn: "She gave an articulate and persuasive speech at the international youth forum.",
    exampleVi: "C\xF4 \u1EA5y \u0111\xE3 c\xF3 m\u1ED9t b\xE0i ph\xE1t bi\u1EC3u l\u01B0u lo\xE1t v\xE0 \u0111\u1EA7y s\u1EE9c thuy\u1EBFt ph\u1EE5c t\u1EA1i di\u1EC5n \u0111\xE0n thanh ni\xEAn qu\u1ED1c t\u1EBF.",
    collocations: ["highly articulate", "articulate speaker", "articulate viewpoint"],
    synonyms: ["eloquent", "coherent", "fluent", "lucid"],
    antonyms: ["inarticulate", "hesitant"],
    cefr: "C1",
    topic: "Communication & Leadership",
    usageNoteVi: "L\xE0 t\xEDnh t\u1EEB khi ph\xE1t \xE2m /-l\u0259t/, l\xE0 \u0111\u1ED9ng t\u1EEB (di\u1EC5n \u0111\u1EA1t) khi ph\xE1t \xE2m /-le\u026At/.",
    status: "unseen",
    reviewCount: 0
  },
  {
    id: "voc-8",
    word: "diligent",
    ipa: "/\u02C8d\u026Al.\u026A.d\u0292\u0259nt/",
    pos: "adjective",
    viMeaning: "c\u1EA7n c\xF9, ch\u0103m ch\u1EC9, si\xEAng n\u0103ng chu \u0111\xE1o",
    enDefinition: "done in a careful and detailed way; characterized by persistent effort.",
    exampleEn: "Thanks to his diligent research, the team discovered the software vulnerability before launch.",
    exampleVi: "Nh\u1EDD v\xE0o s\u1EF1 nghi\xEAn c\u1EE9u ch\u0103m ch\u1EC9 c\u1EE7a anh \u1EA5y, \u0111\u1ED9i ng\u0169 \u0111\xE3 ph\xE1t hi\u1EC7n l\u1ED7 h\u1ED5ng ph\u1EA7n m\u1EC1m tr\u01B0\u1EDBc khi ph\xE1t h\xE0nh.",
    collocations: ["diligent effort", "diligent student", "diligent worker"],
    synonyms: ["hardworking", "assiduous", "meticulous", "conscientious"],
    antonyms: ["lazy", "negligent"],
    cefr: "B1",
    topic: "Workplace & Character",
    usageNoteVi: "Th\xEDch h\u1EE3p d\xF9ng trong th\u01B0 gi\u1EDBi thi\u1EC7u (Recommendation letter) v\xE0 CV xin vi\u1EC7c.",
    status: "unseen",
    reviewCount: 0,
    isFavorite: false
  }
];
var INITIAL_COURSES = [
  {
    id: "course-daily-routine",
    title: "Daily Communication Mastery",
    titleVi: "Giao Ti\u1EBFp H\xE0ng Ng\xE0y T\u1EF1 Tin (A1-A2)",
    description: "Build natural reflexes in 30 practical topics: Self-introductions, daily schedules, commute, dining, and shopping.",
    descriptionVi: "X\xE2y d\u1EF1ng ph\u1EA3n x\u1EA1 t\u1EF1 nhi\xEAn trong 30 ch\u1EE7 \u0111\u1EC1 th\xF4ng d\u1EE5ng: Gi\u1EDBi thi\u1EC7u b\u1EA3n th\xE2n, th\xF3i quen sinh ho\u1EA1t, c\xF4ng vi\u1EC7c, mua s\u1EAFm v\xE0 g\u1ECDi m\xF3n.",
    level: "A1",
    language: "en",
    skills: ["speaking", "listening", "vocabulary"],
    estimatedDuration: 720,
    estimatedHours: 12,
    publicationStatus: "published",
    contentVersion: "1.0.0",
    category: "Communication",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
    totalLessons: 3,
    completedLessons: 0,
    modules: [
      {
        id: "mod-1",
        titleVi: "Kh\u1EDFi \u0111\u1ED9ng: Nh\u1ECBp s\u1ED1ng & Th\xF3i quen",
        descriptionVi: "L\xE0m ch\u1EE7 th\xEC Hi\u1EC7n t\u1EA1i \u0110\u01A1n, t\u1EEB v\u1EF1ng th\xF3i quen h\xE0ng ng\xE0y v\xE0 c\xE1ch n\xF3i gi\u1EDD gi\u1EA5c chu\u1EA9n.",
        lessons: [
          {
            id: "les-daily-1",
            courseId: "course-daily-routine",
            sequence: 1,
            title: "Daily Routines & Time Management",
            titleVi: "Th\xF3i quen sinh ho\u1EA1t & Qu\u1EA3n l\xFD th\u1EDDi gian",
            durationMinutes: 15,
            estimatedDuration: 15,
            xpReward: 50,
            isLocked: false,
            isCompleted: false,
            lessonType: "mixed",
            type: "mixed",
            prerequisites: [],
            publicationStatus: "published",
            objectivesVi: [
              "N\u1EAFm ch\u1EAFc 10 \u0111\u1ED9ng t\u1EEB ch\u1EC9 th\xF3i quen sinh ho\u1EA1t m\u1ED7i s\xE1ng.",
              "S\u1EED d\u1EE5ng tr\u1EA1ng t\u1EEB ch\u1EC9 t\u1EA7n su\u1EA5t (always, usually, sometimes, never).",
              "Luy\u1EC7n ph\u1EA3n x\u1EA1 h\u1ECFi \u0111\xE1p v\u1EC1 l\u1ECBch tr\xECnh th\u01B0\u1EDDng nh\u1EADt."
            ],
            theoryContent: {
              title: "C\u1EA5u tr\xFAc mi\xEAu t\u1EA3 th\xF3i quen h\xE0ng ng\xE0y",
              explanationVi: 'Khi n\xF3i v\u1EC1 th\xF3i quen sinh ho\u1EA1t l\u1EB7p \u0111i l\u1EB7p l\u1EA1i h\xE0ng ng\xE0y, ch\xFAng ta s\u1EED d\u1EE5ng th\xEC Hi\u1EC7n t\u1EA1i \u0110\u01A1n (Present Simple). Tr\u1EA1ng t\u1EEB ch\u1EC9 t\u1EA7n su\u1EA5t th\u01B0\u1EDDng \u0111\u1EE9ng TR\u01AF\u1EDAC \u0111\u1ED9ng t\u1EEB th\u01B0\u1EDDng v\xE0 \u0111\u1EE9ng SAU \u0111\u1ED9ng t\u1EEB "to be".',
              examples: [
                { en: "I usually wake up at 6:30 AM and drink a glass of warm water.", vi: "T\xF4i th\u01B0\u1EDDng th\u1EE9c d\u1EADy l\xFAc 6:30 s\xE1ng v\xE0 u\u1ED1ng m\u1ED9t c\u1ED1c n\u01B0\u1EDBc \u1EA5m." },
                { en: "She is always punctual for meetings.", vi: "C\xF4 \u1EA5y lu\xF4n lu\xF4n \u0111\xFAng gi\u1EDD trong c\xE1c cu\u1ED9c h\u1ECDp." }
              ],
              notesVi: "L\u01B0u \xFD chia \u0111\u1ED9ng t\u1EEB v\u1EDBi ng\xF4i th\u1EE9 3 s\u1ED1 \xEDt: He / She / It + V(s/es)."
            },
            vocabulary: INITIAL_VOCABULARY.slice(0, 2),
            exercises: [
              {
                id: "ex-1",
                type: "multiple_choice",
                prompt: "Choose the correct sentence regarding adverbs of frequency:",
                promptVi: "Ch\u1ECDn c\xE2u \u0111\xFAng v\u1EC1 v\u1ECB tr\xED tr\u1EA1ng t\u1EEB ch\u1EC9 t\u1EA7n su\u1EA5t:",
                options: [
                  "She drinks always coffee before starting work.",
                  "She always drinks coffee before starting work.",
                  "Always she drinks coffee before starting work.",
                  "She drinks coffee always before starting work."
                ],
                correctAnswer: "She always drinks coffee before starting work.",
                explanationVi: 'Tr\u1EA1ng t\u1EEB ch\u1EC9 t\u1EA7n su\u1EA5t "always" \u0111\u1EE9ng tr\u01B0\u1EDBc \u0111\u1ED9ng t\u1EEB th\u01B0\u1EDDng "drinks".'
              },
              {
                id: "ex-2",
                type: "fill_blank",
                prompt: "My brother usually _____ (wake) up early to prepare breakfast.",
                promptVi: "\u0110i\u1EC1n d\u1EA1ng \u0111\xFAng c\u1EE7a \u0111\u1ED9ng t\u1EEB trong ngo\u1EB7c:",
                options: ["wakes", "wake", "is waking", "woke"],
                correctAnswer: "wakes",
                explanationVi: 'Ch\u1EE7 ng\u1EEF "My brother" l\xE0 ng\xF4i th\u1EE9 3 s\u1ED1 \xEDt, di\u1EC5n t\u1EA3 th\xF3i quen l\u1EB7p l\u1EA1i n\xEAn d\xF9ng "wakes".'
              },
              {
                id: "ex-3",
                type: "sentence_order",
                prompt: "Arrange the words to form a natural sentence: [early / I / every / get up / day / morning]",
                promptVi: "S\u1EAFp x\u1EBFp c\xE1c t\u1EEB th\xE0nh c\xE2u ho\xE0n ch\u1EC9nh:",
                options: [
                  "I get up early every morning day",
                  "I get up early every morning",
                  "Every morning early I get up",
                  "I early get up morning every"
                ],
                correctAnswer: "I get up early every morning",
                explanationVi: "C\u1EA5u tr\xFAc chu\u1EA9n: Subject (I) + Verb phrase (get up early) + Time expression (every morning)."
              }
            ]
          },
          {
            id: "les-daily-2",
            courseId: "course-daily-routine",
            sequence: 2,
            title: "At the Cafe & Ordering Drinks",
            titleVi: "Giao ti\u1EBFp t\u1EA1i qu\xE1n Cafe & \u0110\u1EB7t \u0111\u1ED3 u\u1ED1ng",
            durationMinutes: 12,
            estimatedDuration: 12,
            xpReward: 40,
            isLocked: true,
            isCompleted: false,
            lessonType: "speaking",
            type: "speaking",
            prerequisites: ["les-daily-1"],
            publicationStatus: "published",
            objectivesVi: [
              'Bi\u1EBFt c\xE1ch g\u1ECDi \u0111\u1ED3 u\u1ED1ng l\u1ECBch s\u1EF1 v\u1EDBi "Could I have..." v\xE0 "I would like...".',
              "Hi\u1EC3u c\xE2u h\u1ECFi t\u1EEB barista v\u1EC1 k\xEDch c\u1EE1, lo\u1EA1i s\u1EEFa v\xE0 mang \u0111i/t\u1EA1i ch\u1ED7."
            ],
            theoryContent: {
              title: "M\u1EABu c\xE2u l\u1ECBch thi\u1EC7p khi g\u1ECDi m\xF3n (Polite Ordering)",
              explanationVi: 'Ng\u01B0\u1EDDi b\u1EA3n x\u1EE9 hi\u1EBFm khi n\xF3i c\u1ED9c l\u1ED1c "I want coffee". Thay v\xE0o \u0111\xF3, h\xE3y d\xF9ng "Could I please have...", "I\u2019d like a..." ho\u1EB7c "Can I get...".',
              examples: [
                { en: "Could I have an iced latte with oat milk, please?", vi: "Cho t\xF4i m\u1ED9t ly latte \u0111\xE1 v\u1EDBi s\u1EEFa y\u1EBFn m\u1EA1ch \u0111\u01B0\u1EE3c kh\xF4ng \u1EA1?" },
                { en: "Is this for here or to go?", vi: "B\u1EA1n d\xF9ng \u1EDF \u0111\xE2y hay mang \u0111i?" }
              ]
            },
            vocabulary: [],
            exercises: [
              {
                id: "ex-cafe-1",
                type: "multiple_choice",
                prompt: "What is the most polite way to ask for a glass of water?",
                promptVi: "C\xE1ch n\xE0o l\u1ECBch s\u1EF1 nh\u1EA5t \u0111\u1EC3 xin m\u1ED9t ly n\u01B0\u1EDBc?",
                options: [
                  "Give me water now.",
                  "Could I please have a glass of water?",
                  "I need water.",
                  "Water for me."
                ],
                correctAnswer: "Could I please have a glass of water?",
                explanationVi: '"Could I please have..." l\xE0 m\u1EABu c\xE2u chu\u1EA9n m\u1EF1c, l\u1ECBch s\u1EF1 nh\u1EA5t trong d\u1ECBch v\u1EE5 nh\xE0 h\xE0ng, qu\xE1n \u0103n.'
              }
            ]
          },
          {
            id: "les-daily-3",
            courseId: "course-daily-routine",
            sequence: 3,
            title: "Directions & Urban Commute",
            titleVi: "H\u1ECFi \u0111\u01B0\u1EDDng & Di chuy\u1EC3n trong Th\xE0nh ph\u1ED1",
            durationMinutes: 15,
            estimatedDuration: 15,
            xpReward: 50,
            isLocked: true,
            isCompleted: false,
            lessonType: "mixed",
            type: "mixed",
            prerequisites: ["les-daily-2"],
            publicationStatus: "published",
            objectivesVi: [
              'Ch\u1EC9 \u0111\u01B0\u1EDDng ch\xEDnh x\xE1c v\u1EDBi "Go straight", "Turn left/right at the intersection".',
              "H\u1ECFi ph\u01B0\u01A1ng ti\u1EC7n c\xF4ng c\u1ED9ng (bus, subway, ticket booth) t\u1EF1 tin."
            ],
            theoryContent: {
              title: "C\u1EE5m t\u1EEB ch\u1EC9 ph\u01B0\u01A1ng h\u01B0\u1EDBng v\xE0 kho\u1EA3ng c\xE1ch",
              explanationVi: 'Khi h\u1ECFi \u0111\u01B0\u1EDDng l\u1ECBch thi\u1EC7p: "Excuse me, could you tell me how to get to...?" ho\u1EB7c "Is there a subway station near here?".',
              examples: [
                { en: "Go straight for two blocks, then turn left at the traffic light.", vi: "\u0110i th\u1EB3ng qua hai d\xE3y nh\xE0, sau \u0111\xF3 r\u1EBD tr\xE1i \u1EDF c\u1ED9t \u0111\xE8n giao th\xF4ng." },
                { en: "The museum is across from the central library.", vi: "B\u1EA3o t\xE0ng n\u1EB1m \u0111\u1ED1i di\u1EC7n th\u01B0 vi\u1EC7n trung t\xE2m." }
              ]
            },
            vocabulary: [],
            exercises: [
              {
                id: "ex-dir-1",
                type: "multiple_choice",
                prompt: 'How do you say "N\xF3 n\u1EB1m \u0111\u1ED1i di\u1EC7n b\u01B0u \u0111i\u1EC7n" in English?',
                promptVi: 'D\u1ECBch c\xE2u "N\xF3 n\u1EB1m \u0111\u1ED1i di\u1EC7n b\u01B0u \u0111i\u1EC7n":',
                options: [
                  "It is across from the post office.",
                  "It is near at the post office.",
                  "It is in front of behind the post office.",
                  "It is opposing the post office."
                ],
                correctAnswer: "It is across from the post office.",
                explanationVi: '"Across from" mang ngh\u0129a \u0111\u1ED1i di\u1EC7n tr\u1EF1c ti\u1EBFp qua b\xEAn kia \u0111\u01B0\u1EDDng.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "course-ielts-mastery",
    title: "IELTS Band 7.5+ Strategy",
    titleVi: "Chi\u1EBFn Thu\u1EADt B\u1EE9t Ph\xE1 IELTS 7.5+",
    description: "Develop critical thinking, trap avoidance in Listening/Reading, and master Task 2 marking rubrics.",
    descriptionVi: "Ph\xE1t tri\u1EC3n t\u01B0 duy ph\u1EA3n bi\u1EC7n, k\u1EF9 n\u0103ng x\u1EED l\xFD b\u1EABy trong Listening/Reading v\xE0 l\xE0m ch\u1EE7 khung ti\xEAu chu\u1EA9n ch\u1EA5m \u0111i\u1EC3m Task 2.",
    level: "B2",
    language: "en",
    skills: ["writing", "reading"],
    estimatedDuration: 2100,
    estimatedHours: 35,
    publicationStatus: "published",
    contentVersion: "1.0.0",
    category: "IELTS",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
    totalLessons: 2,
    completedLessons: 0,
    modules: [
      {
        id: "mod-ielts-1",
        titleVi: "IELTS Writing Task 2: Advanced Coherence",
        descriptionVi: "C\xE1ch x\xE2y d\u1EF1ng m\u1EA1ch l\u1EADp lu\u1EADn ch\u1EB7t ch\u1EBD (Cohesion & Coherence) \u0111\u1EC3 \u0111\u1EA1t Band 7.5+.",
        lessons: [
          {
            id: "les-ielts-w1",
            courseId: "course-ielts-mastery",
            sequence: 1,
            title: "Paragraph Structure & Counter-arguments",
            titleVi: "C\u1EA5u tr\xFAc \u0111o\u1EA1n v\u0103n PEEL & Lu\u1EADn \u0111i\u1EC3m ph\u1EA3n bi\u1EC7n",
            durationMinutes: 25,
            estimatedDuration: 25,
            xpReward: 80,
            isLocked: false,
            isCompleted: false,
            lessonType: "writing",
            type: "writing",
            prerequisites: [],
            publicationStatus: "published",
            objectivesVi: [
              "\xC1p d\u1EE5ng m\xF4 h\xECnh PEEL (Point, Explanation, Example, Link).",
              "Vi\u1EBFt c\xE2u ph\u1EA3n bi\u1EC7n (Counter-argument & Refutation) t\u1EF1 nhi\xEAn."
            ],
            theoryContent: {
              title: "K\u1EF9 thu\u1EADt vi\u1EBFt \u0111o\u1EA1n v\u0103n chu\u1EA9n PEEL",
              explanationVi: "M\u1ED7i \u0111o\u1EA1n th\xE2n b\xE0i c\u1EA7n b\u1EAFt \u0111\u1EA7u b\u1EB1ng 1 Topic sentence r\xF5 r\xE0ng, theo sau l\xE0 ph\xE2n t\xEDch s\xE2u nguy\xEAn nh\xE2n - h\u1EC7 qu\u1EA3 (Explanation), d\u1EABn ch\u1EE9ng c\u1EE5 th\u1EC3 (Example) v\xE0 c\xE2u ch\u1ED1t li\xEAn k\u1EBFt v\u1EDBi lu\u1EADn \u0111\u1EC1 chung (Link).",
              examples: [
                {
                  en: "While critics argue that artificial intelligence threatens employment, it fundamentally creates novel industries requiring specialized cognitive skills.",
                  vi: "M\u1EB7c d\xF9 nhi\u1EC1u ng\u01B0\u1EDDi cho r\u1EB1ng tr\xED tu\u1EC7 nh\xE2n t\u1EA1o \u0111e d\u1ECDa vi\u1EC7c l\xE0m, v\u1EC1 b\u1EA3n ch\u1EA5t n\xF3 t\u1EA1o ra nh\u1EEFng ng\xE0nh c\xF4ng nghi\u1EC7p m\u1EDBi \u0111\xF2i h\u1ECFi k\u1EF9 n\u0103ng t\u01B0 duy chuy\xEAn s\xE2u."
                }
              ]
            },
            vocabulary: INITIAL_VOCABULARY.slice(2, 5),
            exercises: [
              {
                id: "ex-ielts-1",
                type: "multiple_choice",
                prompt: "Which linking word best introduces a concession / counter-argument?",
                promptVi: "Li\xEAn t\u1EEB n\xE0o th\xEDch h\u1EE3p nh\u1EA5t \u0111\u1EC3 m\u1EDF \u0111\u1EA7u m\u1ED9t \xFD nh\u01B0\u1EE3ng b\u1ED9/ph\u1EA3n bi\u1EC7n?",
                options: ["Albeit", "Notwithstanding the claim that", "Furthermore", "Consequently"],
                correctAnswer: "Notwithstanding the claim that",
                explanationVi: '"Notwithstanding the claim that..." (M\u1EB7c cho nh\u1EEFng tuy\xEAn b\u1ED1 r\u1EB1ng...) l\xE0 c\u1EA5u tr\xFAc h\u1ECDc thu\u1EADt C1/C2 xu\u1EA5t s\u1EAFc cho \u0111o\u1EA1n ph\u1EA3n bi\u1EC7n.'
              }
            ]
          },
          {
            id: "les-ielts-r1",
            courseId: "course-ielts-mastery",
            sequence: 2,
            title: "Academic Reading: Skimming & Scanning Mastery",
            titleVi: "\u0110\u1ECDc hi\u1EC3u H\u1ECDc thu\u1EADt: K\u1EF9 thu\u1EADt Skimming & Scanning",
            durationMinutes: 30,
            estimatedDuration: 30,
            xpReward: 90,
            isLocked: true,
            isCompleted: false,
            lessonType: "reading",
            type: "reading",
            prerequisites: ["les-ielts-w1"],
            publicationStatus: "published",
            objectivesVi: [
              "Ph\xE2n bi\u1EC7t \u0111\u1ECDc l\u01B0\u1EDBt n\u1EAFm \xFD ch\xEDnh (Skimming) v\xE0 qu\xE9t t\u1EEB kh\xF3a s\u1ED1 li\u1EC7u (Scanning).",
              "Gi\u1EA3i quy\u1EBFt d\u1EA1ng b\xE0i Matching Headings v\xE0 True/False/Not Given trong 15 ph\xFAt."
            ],
            theoryContent: {
              title: "Chi\u1EBFn thu\u1EADt \u0111\u1ECBnh v\u1ECB th\xF4ng tin trong \u0111o\u1EA1n v\u0103n h\u1ECDc thu\u1EADt d\xE0i",
              explanationVi: "\u0110\u1EEBng d\u1ECBch t\u1EEBng t\u1EEB. H\xE3y \u0111\u1ECDc c\xE2u \u0111\u1EA7u v\xE0 c\xE2u cu\u1ED1i \u0111o\u1EA1n \u0111\u1EC3 n\u1EAFm ch\u1EE7 \u0111\u1EC1, sau \u0111\xF3 qu\xE9t t\xEAn ri\xEAng, m\u1ED1c th\u1EDDi gian, thu\u1EADt ng\u1EEF in hoa \u0111\u1EC3 x\xE1c \u0111\u1ECBnh v\u1ECB tr\xED \u0111\xE1p \xE1n.",
              examples: [
                {
                  en: "Vertical farming yields up to ten times more produce per square meter than conventional soil-based agriculture.",
                  vi: "N\xF4ng nghi\u1EC7p th\u1EB3ng \u0111\u1EE9ng mang l\u1EA1i s\u1EA3n l\u01B0\u1EE3ng g\u1EA5p m\u01B0\u1EDDi l\u1EA7n tr\xEAn m\u1ED7i m\xE9t vu\xF4ng so v\u1EDBi n\xF4ng nghi\u1EC7p truy\u1EC1n th\u1ED1ng canh t\xE1c tr\xEAn \u0111\u1EA5t."
                }
              ]
            },
            vocabulary: [],
            exercises: [
              {
                id: "ex-ielts-r-1",
                type: "multiple_choice",
                prompt: 'Based on the passage: "Vertical farming yields up to ten times more produce...", does vertical farming produce more crops per area than traditional methods?',
                promptVi: "D\u1EF1a tr\xEAn c\xE2u d\u1EABn: N\xF4ng nghi\u1EC7p th\u1EB3ng \u0111\u1EE9ng c\xF3 t\u1EA1o ra nhi\u1EC1u s\u1EA3n l\u01B0\u1EE3ng h\u01A1n tr\xEAn c\xF9ng di\u1EC7n t\xEDch so v\u1EDBi ph\u01B0\u01A1ng ph\xE1p truy\u1EC1n th\u1ED1ng kh\xF4ng?",
                options: ["True", "False", "Not Given"],
                correctAnswer: "True",
                explanationVi: 'C\xE2u d\u1EABn kh\u1EB3ng \u0111\u1ECBnh "yields up to ten times more produce per square meter", do \u0111\xF3 nh\u1EADn \u0111\u1ECBnh l\xE0 True.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "course-toeic-pro",
    title: "TOEIC 850+ Business English",
    titleVi: "Chinh Ph\u1EE5c TOEIC 850+ & Ti\u1EBFng Anh Th\u01B0\u01A1ng M\u1EA1i",
    description: "Speed-solving ETS tactics: Part 5 word formation traps, Part 7 skimming strategies, and business vocabulary.",
    descriptionVi: "Chi\u1EBFn thu\u1EADt gi\u1EA3i \u0111\u1EC1 ETS nhanh v\xE0 ch\xEDnh x\xE1c: B\u1EABy ng\u1EEF ph\xE1p Part 5, k\u1EF9 n\u0103ng qu\xE9t th\xF4ng tin Part 7 v\xE0 t\u1EEB v\u1EF1ng doanh nghi\u1EC7p.",
    level: "B1",
    language: "en",
    skills: ["grammar", "reading"],
    estimatedDuration: 1500,
    estimatedHours: 25,
    publicationStatus: "published",
    contentVersion: "1.0.0",
    category: "TOEIC",
    thumbnail: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
    totalLessons: 2,
    completedLessons: 0,
    modules: [
      {
        id: "mod-toeic-1",
        titleVi: "TOEIC Part 5: Master Word Formations",
        descriptionVi: "C\xE1ch x\u1EED l\xFD c\xE2u h\u1ECFi t\u1EEB lo\u1EA1i trong 10 gi\xE2y kh\xF4ng c\u1EA7n d\u1ECBch c\u1EA3 c\xE2u.",
        lessons: [
          {
            id: "les-toeic-1",
            courseId: "course-toeic-pro",
            sequence: 1,
            title: "Suffix Clues & Part of Speech Traps",
            titleVi: "D\u1EA5u hi\u1EC7u \u0111u\xF4i t\u1EEB lo\u1EA1i & B\u1EABy ng\u1EEF ph\xE1p ETS",
            durationMinutes: 18,
            estimatedDuration: 18,
            xpReward: 60,
            isLocked: false,
            isCompleted: false,
            lessonType: "grammar",
            type: "grammar",
            prerequisites: [],
            publicationStatus: "published",
            objectivesVi: [
              "Nh\u1EADn di\u1EC7n t\u1EE9c th\xEC v\u1ECB tr\xED c\u1EA7n \u0111i\u1EC1n danh t\u1EEB, t\xEDnh t\u1EEB hay tr\u1EA1ng t\u1EEB.",
              "Tr\xE1nh b\u1EABy \u0111u\xF4i -ly (friendly, timely, costly l\xE0 t\xEDnh t\u1EEB, kh\xF4ng ph\u1EA3i tr\u1EA1ng t\u1EEB)."
            ],
            theoryContent: {
              title: "V\u1ECB tr\xED c\u1EE7a t\xEDnh t\u1EEB v\xE0 tr\u1EA1ng t\u1EEB trong TOEIC",
              explanationVi: "Tr\u1EA1ng t\u1EEB (adv) b\u1ED5 ngh\u0129a cho \u0111\u1ED9ng t\u1EEB, t\xEDnh t\u1EEB ho\u1EB7c m\u1ED9t tr\u1EA1ng t\u1EEB kh\xE1c. C\u1EA5u tr\xFAc \u0111i\u1EC3n h\xECnh: Subj + Verb + ADV + Object ho\u1EB7c BE + ADV + ADJ.",
              examples: [
                {
                  en: "The CEO was extremely satisfied with the sales growth.",
                  vi: "V\u1ECB gi\xE1m \u0111\u1ED1c \u0111i\u1EC1u h\xE0nh \u0111\xE3 c\u1EF1c k\u1EF3 h\xE0i l\xF2ng v\u1EDBi s\u1EF1 t\u0103ng tr\u01B0\u1EDFng doanh s\u1ED1."
                }
              ]
            },
            vocabulary: INITIAL_VOCABULARY.slice(4, 7),
            exercises: [
              {
                id: "ex-toeic-1",
                type: "multiple_choice",
                prompt: "Mr. Henderson reviewed the financial report _____ before presenting it to stakeholders.",
                promptVi: "Ch\u1ECDn t\u1EEB th\xEDch h\u1EE3p \u0111i\u1EC1n v\xE0o ch\u1ED7 tr\u1ED1ng:",
                options: ["careful", "carefully", "caring", "carefulness"],
                correctAnswer: "carefully",
                explanationVi: 'C\u1EA7n m\u1ED9t tr\u1EA1ng t\u1EEB (carefully) \u0111\u1EC3 b\u1ED5 ngh\u0129a cho \u0111\u1ED9ng t\u1EEB h\xE0nh \u0111\u1ED9ng "reviewed".'
              }
            ]
          },
          {
            id: "les-toeic-2",
            courseId: "course-toeic-pro",
            sequence: 2,
            title: "Business Memos & Email Scenarios",
            titleVi: "Th\u01B0 t\xEDn Doanh nghi\u1EC7p & X\u1EED l\xFD H\xF3a \u0111\u01A1n, \u0110\u01A1n h\xE0ng",
            durationMinutes: 20,
            estimatedDuration: 20,
            xpReward: 70,
            isLocked: true,
            isCompleted: false,
            lessonType: "reading",
            type: "reading",
            prerequisites: ["les-toeic-1"],
            publicationStatus: "published",
            objectivesVi: [
              "N\u1EAFm v\u1EEFng b\u1ED1 c\u1EE5c email th\u01B0\u01A1ng m\u1EA1i chu\u1EA9n: Salutation, Purpose, Action Required, Closing.",
              "Gi\u1EA3i quy\u1EBFt c\xE2u h\u1ECFi Part 6 & 7 v\u1EC1 h\u1EA1n ch\xF3t thanh to\xE1n v\xE0 khi\u1EBFu n\u1EA1i d\u1ECBch v\u1EE5."
            ],
            theoryContent: {
              title: "C\u1EA5u tr\xFAc th\u01B0 t\xEDn v\u0103n ph\xF2ng trang tr\u1ECDng",
              explanationVi: "Trong TOEIC Part 7, c\xE1c c\xE2u h\u1ECFi th\u01B0\u1EDDng xoay quanh m\u1EE5c \u0111\xEDch vi\u1EBFt email (What is the purpose of the email?) v\xE0 ng\u01B0\u1EDDi nh\u1EADn c\u1EA7n l\xE0m g\xEC ti\u1EBFp theo (What is the recipient asked to do?).",
              examples: [
                {
                  en: "Please ensure that all invoices are submitted to accounting by the end of the fiscal quarter.",
                  vi: "Vui l\xF2ng \u0111\u1EA3m b\u1EA3o r\u1EB1ng t\u1EA5t c\u1EA3 h\xF3a \u0111\u01A1n \u0111\u01B0\u1EE3c g\u1EEDi \u0111\u1EBFn b\u1ED9 ph\u1EADn k\u1EBF to\xE1n tr\u01B0\u1EDBc khi k\u1EBFt th\xFAc qu\xFD t\xE0i ch\xEDnh."
                }
              ]
            },
            vocabulary: [],
            exercises: [
              {
                id: "ex-toeic-2",
                type: "multiple_choice",
                prompt: 'In a business memo, "Please find attached the revised budget" is used to:',
                promptVi: 'C\u1EE5m t\u1EEB "Please find attached the revised budget" nh\u1EB1m m\u1EE5c \u0111\xEDch g\xEC?',
                options: [
                  "Notify the reader that a document is included with the message",
                  "Request a salary increase",
                  "Decline a business proposal",
                  "Cancel an upcoming meeting"
                ],
                correctAnswer: "Notify the reader that a document is included with the message",
                explanationVi: '"Please find attached..." l\xE0 c\xE2u th\xF4ng b\xE1o t\xE0i li\u1EC7u \u0111\xEDnh k\xE8m k\xE8m theo th\u01B0.'
              }
            ]
          }
        ]
      }
    ]
  }
];
var INITIAL_PRACTICE_TESTS = [
  {
    id: "test-verified-mastery",
    title: "LingoPeak Verified Assessment Benchmark (CEFR A1-B2 & Workplace)",
    titleVi: "B\u1ED9 \u0110\u1EC1 Th\u1EA9m \u0110\u1ECBnh Kh\u1EA3o Th\xED Qu\u1ED1c T\u1EBF LingoPeak (A1 - B2, TOEIC, IELTS)",
    type: "placement_test",
    durationMinutes: 25,
    totalQuestions: VERIFIED_QUESTION_BANK.length,
    targetLevel: "CEFR A1 - B2 (To\xE0n di\u1EC7n)",
    descriptionVi: "100% c\xE2u h\u1ECFi \u0111\xE3 qua h\u1ED9i \u0111\u1ED3ng th\u1EA9m \u0111\u1ECBnh s\u01B0 ph\u1EA1m v\xE0 b\u1EA3n quy\u1EC1n, ki\u1EC3m tra to\xE0n di\u1EC7n Ng\u1EEF ph\xE1p, T\u1EEB v\u1EF1ng, \u0110\u1ECDc hi\u1EC3u, Nghe hi\u1EC3u, TOEIC c\xF4ng s\u1EDF v\xE0 IELTS h\u1ECDc thu\u1EADt.",
    questions: VERIFIED_QUESTION_BANK
  },
  {
    id: "test-placement",
    title: "Comprehensive CEFR Placement Test",
    titleVi: "B\xE0i Ki\u1EC3m Tra \u0110\u1EA7u V\xE0o \u0110a K\u1EF9 N\u0103ng (A1 - C1)",
    type: "placement_test",
    durationMinutes: 15,
    totalQuestions: 10,
    targetLevel: "All Levels",
    descriptionVi: "\u0110\xE1nh gi\xE1 \u0111\u1ED9 chu\u1EA9n x\xE1c v\u1EC1 ng\u1EEF ph\xE1p, t\u1EEB v\u1EF1ng v\xE0 t\u01B0 duy \u0111\u1ECDc hi\u1EC3u \u0111\u1EC3 g\u1EE3i \xFD l\u1ED9 tr\xECnh h\u1ECDc th\xEDch h\u1EE3p nh\u1EA5t cho b\u1EA1n.",
    questions: [
      {
        id: "q-pl-1",
        questionNumber: 1,
        section: "Grammar Foundation",
        prompt: "Look at the clouds! It _____ rain very soon.",
        options: ["will", "is going to", "rains", "is raining"],
        correctAnswerIndex: 1,
        explanationVi: 'C\xF3 b\u1EB1ng ch\u1EE9ng c\u1EE5 th\u1EC3 tr\u01B0\u1EDBc m\u1EAFt ("Look at the clouds") -> D\xF9ng "be going to" \u0111\u1EC3 di\u1EC5n t\u1EA3 d\u1EF1 \u0111o\xE1n ch\u1EAFc ch\u1EAFn.',
        category: "Future Forms"
      },
      {
        id: "q-pl-2",
        questionNumber: 2,
        section: "Grammar Foundation",
        prompt: "Neither the manager nor the employees _____ informed about the policy change.",
        options: ["was", "were", "is", "has been"],
        correctAnswerIndex: 1,
        explanationVi: 'Quy t\u1EAFc h\xF2a h\u1EE3p ch\u1EE7 ng\u1EEF "Neither A nor B": \u0110\u1ED9ng t\u1EEB chia theo ch\u1EE7 ng\u1EEF g\u1EA7n nh\u1EA5t (B = employees, s\u1ED1 nhi\u1EC1u -> were).',
        category: "Subject-Verb Agreement"
      },
      {
        id: "q-pl-3",
        questionNumber: 3,
        section: "Vocabulary in Context",
        prompt: "The government took swift actions to _____ the impact of the economic recession.",
        options: ["provoke", "mitigate", "disrupt", "amplify"],
        correctAnswerIndex: 1,
        explanationVi: '"Mitigate" c\xF3 ngh\u0129a l\xE0 gi\u1EA3m nh\u1EB9 t\xE1c \u0111\u1ED9ng ti\xEAu c\u1EF1c.',
        category: "Lexical Resource"
      },
      {
        id: "q-pl-4",
        questionNumber: 4,
        section: "Reading Comprehension",
        contextPassage: "Technological disruption has fundamentally reshaped consumer expectations. Today, immediate responsiveness is no longer considered a luxury; rather, it has become an indispensable baseline expectation across e-commerce ecosystems.",
        prompt: "According to the passage, what is true about immediate responsiveness?",
        options: [
          "It is exclusively available to premium subscribers.",
          "It has transitioned from a luxury to a fundamental requirement.",
          "It has reduced consumer engagement on e-commerce platforms.",
          "It is resisted by modern consumers."
        ],
        correctAnswerIndex: 1,
        explanationVi: '\u0110o\u1EA1n v\u0103n n\xEAu r\xF5: "immediate responsiveness is no longer considered a luxury; rather, it has become an indispensable baseline expectation" -> \u0110\xE3 chuy\u1EC3n t\u1EEB xa x\u1EC9 th\xE0nh y\xEAu c\u1EA7u c\u0103n b\u1EA3n.',
        category: "Reading Comprehension"
      },
      {
        id: "q-pl-5",
        questionNumber: 5,
        section: "Advanced Grammar",
        prompt: "Under no circumstances _____ to leave the exam hall before the supervisor signals.",
        options: ["students are allowed", "are students allowed", "were students allowing", "allowed are students"],
        correctAnswerIndex: 1,
        explanationVi: 'C\u1EE5m \u0111\u1EA3o ng\u1EEF ph\u1EE7 \u0111\u1ECBnh "Under no circumstances" y\xEAu c\u1EA7u \u0111\u1EA3o to be "are" l\xEAn tr\u01B0\u1EDBc "students".',
        category: "Inversion"
      },
      {
        id: "q-pl-6",
        questionNumber: 6,
        section: "TOEIC Business Practice",
        prompt: "The marketing department completed the project ahead of schedule, _____ the executive board.",
        options: ["delighted", "delighting", "delight", "to delighting"],
        correctAnswerIndex: 1,
        explanationVi: "R\xFAt g\u1ECDn m\u1EC7nh \u0111\u1EC1 quan h\u1EC7 d\u1EA1ng ch\u1EE7 \u0111\u1ED9ng th\xE0nh ph\xE2n t\u1EEB hi\u1EC7n t\u1EA1i (present participle: delighting = which delighted...).",
        category: "Participle Clauses"
      },
      {
        id: "q-pl-7",
        questionNumber: 7,
        section: "Collocations & Prepositions",
        prompt: "She has always been deeply committed _____ environmental conservation.",
        options: ["for", "to", "with", "about"],
        correctAnswerIndex: 1,
        explanationVi: 'C\u1EA5u tr\xFAc c\u1ED1 \u0111\u1ECBnh: "committed to + N/V-ing" (t\u1EADn t\xE2m, cam k\u1EBFt v\u1EDBi \u0111i\u1EC1u g\xEC).',
        category: "Prepositions"
      },
      {
        id: "q-pl-8",
        questionNumber: 8,
        section: "Academic Vocabulary",
        prompt: "The new scientific findings were thoroughly _____ by an independent research committee.",
        options: ["scrutinized", "evaded", "bypassed", "neglected"],
        correctAnswerIndex: 0,
        explanationVi: '"Scrutinized" ngh\u0129a l\xE0 ki\u1EC3m tra, th\u1EA9m \u0111\u1ECBnh k\u1EF9 l\u01B0\u1EE1ng.',
        category: "C1 Vocabulary"
      },
      {
        id: "q-pl-9",
        questionNumber: 9,
        section: "Conditionals",
        prompt: "Had you warned me earlier, I _____ that risky contract.",
        options: ["would not sign", "will not sign", "would not have signed", "had not signed"],
        correctAnswerIndex: 2,
        explanationVi: '\u0110\u1EA3o ng\u1EEF c\xE2u \u0111i\u1EC1u ki\u1EC7n lo\u1EA1i 3 ("Had you warned me" = If you had warned me) -> M\u1EC7nh \u0111\u1EC1 ch\xEDnh: would not have signed.',
        category: "Conditionals"
      },
      {
        id: "q-pl-10",
        questionNumber: 10,
        section: "Idioms & Pragmatics",
        prompt: "When negotiating high-stakes agreements, one must keep their cards close to their chest. This means:",
        options: [
          "Showing everyone your secret plans openly.",
          "Keeping your intentions and strategies confidential.",
          "Discarding all unnecessary playing cards.",
          "Leaving the negotiation room immediately."
        ],
        correctAnswerIndex: 1,
        explanationVi: 'Th\xE0nh ng\u1EEF "keep one\u2019s cards close to one\u2019s chest" c\xF3 ngh\u0129a l\xE0 gi\u1EEF k\xEDn k\u1EBF ho\u1EA1ch/chi\u1EBFn l\u01B0\u1EE3c, kh\xF4ng \u0111\u1EC3 \u0111\u1ED1i ph\u01B0\u01A1ng n\u1EAFm b\u1EAFt.',
        category: "Idioms"
      }
    ]
  },
  {
    id: "test-toeic-reading-750",
    title: "TOEIC Reading Mini-Mock 2026",
    titleVi: "\u0110\u1EC1 Thi Th\u1EED TOEIC Reading & Ng\u1EEF Ph\xE1p Th\u01B0\u01A1ng M\u1EA1i",
    type: "full_toeic",
    durationMinutes: 20,
    totalQuestions: 8,
    targetLevel: "Target 750+",
    descriptionVi: "M\xF4 ph\u1ECFng 100% c\u1EA5u tr\xFAc Part 5 & Part 7 \u0111\u1EC1 thi TOEIC th\u1EADt v\u1EDBi ch\u1EE7 \u0111\u1EC1 c\xF4ng s\u1EDF, email v\xE0 h\u1EE3p \u0111\u1ED3ng kinh doanh.",
    questions: [
      {
        id: "t-toeic-1",
        questionNumber: 1,
        section: "Part 5 - Incomplete Sentences",
        prompt: "Employees who wish to enroll in the leadership workshop must submit their application forms _____ Friday noon.",
        options: ["until", "by", "since", "during"],
        correctAnswerIndex: 1,
        explanationVi: '"By" d\xF9ng \u0111\u1EC3 ch\u1EC9 th\u1EDDi h\u1EA1n ch\xF3t (deadline: tr\u01B0\u1EDBc ho\u1EB7c \u0111\xFAng l\xFAc). "Until" d\xF9ng cho h\xE0nh \u0111\u1ED9ng k\xE9o d\xE0i li\xEAn t\u1EE5c t\u1EDBi th\u1EDDi \u0111i\u1EC3m \u0111\xF3.',
        category: "Prepositions of Time"
      },
      {
        id: "t-toeic-2",
        questionNumber: 2,
        section: "Part 5 - Incomplete Sentences",
        prompt: "The regional sales manager praised the team for their _____ performance during the promotional campaign.",
        options: ["exception", "exceptional", "exceptionally", "excepting"],
        correctAnswerIndex: 1,
        explanationVi: '\u0110\u1EE9ng tr\u01B0\u1EDBc danh t\u1EEB "performance" c\u1EA7n m\u1ED9t t\xEDnh t\u1EEB b\u1ED5 ngh\u0129a ("exceptional" = xu\u1EA5t ch\xFAng, v\u01B0\u1EE3t tr\u1ED9i).',
        category: "Word Forms"
      },
      {
        id: "t-toeic-3",
        questionNumber: 3,
        section: "Part 5 - Incomplete Sentences",
        prompt: "Please verify that all client invoices have been entered into the software system _____ before leaving today.",
        options: ["accuracy", "accurate", "accurately", "accurateness"],
        correctAnswerIndex: 2,
        explanationVi: 'C\u1EA7n tr\u1EA1ng t\u1EEB "accurately" \u0111\u1EC3 b\u1ED5 ngh\u0129a cho ph\xE2n t\u1EEB "have been entered".',
        category: "Adverbs"
      },
      {
        id: "t-toeic-4",
        questionNumber: 4,
        section: "Part 7 - Reading Comprehension",
        contextPassage: `MEMORANDUM
To: All Department Heads
From: Claire Vance, Operations Director
Date: October 12, 2026
Subject: System Maintenance & Cloud Migration

Please be advised that our central database servers will be undergoing scheduled maintenance this Saturday between 1:00 AM and 5:00 AM. During this four-hour maintenance window, employee portals and internal cloud storage will be temporarily inaccessible. 

We strongly urge all staff members to synchronize their local documents by 6:00 PM on Friday to prevent potential data discrepancies. The system is expected to be fully functional before normal business operations resume on Monday morning.`,
        prompt: "What are staff members advised to do before Friday evening?",
        options: [
          "Contact Claire Vance directly.",
          "Save and synchronize local documents.",
          "Work remotely over the weekend.",
          "Shut down physical office computers."
        ],
        correctAnswerIndex: 1,
        explanationVi: 'B\u1EA3n ghi nh\u1EDB ghi: "We strongly urge all staff members to synchronize their local documents by 6:00 PM on Friday".',
        category: "Text Comprehension"
      },
      {
        id: "t-toeic-5",
        questionNumber: 5,
        section: "Part 7 - Reading Comprehension",
        contextPassage: `(Refer to the memorandum above)`,
        prompt: 'In the memorandum, the word "discrepancies" is closest in meaning to:',
        options: ["improvements", "inconsistencies", "agreements", "expenditures"],
        correctAnswerIndex: 1,
        explanationVi: '"Discrepancies" ngh\u0129a l\xE0 s\u1EF1 sai l\u1EC7ch, b\u1EA5t nh\u1EA5t (= inconsistencies).',
        category: "Vocabulary in Context"
      },
      {
        id: "t-toeic-6",
        questionNumber: 6,
        section: "Part 5 - Incomplete Sentences",
        prompt: "Ms. Thornton was _____ selected to lead the newly formed regional expansion initiative.",
        options: ["unanimous", "unanimously", "unanimity", "unanimousness"],
        correctAnswerIndex: 1,
        explanationVi: '\u0110\u1EE9ng gi\u1EEFa to be "was" v\xE0 ph\xE2n t\u1EEB "selected" c\u1EA7n tr\u1EA1ng t\u1EEB "unanimously" (nh\u1EA5t tr\xED).',
        category: "Word Forms"
      },
      {
        id: "t-toeic-7",
        questionNumber: 7,
        section: "Part 5 - Incomplete Sentences",
        prompt: "The updated software security patch is _____ with all current company desktop models.",
        options: ["compatible", "competing", "comparable", "competent"],
        correctAnswerIndex: 0,
        explanationVi: 'C\u1EA5u tr\xFAc "compatible with" ngh\u0129a l\xE0 t\u01B0\u01A1ng th\xEDch v\u1EDBi.',
        category: "Lexical Collocations"
      },
      {
        id: "t-toeic-8",
        questionNumber: 8,
        section: "Part 5 - Incomplete Sentences",
        prompt: "Neither the accounting team nor the project supervisor _____ approved the emergency budget request.",
        options: ["has", "have", "having", "to have"],
        correctAnswerIndex: 0,
        explanationVi: 'Quy t\u1EAFc "Neither A nor B": \u0110\u1ED9ng t\u1EEB chia theo ch\u1EE7 ng\u1EEF g\u1EA7n nh\u1EA5t B (project supervisor, s\u1ED1 \xEDt -> has).',
        category: "Subject-Verb Agreement"
      }
    ]
  },
  {
    id: "test-ielts-academic-mock",
    title: "IELTS Academic Reading & Lexicon Mini-Mock",
    titleVi: "\u0110\u1EC1 Thi Th\u1EED IELTS Academic Reading & Ng\u1EEF Ph\xE1p",
    type: "full_ielts",
    durationMinutes: 20,
    totalQuestions: 6,
    targetLevel: "Band 7.0 - 8.5",
    descriptionVi: "M\xF4 ph\u1ECFng 100% c\u1EA5u tr\xFAc c\xE2u h\u1ECFi True/False/Not Given, tr\u1EAFc nghi\u1EC7m v\xE0 t\u1EEB v\u1EF1ng h\u1ECDc thu\u1EADt c\u1EE7a \u0111\u1EC1 thi IELTS th\u1EADt.",
    questions: [
      {
        id: "ielts-q-1",
        questionNumber: 1,
        section: "Reading Section 1",
        contextPassage: `The architectural transition toward sustainable urban design has intensified worldwide. Historically, metropolitan infrastructures prioritized vehicular convenience at the expense of ecological balance. Contemporary urban planners now advocate biophilic architecture\u2014a paradigm that seamlessly integrates flora and natural daylight into high-density residential towers. Empirical studies indicate that biophilic environments diminish occupational stress and foster mental resilience among residents.`,
        prompt: "According to the passage, historical urban designs prioritized:",
        options: [
          "Biophilic ecological balances.",
          "Vehicular convenience over ecological sustainability.",
          "Flora integration into office buildings.",
          "Solar daylight optimization."
        ],
        correctAnswerIndex: 1,
        explanationVi: 'B\xE0i \u0111\u1ECDc n\xEAu r\xF5: "Historically, metropolitan infrastructures prioritized vehicular convenience at the expense of ecological balance".',
        category: "Reading Comprehension"
      },
      {
        id: "ielts-q-2",
        questionNumber: 2,
        section: "Reading Section 1",
        contextPassage: `(Refer to the passage above)`,
        prompt: 'In the passage, the word "diminish" is closest in meaning to:',
        options: ["mitigate / reduce", "accelerate", "substantiate", "provoke"],
        correctAnswerIndex: 0,
        explanationVi: '"Diminish" \u0111\u1ED3ng ngh\u0129a v\u1EDBi "reduce" ho\u1EB7c "mitigate" (l\xE0m gi\u1EA3m nh\u1EB9).',
        category: "Lexical Resource"
      },
      {
        id: "ielts-q-3",
        questionNumber: 3,
        section: "Grammar & Syntax",
        prompt: "Not only _____ comprehensive research, but they also formulated groundbreaking environmental policies.",
        options: ["they conducted", "did they conduct", "they were conducting", "conducted they"],
        correctAnswerIndex: 1,
        explanationVi: 'C\u1EA5u tr\xFAc \u0111\u1EA3o ng\u1EEF "Not only + auxiliary (did) + subject (they) + main verb (conduct)...".',
        category: "Inversion"
      },
      {
        id: "ielts-q-4",
        questionNumber: 4,
        section: "Academic Collocations",
        prompt: "The technological innovation had a _____ impact on remote educational accessibility.",
        options: ["profound", "heavily", "sharply", "steeply"],
        correctAnswerIndex: 0,
        explanationVi: 'Collocation h\u1ECDc thu\u1EADt: "profound impact" (t\xE1c \u0111\u1ED9ng s\xE2u s\u1EAFc). C\u1EA7n t\xEDnh t\u1EEB tr\u01B0\u1EDBc danh t\u1EEB "impact".',
        category: "Academic Collocations"
      },
      {
        id: "ielts-q-5",
        questionNumber: 5,
        section: "Conditionals in Context",
        prompt: "Had the clinical trials been postponed, the vaccine _____ ready for distribution by winter.",
        options: ["would not be", "will not be", "would not have been", "had not been"],
        correctAnswerIndex: 2,
        explanationVi: '\u0110\u1EA3o ng\u1EEF c\xE2u \u0111i\u1EC1u ki\u1EC7n lo\u1EA1i 3 ("Had the trials been postponed" = If they had been...) -> V\u1EBF sau: would not have been.',
        category: "Conditionals"
      },
      {
        id: "ielts-q-6",
        questionNumber: 6,
        section: "Relative Clauses",
        prompt: "The renewable energy consortium, _____ headquarters are based in Geneva, announced a multilateral initiative.",
        options: ["which", "that", "whose", "where"],
        correctAnswerIndex: 2,
        explanationVi: '"Whose" l\xE0 \u0111\u1EA1i t\u1EEB quan h\u1EC7 ch\u1EC9 s\u1EDF h\u1EEFu (tr\u1EE5 s\u1EDF c\u1EE7a t\u1EADp \u0111o\xE0n = whose headquarters).',
        category: "Relative Clauses"
      }
    ]
  }
];

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
app.use(express.json({ limit: "500kb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-requested-with");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
var rateLimitMap = /* @__PURE__ */ new Map();
function rateLimitMiddleware(limit = 15, windowMs = 60 * 1e3) {
  return (req, res, next) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const bucket = rateLimitMap.get(ip);
    if (!bucket || now > bucket.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (bucket.count >= limit) {
      res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1e3));
      return res.status(429).json({
        error: "Too many requests. Please wait a moment before sending another message.",
        retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1e3)
      });
    }
    bucket.count += 1;
    next();
  };
}
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitMap.entries()) {
    if (now > bucket.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1e3);
var TRUSTED_ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || "htv200776@gmail.com,admin@lingopeak.edu.vn").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
);
async function verifyFirebaseToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY || "AIzaSyCPM8F0Q0Cm3bgo47DR7fefzlm2KXrCSDk"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token })
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    const userObj = data.users?.[0];
    if (!userObj || !userObj.localId) {
      return null;
    }
    const email = (userObj.email || "").toLowerCase();
    const isAdmin = TRUSTED_ADMIN_EMAILS.has(email);
    return {
      uid: userObj.localId,
      email: userObj.email,
      emailVerified: userObj.emailVerified,
      isAdmin
    };
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return null;
  }
}
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized: Missing or invalid Authorization header. A valid Bearer token is required."
    });
  }
  const token = authHeader.slice(7).trim();
  const user = await verifyFirebaseToken(token);
  if (!user) {
    return res.status(401).json({
      error: "Unauthorized: Invalid, expired, or rejected Firebase ID token."
    });
  }
  req.user = user;
  next();
}
async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized: Admin authentication token required."
    });
  }
  const token = authHeader.slice(7).trim();
  const user = await verifyFirebaseToken(token);
  if (!user) {
    return res.status(401).json({
      error: "Unauthorized: Invalid or expired credentials."
    });
  }
  if (!user.isAdmin) {
    return res.status(403).json({
      error: "Forbidden: Insufficient privileges. Only verified administrators may perform this action."
    });
  }
  req.user = user;
  next();
}
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}
async function generateContentWithRetry(ai, params, maxRetries = 2) {
  let lastError = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      lastError = err;
      const isTransient = err?.status === 503 || err?.status === 429 || err?.message?.includes("503") || err?.message?.includes("429") || err?.message?.includes("high demand") || err?.message?.includes("RESOURCE_EXHAUSTED");
      if (isTransient && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
var DATA_DIR = path.resolve(process.cwd(), "data");
var PERSISTENT_BANK_FILE = path.resolve(DATA_DIR, "persistentQuestionBank.json");
function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}
function loadPersistentQuestionBank() {
  ensureDataDirectory();
  try {
    if (fs.existsSync(PERSISTENT_BANK_FILE)) {
      const content = fs.readFileSync(PERSISTENT_BANK_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error loading persistent question bank, falling back to seed bank:", err);
  }
  savePersistentQuestionBank([...VERIFIED_QUESTION_BANK]);
  return [...VERIFIED_QUESTION_BANK];
}
function savePersistentQuestionBank(bank) {
  ensureDataDirectory();
  try {
    fs.writeFileSync(PERSISTENT_BANK_FILE, JSON.stringify(bank, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to persist question bank to disk:", err);
    return false;
  }
}
var activeQuestionBank = loadPersistentQuestionBank();
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    questionsInBank: activeQuestionBank.length
  });
});
app.get("/api/ai/status", (_req, res) => {
  const ai = getGeminiClient();
  res.json({
    configured: Boolean(ai),
    model: "gemini-3.8-flash",
    status: ai ? "ready" : "missing_api_key"
  });
});
app.get("/api/courses", (req, res) => {
  const { category, level } = req.query;
  let list = [...INITIAL_COURSES];
  if (category && category !== "All") {
    list = list.filter((c) => c.category === category);
  }
  if (level && level !== "All") {
    list = list.filter((c) => c.level === level);
  }
  res.json({
    total: list.length,
    courses: list
  });
});
app.get("/api/courses/:id", (req, res) => {
  const { id } = req.params;
  if (!id || typeof id !== "string" || id.length > 100) {
    return res.status(400).json({ error: "Invalid course ID format" });
  }
  const course = INITIAL_COURSES.find((c) => c.id === id);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  res.json(course);
});
var VALID_TUTOR_MODES = [
  "conversation",
  "grammar",
  "vocabulary",
  "writing",
  "speaking",
  "ielts",
  "toeic",
  "advisor"
];
var TUTOR_SYSTEM_INSTRUCTIONS = {
  conversation: (level) => `You are LingoPeak's AI Conversation Partner. The learner is a Vietnamese speaker with CEFR level ${level}. Have an authentic, engaging conversation. Naturally weave in feedback: gently point out any grammar or unnatural word choice, suggest 1-2 native alternatives, and provide brief Vietnamese explanations for nuanced concepts. Keep your tone encouraging and motivating.`,
  grammar: (level) => `You are LingoPeak's AI Grammar Specialist for a ${level} learner. Explain English grammar rules clearly with Vietnamese explanations and natural English examples. Highlight common pitfalls, contrast correct vs incorrect usages, and finish with a quick 1-question check exercise to verify understanding.`,
  vocabulary: (level) => `You are LingoPeak's AI Vocabulary Coach for a ${level} learner. Provide rich lexical items with IPA phonetic transcription, CEFR level, English definition, Vietnamese meaning, natural collocations, and example sentences in context.`,
  writing: (level) => `You are LingoPeak's AI Writing Mentor for a ${level} learner. Review submitted sentences, paragraphs, or essays. Offer constructive analysis across Grammar Range & Accuracy, Lexical Resource, Coherence, and Task Fulfillment. Provide a polished native version with clear rationales.`,
  speaking: (level) => `You are LingoPeak's AI Speaking Coach for a ${level} learner. Assist in spoken English fluency, intonation, connected speech, and conversational idioms. Provide model spoken answers and practical pronunciation tips.`,
  ielts: (level, exam) => `You are LingoPeak's Senior IELTS Master (Band 8.5+). Assess learner answers against official IELTS criteria (TR/CC/LR/GRA for writing; FC/LR/GRA/PR for speaking). Provide estimated band ranges, actionable Vietnamese advice, and Band 8.0+ model expressions. (Target: ${exam || "IELTS"}).`,
  toeic: (_level, exam) => `You are LingoPeak's TOEIC 990 Specialist. Guide the learner through Business English vocabulary, Part 5/6 grammatical traps, and Part 7 comprehension strategies with practical Vietnamese exam-taking tips. (Target: ${exam || "TOEIC 750+"}).`,
  advisor: (level, exam) => `You are LingoPeak's Personalized Study Plan Advisor. Help this Vietnamese learner (Level: ${level}, Goal: ${exam}) build an effective daily study plan, prioritize skill gaps, and maintain a consistent learning streak.`
};
function getTutorFallback(mode, lastUserMessage, prefixNotice) {
  const preview = lastUserMessage ? `"${lastUserMessage.slice(0, 50)}..."` : "ch\u1EE7 \u0111\u1EC1 c\u1EE7a b\u1EA1n";
  const header = `**[${prefixNotice}]**

`;
  const templates = {
    conversation: `${header}That's an interesting thought regarding ${preview}!

When discussing this in English, you can elevate your expression with idiomatic phrases like *"bear in mind"*, *"take into consideration"*, or *"come into play"*.

*G\u1EE3i \xFD ti\u1EBFng Vi\u1EC7t:* H\xE3y th\u1EED \u0111\u1EB7t m\u1ED9t c\xE2u ho\xE0n ch\u1EC9nh v\u1EDBi c\u1EE5m t\u1EEB g\u1EE3i \xFD tr\xEAn \u0111\u1EC3 m\xECnh ki\u1EC3m tra gi\xFAp b\u1EA1n nh\xE9!`,
    grammar: `${header}Ph\xE2n t\xEDch ng\u1EEF ph\xE1p cho c\xE2u h\u1ECFi: ${preview}

1. **Quy t\u1EAFc c\u1ED1t l\xF5i:** Lu\xF4n x\xE1c \u0111\u1ECBnh r\xF5 th\xEC (Tense), s\u1EF1 h\xF2a h\u1EE3p Ch\u1EE7 ng\u1EEF - \u0110\u1ED9ng t\u1EEB (Subject-Verb Agreement), v\xE0 v\u1ECB tr\xED c\u1EE7a tr\u1EA1ng t\u1EEB.
2. **V\xED d\u1EE5 tham kh\u1EA3o:** *"Not only did she finish the test on time, but she also scored 8.0."* (\u0110\u1EA3o ng\u1EEF - Inversion).

*G\u1EE3i \xFD ti\u1EBFng Vi\u1EC7t:* H\xE3y vi\u1EBFt l\u1EA1i c\xE2u c\u1EE7a b\u1EA1n v\xE0 th\u1EED \xE1p d\u1EE5ng c\u1EA5u tr\xFAc c\xE2u ph\u1EE9c gh\xE9p nh\xE9!`,
    vocabulary: `${header}B\u1ED9 t\u1EEB v\u1EF1ng g\u1EE3i \xFD li\xEAn quan \u0111\u1EBFn ${preview}:
- **Substantial** (/s\u0259b\u02C8st\xE6n\u0283l/ - adj): \u0110\xE1ng k\u1EC3, c\xF3 gi\xE1 tr\u1ECB l\u1EDBn.
- **Comprehensive** (/\u02CCk\u0252mpr\u026A\u02C8hens\u026Av/ - adj): To\xE0n di\u1EC7n, bao qu\xE1t.
- **Facilitate** (/f\u0259\u02C8s\u026Al\u026Ate\u026At/ - v): T\u1EA1o \u0111i\u1EC1u ki\u1EC7n thu\u1EADn l\u1EE3i.

*V\xED d\u1EE5:* "Modern technology facilitates distance learning."`,
    writing: `${header}Nh\u1EADn x\xE9t vi\u1EBFt cho ${preview}:
- **C\u1EA5u tr\xFAc:** S\u1EED d\u1EE5ng c\xE1c li\xEAn t\u1EEB chuy\u1EC3n \xFD r\xF5 r\xE0ng (*Furthermore, Consequently, In contrast*).
- **T\u1EEB v\u1EF1ng:** H\u1EA1n ch\u1EBF l\u1EB7p l\u1EA1i c\xE1c t\u1EEB c\u01A1 b\u1EA3n nh\u01B0 *good, bad, important*.
- **G\u1EE3i \xFD:** H\xE3y tri\u1EC3n khai \u0111o\u1EA1n v\u0103n theo m\xF4 h\xECnh PEEL (Point - Explanation - Example - Link).`,
    speaking: `${header}Chi\u1EBFn thu\u1EADt luy\u1EC7n n\xF3i cho ${preview}:
- **Ng\u1EEF \u0111i\u1EC7u:** L\xEAn gi\u1ECDng nh\u1EB9 \u1EDF c\xE2u h\u1ECFi Yes/No v\xE0 xu\u1ED1ng gi\u1ECDng \u1EDF cu\u1ED1i c\xE2u tr\u1EA7n thu\u1EADt.
- **Collocation t\u1EF1 nhi\xEAn:** *"To be honest with you"*, *"As far as I'm concerned"*.
- **M\u1EB9o:** Ghi \xE2m l\u1EA1i 60 gi\xE2y n\xF3i t\u1EF1 do v\xE0 nghe l\u1EA1i \u0111\u1EC3 ki\u1EC3m tra n\u1ED1i \xE2m (linking sounds).`,
    ielts: `${header}T\u01B0 v\u1EA5n ti\xEAu ch\xED IELTS cho ${preview}:
- **Lexical Resource:** C\u1EA7n \u0111\u01B0a v\xE0o t\u1EEB v\u1EF1ng h\u1ECDc thu\u1EADt C1/C2 c\xF3 collocation ch\xEDnh x\xE1c.
- **Grammatical Range:** K\u1EBFt h\u1EE3p c\xE2u \u0111i\u1EC1u ki\u1EC7n, m\u1EC7nh \u0111\u1EC1 quan h\u1EC7 r\xFAt g\u1ECDn ho\u1EB7c \u0111\u1EA3o ng\u1EEF.
- **Task Response:** M\u1ED7i lu\u1EADn \u0111i\u1EC3m c\u1EA7n c\xF3 \xEDt nh\u1EA5t 1 d\u1EABn ch\u1EE9ng ho\u1EB7c gi\u1EA3i th\xEDch c\u1EE5 th\u1EC3.`,
    toeic: `${header}Chi\u1EBFn thu\u1EADt TOEIC c\xF4ng s\u1EDF cho ${preview}:
- **Part 5:** Nh\u1EADn di\u1EC7n nhanh v\u1ECB tr\xED t\u1EEB lo\u1EA1i (Noun \u0111\u1EE9ng sau T\xEDnh t\u1EEB/S\u1EDF h\u1EEFu c\xE1ch; Adverb b\u1ED5 ngh\u0129a cho \u0110\u1ED9ng t\u1EEB/T\xEDnh t\u1EEB).
- **C\u1EE5m t\u1EEB then ch\u1ED1t:** *"in accordance with"*, *"prior to departure"*, *"designated parking area"*.
- **M\u1EB9o:** \u0110\u1ECDc l\u01B0\u1EDBt 4 \u0111\xE1p \xE1n tr\u01B0\u1EDBc \u0111\u1EC3 x\xE1c \u0111\u1ECBnh c\xE2u h\u1ECFi ng\u1EEF ph\xE1p hay t\u1EEB v\u1EF1ng.`,
    advisor: `${header}L\u1ED9 tr\xECnh h\u1ECDc t\u1EADp \u0111\u1EC1 xu\u1EA5t cho ${preview}:
- **S\xE1ng (15 ph\xFAt):** \xD4n t\u1EADp 10-15 th\u1EBB t\u1EEB v\u1EF1ng v\u1EDBi Spaced Repetition tr\xEAn LingoPeak.
- **Chi\u1EC1u (25 ph\xFAt):** Ho\xE0n th\xE0nh 1 b\xE0i h\u1ECDc Ng\u1EEF ph\xE1p ho\u1EB7c 1 b\xE0i Mini-Test TOEIC/IELTS.
- **T\u1ED1i (15 ph\xFAt):** Th\u1EF1c h\xE0nh vi\u1EBFt \u0111o\u1EA1n v\u0103n ng\u1EAFn ho\u1EB7c tr\xF2 chuy\u1EC7n c\xF9ng AI Tutor.`
  };
  return templates[mode] || templates.conversation;
}
app.post("/api/ai/chat", rateLimitMiddleware(20, 60 * 1e3), async (req, res) => {
  const { mode = "conversation", messages, userLevel = "B1", targetExam = "IELTS" } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: 'Invalid request: "messages" must be a non-empty array',
      isFallback: true
    });
  }
  if (messages.length > 25) {
    return res.status(400).json({
      error: "Invalid request: Exceeded maximum allowed message history (max 25 messages)",
      isFallback: true
    });
  }
  const selectedMode = VALID_TUTOR_MODES.includes(mode) ? mode : "conversation";
  const cleanLevel = typeof userLevel === "string" ? userLevel.slice(0, 10) : "B1";
  const cleanExam = typeof targetExam === "string" ? targetExam.slice(0, 20) : "IELTS";
  const recentMessages = messages.slice(-10).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    content: typeof m.content === "string" ? m.content.slice(0, 2e3) : ""
  }));
  const lastUserMessage = recentMessages[recentMessages.length - 1]?.content || "";
  const ai = getGeminiClient();
  if (!ai) {
    const fallbackNotice = "Ch\u1EBF \u0111\u1ED9 Demo - Ch\u01B0a c\u1EA5u h\xECnh GEMINI_API_KEY";
    return res.json({
      content: getTutorFallback(selectedMode, lastUserMessage, fallbackNotice),
      isFallback: true,
      provider: "offline-rule-based"
    });
  }
  try {
    const systemPrompt = TUTOR_SYSTEM_INSTRUCTIONS[selectedMode](cleanLevel, cleanExam);
    const contents = recentMessages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));
    const timeoutPromise = new Promise(
      (_, reject) => setTimeout(() => reject(new Error("AI request timed out")), 25e3)
    );
    const generatePromise = generateContentWithRetry(ai, {
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7
      }
    });
    const response = await Promise.race([generatePromise, timeoutPromise]);
    const replyText = response.text || "I apologize, but I could not generate a response. Please try again.";
    res.json({
      content: replyText,
      isFallback: false,
      provider: "gemini-3.8-flash"
    });
  } catch (error) {
    console.error("Error in AI chat endpoint:", error?.status || error?.message);
    const isRateLimited = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED");
    const isOverloaded = error?.status === 503 || error?.message?.includes("503") || error?.message?.includes("high demand");
    const isTimeout = error?.message?.includes("timed out");
    let prefix = "Th\xF4ng b\xE1o: K\u1EBFt n\u1ED1i Gemini AI t\u1EA1m gi\xE1n \u0111o\u1EA1n - \u0110ang hi\u1EC3n th\u1ECB ph\u1EA3n h\u1ED3i m\u1EABu";
    if (isRateLimited) {
      prefix = "H\u1EC7 th\u1ED1ng AI \u0111\u1EA1t gi\u1EDBi h\u1EA1n t\u1EA7n su\u1EA5t (Rate Limit 429) - \u0110ang chuy\u1EC3n sang ph\u1EA3n h\u1ED3i d\u1EF1 ph\xF2ng";
    } else if (isOverloaded) {
      prefix = "H\u1EC7 th\u1ED1ng AI \u0111ang qu\xE1 t\u1EA3i t\u1EA1m th\u1EDDi (503 High Demand) - \u0110ang chuy\u1EC3n sang ph\u1EA3n h\u1ED3i d\u1EF1 ph\xF2ng";
    } else if (isTimeout) {
      prefix = "Y\xEAu c\u1EA7u AI qu\xE1 th\u1EDDi gian ch\u1EDD (Timeout) - \u0110ang chuy\u1EC3n sang ph\u1EA3n h\u1ED3i d\u1EF1 ph\xF2ng";
    }
    const reply = getTutorFallback(selectedMode, lastUserMessage, prefix);
    res.json({
      content: reply,
      isFallback: true,
      provider: "offline-rule-based",
      error: "AI service temporarily unavailable; fallback provided"
    });
  }
});
app.post("/api/ai/writing-feedback", rateLimitMiddleware(15, 60 * 1e3), async (req, res) => {
  const { text, prompt, taskType = "essay", targetBand = "7.0" } = req.body;
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({
      error: 'Invalid request: "text" must be a non-empty string',
      isFallback: true
    });
  }
  if (text.length > 8e3) {
    return res.status(400).json({
      error: "Text length exceeds maximum allowed limit of 8000 characters",
      isFallback: true
    });
  }
  const cleanText = text.trim().slice(0, 5e3);
  const cleanPrompt = typeof prompt === "string" ? prompt.slice(0, 500) : "General writing";
  const cleanTaskType = typeof taskType === "string" ? taskType.slice(0, 50) : "essay";
  const cleanTargetBand = typeof targetBand === "string" ? targetBand.slice(0, 10) : "7.0";
  const wordCount = cleanText.split(/\s+/).length;
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      estimatedScore: wordCount >= 150 ? "6.0 - 6.5 (Offline rule-based)" : "5.0 - 5.5 (Offline rule-based)",
      wordCount,
      summary: "B\xE0i vi\u1EBFt c\xF3 b\u1ED1 c\u1EE5c c\u01A1 b\u1EA3n. (L\u01B0u \xFD: \u0110ang ch\u1EA1y ch\u1EBF \u0111\u1ED9 \u0111\xE1nh gi\xE1 m\u1EABu do ch\u01B0a c\u1EA5u h\xECnh GEMINI_API_KEY).",
      grammarFeedback: [
        "Ki\u1EC3m tra l\u1EA1i s\u1EF1 th\u1ED1ng nh\u1EA5t v\u1EC1 th\xEC (Tense consistency) gi\u1EEFa c\xE1c \u0111o\u1EA1n v\u0103n.",
        'H\u1EA1n ch\u1EBF l\u1EB7p l\u1EA1i t\u1EEB \u0111\u01A1n gi\u1EA3n nh\u01B0 "good", "bad", "people".'
      ],
      vocabularyFeedback: [
        'N\xEAn b\u1ED5 sung c\xE1c li\xEAn t\u1EEB h\u1ECDc thu\u1EADt: "Furthermore", "In contrast", "Consequently".',
        'Thay th\u1EBF c\u1EE5m "I think" b\u1EB1ng "From my perspective" ho\u1EB7c "It is argued that".'
      ],
      coherenceFeedback: "\xDD t\u01B0\u1EDFng \u0111\u01B0\u1EE3c s\u1EAFp x\u1EBFp logic. \u0110\u1EA3m b\u1EA3o m\u1ED7i \u0111o\u1EA1n c\xF3 c\xE2u topic sentence r\xF5 r\xE0ng.",
      improvedExcerpt: cleanText.length > 50 ? `${cleanText.slice(0, 120)}...` : "",
      isFallback: true
    });
  }
  try {
    const promptText = `Evaluate the following English writing submission for a Vietnamese learner.
Task Type: ${cleanTaskType}
Prompt: ${cleanPrompt}
Target Score / Band: ${cleanTargetBand}

User Submission:
"${cleanText}"

Provide a JSON object response with these exact keys:
{
  "estimatedScore": "string (e.g. 6.5 or 85/100)",
  "wordCount": number,
  "summary": "string (b\u1EB1ng ti\u1EBFng Vi\u1EC7t)",
  "grammarFeedback": ["list of specific grammar points in Vietnamese"],
  "vocabularyFeedback": ["list of lexical upgrade suggestions in Vietnamese"],
  "coherenceFeedback": "string in Vietnamese",
  "improvedExcerpt": "string showing improved version of a key paragraph"
}`;
    const timeoutPromise = new Promise(
      (_, reject) => setTimeout(() => reject(new Error("Writing assessment timed out")), 25e3)
    );
    const generatePromise = generateContentWithRetry(ai, {
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json"
      }
    });
    const response = await Promise.race([generatePromise, timeoutPromise]);
    const rawText = (response.text || "{}").replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(rawText);
    res.json({
      estimatedScore: String(parsed.estimatedScore || "6.0"),
      wordCount: typeof parsed.wordCount === "number" ? parsed.wordCount : wordCount,
      summary: String(parsed.summary || "B\xE0i vi\u1EBFt \u0111\xE3 \u0111\u01B0\u1EE3c \u0111\xE1nh gi\xE1 th\xE0nh c\xF4ng."),
      grammarFeedback: Array.isArray(parsed.grammarFeedback) ? parsed.grammarFeedback : ["Ng\u1EEF ph\xE1p t\u1ED5ng quan \u0111\u1EA1t y\xEAu c\u1EA7u."],
      vocabularyFeedback: Array.isArray(parsed.vocabularyFeedback) ? parsed.vocabularyFeedback : ["T\u1EEB v\u1EF1ng \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng ph\xF9 h\u1EE3p."],
      coherenceFeedback: String(parsed.coherenceFeedback || "B\xE0i vi\u1EBFt c\xF3 li\xEAn k\u1EBFt t\u1ED1t."),
      improvedExcerpt: String(parsed.improvedExcerpt || cleanText.slice(0, 100)),
      isFallback: false
    });
  } catch (error) {
    console.error("Error assessing writing:", error?.status || error?.message);
    res.json({
      estimatedScore: wordCount >= 150 ? "6.0 - 6.5 (\u01AF\u1EDBc t\xEDnh d\u1EF1 ph\xF2ng)" : "5.0 - 5.5 (\u01AF\u1EDBc t\xEDnh d\u1EF1 ph\xF2ng)",
      wordCount,
      summary: "B\xE0i vi\u1EBFt c\xF3 b\u1ED1 c\u1EE5c t\u1ED1t. (\u0110ang hi\u1EC3n th\u1ECB \u0111\xE1nh gi\xE1 d\u1EF1 ph\xF2ng do k\u1EBFt n\u1ED1i AI t\u1EA1m gi\xE1n \u0111o\u1EA1n).",
      grammarFeedback: ["Ki\u1EC3m tra l\u1EA1i s\u1EF1 th\u1ED1ng nh\u1EA5t v\u1EC1 th\xEC (Tense consistency) gi\u1EEFa c\xE1c \u0111o\u1EA1n v\u0103n."],
      vocabularyFeedback: ['N\xEAn b\u1ED5 sung c\xE1c li\xEAn t\u1EEB h\u1ECDc thu\u1EADt: "Furthermore", "In contrast", "Consequently".'],
      coherenceFeedback: "\xDD t\u01B0\u1EDFng \u0111\u01B0\u1EE3c s\u1EAFp x\u1EBFp logic.",
      improvedExcerpt: cleanText.length > 50 ? `${cleanText.slice(0, 100)}...` : "",
      isFallback: true
    });
  }
});
app.get("/api/questions", async (req, res) => {
  const { status, skill, level, sourceCategory, query } = req.query;
  let isAdmin = false;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const user = await verifyFirebaseToken(authHeader.slice(7).trim());
    if (user && user.isAdmin) {
      isAdmin = true;
    }
  }
  let filtered = [...activeQuestionBank];
  if (!isAdmin) {
    filtered = filtered.filter((q) => q.review?.status === "approved");
  } else if (status && status !== "all") {
    filtered = filtered.filter((q) => q.review?.status === status);
  }
  if (skill) {
    filtered = filtered.filter((q) => q.skill === skill);
  }
  if (level) {
    filtered = filtered.filter((q) => q.cefr === level);
  }
  if (sourceCategory) {
    filtered = filtered.filter((q) => q.source?.category === sourceCategory);
  }
  if (query && typeof query === "string") {
    const qLower = query.toLowerCase();
    filtered = filtered.filter(
      (q) => q.prompt.toLowerCase().includes(qLower) || q.id.toLowerCase().includes(qLower) || q.explanationVi && q.explanationVi.toLowerCase().includes(qLower)
    );
  }
  res.json({
    total: filtered.length,
    questions: filtered,
    meta: {
      totalInBank: activeQuestionBank.length,
      approvedCount: activeQuestionBank.filter((q) => q.review?.status === "approved").length,
      pendingCount: activeQuestionBank.filter((q) => q.review?.status === "pending_review").length,
      needsReviewCount: activeQuestionBank.filter((q) => q.review?.status === "needs_human_review").length,
      rejectedCount: activeQuestionBank.filter((q) => q.review?.status === "rejected").length
    }
  });
});
app.post("/api/questions/validate", (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions)) {
    return res.status(400).json({ error: "Body must contain a questions array." });
  }
  if (questions.length > 500) {
    return res.status(400).json({ error: "Batch size exceeds maximum limit of 500 items." });
  }
  const report = validateQuestionBatch(questions, activeQuestionBank);
  res.json(report);
});
app.post("/api/questions/ingest", requireAdmin, (req, res) => {
  const { questions, defaultStatus = "pending_review", reviewerNotes } = req.body;
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: "Body must contain a non-empty questions array." });
  }
  if (questions.length > 200) {
    return res.status(400).json({ error: "Exceeded maximum batch ingestion limit (max 200 questions)." });
  }
  const validInitialStatuses = ["draft", "pending_review", "needs_human_review", "approved"];
  if (!validInitialStatuses.includes(defaultStatus)) {
    return res.status(400).json({
      error: `Invalid defaultStatus '${defaultStatus}'. Allowed: ${validInitialStatuses.join(", ")}`
    });
  }
  const report = validateQuestionBatch(questions, activeQuestionBank);
  if (report.invalidCount > 0) {
    return res.status(422).json({
      error: `Validation failed: ${report.invalidCount} question(s) contain structural errors.`,
      report
    });
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const ingested = [];
  const adminEmail = req.user?.email || "admin@lingopeak.edu.vn";
  questions.forEach((incoming) => {
    const existingIndex = activeQuestionBank.findIndex((q) => q.id === incoming.id);
    const questionToSave = {
      ...incoming,
      metadata: {
        createdAt: incoming.metadata?.createdAt || now,
        updatedAt: now,
        isProductionReady: defaultStatus === "approved"
      },
      review: {
        status: defaultStatus,
        reviewerId: req.user?.uid || "admin-user",
        reviewerName: adminEmail,
        reviewedAt: now,
        reviewNotes: reviewerNotes || incoming.review?.reviewNotes || `Ingested by admin ${adminEmail}`,
        aiValidationPassed: incoming.review?.aiValidationPassed ?? false
      }
    };
    if (existingIndex >= 0) {
      activeQuestionBank[existingIndex] = questionToSave;
    } else {
      activeQuestionBank.push(questionToSave);
    }
    ingested.push(questionToSave);
  });
  savePersistentQuestionBank(activeQuestionBank);
  res.json({
    message: `Successfully ingested ${ingested.length} question(s).`,
    ingestedCount: ingested.length,
    status: defaultStatus,
    meta: {
      totalInBank: activeQuestionBank.length,
      approvedCount: activeQuestionBank.filter((q) => q.review?.status === "approved").length
    }
  });
});
app.patch("/api/questions/:id/review", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status, reviewNotes } = req.body;
  const validStatuses = ["draft", "pending_review", "needs_human_review", "approved", "rejected"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }
  const question = activeQuestionBank.find((q) => q.id === id);
  if (!question) {
    return res.status(404).json({ error: `Question with id '${id}' not found.` });
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const adminEmail = req.user?.email || "admin@lingopeak.edu.vn";
  question.review = {
    ...question.review,
    status,
    reviewerId: req.user?.uid || "admin-reviewer",
    reviewerName: adminEmail,
    reviewedAt: now,
    reviewNotes: reviewNotes || question.review?.reviewNotes || `Status updated to ${status} by ${adminEmail}`
  };
  if (question.metadata) {
    question.metadata.updatedAt = now;
    question.metadata.isProductionReady = status === "approved";
  }
  savePersistentQuestionBank(activeQuestionBank);
  res.json({
    message: `Question '${id}' review status updated to '${status}'.`,
    question
  });
});
app.post("/api/questions/ai-review", rateLimitMiddleware(20, 60 * 1e3), async (req, res) => {
  const { question } = req.body;
  if (!question || typeof question.prompt !== "string" || !Array.isArray(question.options)) {
    return res.status(400).json({ error: "Valid question with prompt string and options array is required." });
  }
  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({
      evaluationStatus: "evaluation_failed",
      aiValidationPassed: false,
      error: "GEMINI_API_KEY is not configured on the server.",
      messageVi: "D\u1ECBch v\u1EE5 AI Review hi\u1EC7n kh\xF4ng kh\u1EA3 d\u1EE5ng do thi\u1EBFu c\u1EA5u h\xECnh API Key. C\xE2u h\u1ECFi c\u1EA7n \u0111\u01B0\u1EE3c th\u1EA9m \u0111\u1ECBnh th\u1EE7 c\xF4ng b\u1EDFi chuy\xEAn gia.",
      disclaimer: "H\u1EC7 th\u1ED1ng b\u1EA3o \u0111\u1EA3m t\xEDnh to\xE0n v\u1EB9n: Kh\xF4ng t\u1EF1 \u0111\u1ED9ng t\u1EA1o \u0111i\u1EC3m s\u1ED1 gi\u1EA3 ho\u1EB7c ph\xEA duy\u1EC7t c\xE2u h\u1ECFi khi thi\u1EBFu k\u1EBFt n\u1ED1i AI."
    });
  }
  try {
    const prompt = `You are a Senior English Language Assessment Specialist reviewing a multiple-choice question for LingoPeak.
Evaluate this question thoroughly:
- Prompt: "${question.prompt.slice(0, 1e3)}"
- Options: ${JSON.stringify(question.options.slice(0, 6))}
- Declared Correct Index: ${question.correctAnswerIndex} (Option: "${question.options[question.correctAnswerIndex] || ""}")
- Vietnamese Explanation: "${(question.explanationVi || "None provided").slice(0, 1e3)}"
- Declared CEFR Level: "${question.cefr || "Not specified"}"
- Declared Skill: "${question.skill || "grammar"}"

Return a JSON object with:
{
  "aiValidationPassed": boolean (true if answer is clearly defensible and distractors plausible),
  "pedagogicalScore": number (0 to 100),
  "answerDefensible": boolean,
  "defensibleReason": "string in Vietnamese",
  "distractorQuality": "high" | "acceptable" | "poor",
  "distractorCritique": "string in Vietnamese",
  "explanationQuality": "accurate" | "needs_refinement",
  "suggestedImprovementVi": "string in Vietnamese",
  "estimatedCEFR": "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
}`;
    const timeoutPromise = new Promise(
      (_, reject) => setTimeout(() => reject(new Error("AI question review timed out")), 25e3)
    );
    const generatePromise = generateContentWithRetry(ai, {
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const response = await Promise.race([generatePromise, timeoutPromise]);
    const raw = (response.text || "{}").replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(raw);
    res.json({
      evaluationStatus: parsed.aiValidationPassed ? "evaluated_pass" : "evaluated_concerns",
      ...parsed,
      disclaimer: "L\u01B0u \xFD: \u0110\xE1nh gi\xE1 b\u1EB1ng AI ch\u1EC9 mang t\xEDnh h\u1ED7 tr\u1EE3 ki\u1EC3m tra ng\u1EEF li\u1EC7u v\xE0 ph\xE1t hi\u1EC7n l\u1ED7i. Ph\xEA duy\u1EC7t ch\xEDnh th\u1EE9c b\u1EAFt bu\u1ED9c ph\u1EA3i c\xF3 ch\u1EEF k\xFD th\u1EA9m \u0111\u1ECBnh t\u1EEB h\u1ED9i \u0111\u1ED3ng kh\u1EA3o th\xED."
    });
  } catch (err) {
    console.error("Error during AI question review:", err?.status || err?.message);
    res.status(502).json({
      evaluationStatus: "evaluation_failed",
      aiValidationPassed: false,
      error: "AI assessment service temporarily unavailable or timed out.",
      messageVi: 'D\u1ECBch v\u1EE5 AI t\u1EA1m th\u1EDDi kh\xF4ng ph\u1EA3n h\u1ED3i. C\xE2u h\u1ECFi \u0111\u01B0\u1EE3c \u0111\xE1nh d\u1EA5u l\xE0 "C\u1EA7n th\u1EA9m \u0111\u1ECBnh th\u1EE7 c\xF4ng" (needs_human_review).',
      disclaimer: "H\u1EC7 th\u1ED1ng b\u1EA3o \u0111\u1EA3m t\xEDnh to\xE0n v\u1EB9n: Kh\xF4ng bao gi\u1EDD c\u1EA5p \u0111i\u1EC3m s\u1ED1 gi\u1EA3 ho\u1EB7c t\u1EF1 \u0111\u1ED9ng \u0111\xE1nh d\u1EA5u \u0111\u1EA1t khi c\xF3 l\u1ED7i m\u1EA1ng."
    });
  }
});
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LingoPeak hardened server running on http://0.0.0.0:${PORT}`);
  });
}
if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
  });
}
export {
  app,
  requireAdmin,
  requireAuth,
  verifyFirebaseToken
};
