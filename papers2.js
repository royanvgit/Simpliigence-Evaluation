/* =====================================================================
   ADDITIONAL PAPERS  —  Paper C and Paper D for each language
   ---------------------------------------------------------------------
   No new questions are defined here. These papers reuse the existing
   banks in questions.js and simply give you more links to hand out.

   How the mixing actually works now:
     * The multiple-choice questions are already mixed PER CANDIDATE.
       With CONFIG.randomMcqPerCandidate = true, every candidate who
       opens any link gets a freshly drawn random set of CONFIG.mcqCount
       questions from that language's bank (60+ available), following
       CONFIG.mcqMix for difficulty, with the question order and the
       option order shuffled as well. Two candidates on the SAME link
       therefore sit different papers.
     * What differs between the links below is the set of PROGRAMMING
       questions, which is fixed per paper.

   Programming questions here are restricted to STRING and PATTERN
   programs only:
     string  : standalone, nonrepeat, longestgroup, anagram
     pattern : pascal, numpyramid, starcenter, starleft, primetriangle

   `seed` is only used as a fallback if you ever set
   CONFIG.randomMcqPerCandidate = false, which makes each link draw one
   fixed question set instead of randomising per candidate.

   This file is loaded after questions.js, so PAPERS already exists.
   ===================================================================== */
Object.assign(PAPERS, {
  // ---------------- C ----------------
  "c-c": {
    lang: "c", label: "C – Paper C", shuffle: true, seed: 113,
    coding: ["standalone", "longestgroup", "starleft", "primetriangle"]
  },
  "c-d": {
    lang: "c", label: "C – Paper D", shuffle: true, seed: 511,
    coding: ["nonrepeat", "anagram", "pascal", "starcenter"]
  },

  // ---------------- C++ ----------------
  "cpp-c": {
    lang: "cpp", label: "C++ – Paper C", shuffle: true, seed: 107,
    coding: ["longestgroup", "anagram", "numpyramid", "starleft"]
  },
  "cpp-d": {
    lang: "cpp", label: "C++ – Paper D", shuffle: true, seed: 427,
    coding: ["standalone", "nonrepeat", "primetriangle", "pascal"]
  },

  // ---------------- Python ----------------
  "python-c": {
    lang: "python", label: "Python – Paper C", shuffle: true, seed: 107,
    coding: ["nonrepeat", "longestgroup", "starcenter", "starleft"]
  },
  "python-d": {
    lang: "python", label: "Python – Paper D", shuffle: true, seed: 425,
    coding: ["standalone", "anagram", "pascal", "numpyramid"]
  },

  // ---------------- Java ----------------
  "java-c": {
    lang: "java", label: "Java – Paper C", shuffle: true, seed: 118,
    coding: ["anagram", "standalone", "numpyramid", "pascal"]
  },
  "java-d": {
    lang: "java", label: "Java – Paper D", shuffle: true, seed: 402,
    coding: ["longestgroup", "nonrepeat", "starcenter", "primetriangle"]
  }
});
