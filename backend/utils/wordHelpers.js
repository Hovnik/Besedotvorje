const Word = require("../models/Word");
const WordMetadata = require("../models/WordMetadata");

/**
 * Fetch all words and metadata, creating a map for easy lookup
 * @returns {Object} { words, metadataMap }
 */
async function fetchWordsWithMetadata() {
  const words = await Word.find().lean();
  const wordIds = words.map((w) => w._id);
  const metadata = await WordMetadata.find({
    wordId: { $in: wordIds },
  }).lean();

  const metadataMap = {};
  metadata.forEach((m) => {
    metadataMap[m.wordId.toString()] = m;
  });

  return { words, metadataMap };
}

/**
 * Get unverified words from all words
 * @param {Array} words - All words
 * @param {Object} metadataMap - Map of wordId -> metadata
 * @returns {Array} Unverified words
 */
function filterUnverifiedWords(words, metadataMap) {
  return words.filter((word) => {
    const meta = metadataMap[word._id.toString()];
    return !meta || meta.potrjeno !== true;
  });
}

/**
 * Get verified words from all words
 * @param {Array} words - All words
 * @param {Object} metadataMap - Map of wordId -> metadata
 * @returns {Array} Verified words
 */
function filterVerifiedWords(words, metadataMap) {
  return words.filter((word) => {
    const meta = metadataMap[word._id.toString()];
    return meta && meta.potrjeno === true;
  });
}

/**
 * Get words with dislikes
 * @param {Array} words - All words
 * @param {Object} metadataMap - Map of wordId -> metadata
 * @returns {Array} Words with dislike counts
 */
function getWordsWithDislikes(words, metadataMap) {
  const wordWithDislikes = [];

  Object.values(metadataMap).forEach((meta) => {
    const word = words.find((w) => w._id.toString() === meta.wordId.toString());
    if (word && meta.votes && meta.votes.length > 0) {
      const dislikeCount = meta.votes.filter(
        (v) => v.voteType === "dislike",
      ).length;
      if (dislikeCount > 0) {
        wordWithDislikes.push({
          ...word,
          dislikeCount,
        });
      }
    }
  });

  return wordWithDislikes;
}

/**
 * Count verified words from metadata
 * @param {Object} metadataMap - Map of wordId -> metadata
 * @returns {number} Count of verified words
 */
function countVerifiedWords(metadataMap) {
  return Object.values(metadataMap).filter((m) => m.potrjeno === true).length;
}

module.exports = {
  fetchWordsWithMetadata,
  filterUnverifiedWords,
  filterVerifiedWords,
  getWordsWithDislikes,
  countVerifiedWords,
};
