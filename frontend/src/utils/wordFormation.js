/**
 * Build the word formation display from the Word model
 * Shows morphemes separated by hyphens: pred-postav-ka
 * Returns object with text and koncnica position for coloring
 */
export function buildWordFormation(wordData) {
  if (!wordData) return { text: null, koncnicaStart: -1 };

  // If it's not a tvorjenka, just return the word
  if (
    !wordData.tvorjenka ||
    (wordData.postopek && wordData.postopek.includes("netvorjenka"))
  ) {
    return { text: wordData.beseda, koncnicaStart: -1 };
  }

  const koncnica = wordData.slovnicno?.koncnica;

  // Use morfemi structure (universal for all word types)
  if (wordData.morfemi && wordData.morfemi.length > 0) {
    // Sort morfemi by pozicija
    const sortedMorfemi = [...wordData.morfemi].sort(
      (a, b) => a.pozicija - b.pozicija,
    );

    // Build word from morfemi values
    const parts = sortedMorfemi.map((m) => m.vrednost);
    let formattedWord = parts.join("-");

    let koncnicaStart = -1;

    // Handle koncnica
    if (!koncnica || koncnica === "∅" || koncnica === "ø") {
      // No koncnica or empty koncnica - add -ø at the end
      koncnicaStart = formattedWord.length + (formattedWord ? 1 : 0);
      formattedWord += "-ø";
    } else {
      // Koncnica exists - it should be part of the word already
      const koncnicaLength = koncnica.length;
      const wordWithoutHyphens = formattedWord.replace(/-/g, "");

      if (wordWithoutHyphens.endsWith(koncnica)) {
        koncnicaStart = formattedWord.length - koncnicaLength;
      }
    }

    return { text: formattedWord, koncnicaStart };
  }

  // Fallback to just the word if no morfemi
  return { text: wordData.beseda, koncnicaStart: -1 };
}

/**
 * Simplified version for StatsModal that only returns the formatted string
 */
export function buildWordFormationSimple(word) {
  if (
    !word.tvorjenka ||
    (word.postopek && word.postopek.includes("netvorjenka"))
  ) {
    return word.beseda;
  }

  const koncnica = word.slovnicno?.koncnica;

  // Use morfemi structure (universal for all word types)
  if (word.morfemi && word.morfemi.length > 0) {
    // Sort morfemi by pozicija
    const sortedMorfemi = [...word.morfemi].sort(
      (a, b) => a.pozicija - b.pozicija,
    );

    // Build word from morfemi values
    const parts = sortedMorfemi.map((m) => m.vrednost);
    let formattedWord = parts.join("-");

    if (!koncnica || koncnica === "∅" || koncnica === "ø") {
      formattedWord += "-ø";
    }

    return formattedWord;
  }

  return word.beseda;
}
