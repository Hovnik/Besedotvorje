/**
 * Build the word formation display from the Word model
 * Shows morphemes separated by hyphens: pred-postav-ka
 * Returns object with text and koncnica position for coloring
 */
export function buildWordFormation(wordData) {
  if (!wordData) return { text: null, koncnicaStart: -1 };

  // If it's not a tvorjenka, just return the word
  if (!wordData.tvorjenka || wordData.postopek === "netvorjenka") {
    return { text: wordData.beseda, koncnicaStart: -1 };
  }

  const parts = [];
  let koncnicaStart = -1;
  const koncnica = wordData.slovnicno?.koncnica;

  if (wordData.postopek === "izpeljava") {
    // Add predpone (prefixes)
    if (wordData.predpone && wordData.predpone.length > 0) {
      parts.push(...wordData.predpone);
    }

    // Add osnova (base)
    if (wordData.osnova) {
      parts.push(wordData.osnova);
    }

    // Add pripone (suffixes)
    if (wordData.pripone && wordData.pripone.length > 0) {
      parts.push(...wordData.pripone);
    }

    // Build the word from parts
    let formattedWord = parts.filter((p) => p).join("-");

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

  if (wordData.postopek === "zlaganje") {
    // Add osnove (compound bases)
    if (wordData.osnove && wordData.osnove.length > 0) {
      parts.push(...wordData.osnove);
    }

    // Build the word from parts
    let formattedWord = parts.filter((p) => p).join("-");

    // Handle koncnica
    if (!koncnica || koncnica === "∅" || koncnica === "ø") {
      // No koncnica or empty koncnica - add -ø at the end
      koncnicaStart = formattedWord.length + (formattedWord ? 1 : 0);
      formattedWord += "-ø";
    } else {
      // Koncnica exists
      const koncnicaLength = koncnica.length;
      const wordWithoutHyphens = formattedWord.replace(/-/g, "");

      if (wordWithoutHyphens.endsWith(koncnica)) {
        koncnicaStart = formattedWord.length - koncnicaLength;
      }
    }

    return { text: formattedWord, koncnicaStart };
  }

  return { text: wordData.beseda, koncnicaStart: -1 };
}

/**
 * Simplified version for StatsModal that only returns the formatted string
 */
export function buildWordFormationSimple(word) {
  if (!word.tvorjenka || word.postopek === "netvorjenka") {
    return word.beseda;
  }

  const parts = [];
  const koncnica = word.slovnicno?.koncnica;

  if (word.postopek === "izpeljava") {
    if (word.predpone && word.predpone.length > 0) {
      parts.push(...word.predpone);
    }
    if (word.osnova) {
      parts.push(word.osnova);
    }
    if (word.pripone && word.pripone.length > 0) {
      parts.push(...word.pripone);
    }

    let formattedWord = parts.filter((p) => p).join("-");

    if (!koncnica || koncnica === "∅" || koncnica === "ø") {
      formattedWord += "-ø";
    }

    return formattedWord;
  }

  if (word.postopek === "zlaganje") {
    if (word.osnove && word.osnove.length > 0) {
      parts.push(...word.osnove);
    }

    let formattedWord = parts.filter((p) => p).join("-");

    if (!koncnica || koncnica === "∅" || koncnica === "ø") {
      formattedWord += "-ø";
    }

    return formattedWord;
  }

  return word.beseda;
}
