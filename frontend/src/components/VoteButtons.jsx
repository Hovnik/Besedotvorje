import { useState, useEffect } from "react";
import axios from "axios";
import { ThumbsUp, ThumbsDown } from "lucide-react";

function VoteButtons({ wordId, initialLikes = 0, initialDislikes = 0, word }) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userVote, setUserVote] = useState(null); // 'like', 'dislike', or null
  const [loading, setLoading] = useState(false);

  // Load user's vote from localStorage on mount
  useEffect(() => {
    const savedVotes = JSON.parse(localStorage.getItem("wordVotes") || "{}");
    setUserVote(savedVotes[wordId] || null);
  }, [wordId]);

  // Calculate percentages
  const total = likes + dislikes;
  const likePercentage = total > 0 ? Math.round((likes / total) * 100) : 0;
  const dislikePercentage =
    total > 0 ? Math.round((dislikes / total) * 100) : 0;

  const handleVote = async (voteType) => {
    if (loading) return;

    setLoading(true);

    try {
      // Determine the new vote
      const newVote = userVote === voteType ? null : voteType;

      // Optimistic update
      const previousVote = userVote;

      // Update local state optimistically
      setUserVote(newVote);

      let newLikes = likes;
      let newDislikes = dislikes;

      // Remove previous vote
      if (previousVote === "like") {
        newLikes -= 1;
      } else if (previousVote === "dislike") {
        newDislikes -= 1;
      }

      // Add new vote
      if (newVote === "like") {
        newLikes += 1;
      } else if (newVote === "dislike") {
        newDislikes += 1;
      }

      setLikes(newLikes);
      setDislikes(newDislikes);

      // Send to backend (backend validates by IP)
      const response = await axios.post(`/api/words/${wordId}/vote`, {
        voteType: newVote,
      });

      // Update with actual values from server
      setLikes(response.data.likes);
      setDislikes(response.data.dislikes);

      // Save to localStorage for UI state
      const savedVotes = JSON.parse(localStorage.getItem("wordVotes") || "{}");
      if (newVote) {
        savedVotes[wordId] = newVote;
      } else {
        delete savedVotes[wordId];
      }
      localStorage.setItem("wordVotes", JSON.stringify(savedVotes));
    } catch (error) {
      console.error("Error voting:", error);
      // Revert optimistic update on error
      setUserVote(userVote);
      setLikes(likes);
      setDislikes(dislikes);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Vote Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleVote("like")}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
            userVote === "like"
              ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white"
              : "bg-gradient-to-r from-amber-100 to-orange-100 text-neutral-700 hover:from-amber-200 hover:to-orange-200"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Všeč mi je"
        >
          <ThumbsUp className="w-5 h-5" />
          <span className="text-base">{likes}</span>
        </button>

        <button
          onClick={() => handleVote("dislike")}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
            userVote === "dislike"
              ? "bg-gradient-to-r from-rose-900 to-rose-700 text-white"
              : "bg-gradient-to-r from-amber-100 to-orange-100 text-neutral-700 hover:from-amber-200 hover:to-orange-200"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Ni mi všeč"
        >
          <ThumbsDown className="w-5 h-5" />
          <span className="text-base">{dislikes}</span>
        </button>
      </div>

      {/* Percentage Display */}
      {total > 0 && (
        <div className="text-base font-semibold bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-xl">
          <span className="text-emerald-700">{likePercentage}%</span>
          <span className="text-neutral-500 mx-1">/</span>
          <span className="text-rose-900">{dislikePercentage}%</span>
        </div>
      )}
    </div>
  );
}

export default VoteButtons;
