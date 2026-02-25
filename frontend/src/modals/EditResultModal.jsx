import { useState, useEffect } from "react";
import { X, Plus, Trash2, GripVertical } from "lucide-react";
import axios from "axios";
import { useScrollLock } from "../hooks/useScrollLock";

function EditResultModal({ isOpen, onClose, result, onSave }) {
  const [tvorjenka, setTvorjenka] = useState(true);
  const [postopek, setPostopek] = useState("izpeljava");

  // Slovnicno fields
  const [besednaVrsta, setBesednaVrsta] = useState("");
  const [spol, setSpol] = useState("");
  const [koncnica, setKoncnica] = useState("");

  // Morfemi (universal structure)
  const [morfemi, setMorfemi] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useScrollLock(isOpen);

  useEffect(() => {
    if (result) {
      setTvorjenka(result.tvorjenka ?? true);
      // Convert array to single value
      setPostopek(
        Array.isArray(result.postopek)
          ? result.postopek[0] || "izpeljava"
          : result.postopek || "izpeljava",
      );

      setBesednaVrsta(result.slovnicno?.besedna_vrsta || "");
      setSpol(result.slovnicno?.spol || "");
      setKoncnica(result.slovnicno?.koncnica || "");

      // Load morfemi or create empty array, sorted by pozicija
      if (result.morfemi && result.morfemi.length > 0) {
        const sorted = [...result.morfemi].sort(
          (a, b) => a.pozicija - b.pozicija,
        );
        setMorfemi(sorted.map((m) => ({ ...m })));
      } else {
        setMorfemi([]);
      }

      setError("");
    }
  }, [result]);

  if (!isOpen) return null;

  const addMorfem = () => {
    setMorfemi([
      ...morfemi,
      { tip: "osnova", vrednost: "", pozicija: morfemi.length },
    ]);
  };

  const removeMorfem = (index) => {
    const updated = morfemi.filter((_, i) => i !== index);
    // Reindex positions
    updated.forEach((m, i) => {
      m.pozicija = i;
    });
    setMorfemi(updated);
  };

  const updateMorfem = (index, field, value) => {
    const updated = [...morfemi];
    updated[index][field] = value;
    setMorfemi(updated);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...morfemi];
    const draggedItem = updated[draggedIndex];

    // Remove from old position
    updated.splice(draggedIndex, 1);
    // Insert at new position
    updated.splice(index, 0, draggedItem);

    // Reindex positions
    updated.forEach((m, i) => {
      m.pozicija = i;
    });

    setMorfemi(updated);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate that we have a word ID
      if (!result?._id) {
        throw new Error("Word ID is missing");
      }

      // Prepare data for update
      const updateData = {
        tvorjenka,
        postopek: tvorjenka ? [postopek] : ["netvorjenka"],
        slovnicno: {
          besedna_vrsta: besednaVrsta || undefined,
          spol: spol || undefined,
          koncnica: koncnica || undefined,
        },
        morfemi: tvorjenka ? morfemi.filter((m) => m.vrednost.trim()) : [],
      };

      // Update in backend
      const response = await axios.put(`/api/words/${result._id}`, updateData);

      // Notify parent about updated word
      if (response.data && response.data.word) {
        onSave(response.data.word);
        onClose();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Edit save error:", err);
      setError(
        err.response?.data?.error || err.message || "Napaka pri shranjevanju",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99998]"
        onClick={onClose}
      />

      <div className="relative z-[100000] bg-gradient-to-br from-white to-amber-50/50 rounded-3xl shadow-2xl border-2 border-rose-200/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-slideUp">
        <button
          onClick={onClose}
          className="sticky top-0 float-right p-2 text-rose-900 hover:bg-rose-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-rose-900 via-rose-700 to-rose-600 bg-clip-text text-transparent mb-1">
            Uredi besedo
          </h2>
          <p className="text-sm text-neutral-600">{result?.beseda}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tvorjenka */}
          <div>
            <label className="block text-sm font-semibold text-rose-900 mb-2 uppercase tracking-wide">
              Ali je tvorjenka?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={tvorjenka === true}
                  onChange={() => setTvorjenka(true)}
                  className="w-4 h-4 text-rose-900 focus:ring-rose-900"
                />
                <span className="text-neutral-800">Da</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={tvorjenka === false}
                  onChange={() => setTvorjenka(false)}
                  className="w-4 h-4 text-rose-900 focus:ring-rose-900"
                />
                <span className="text-neutral-800">Ne</span>
              </label>
            </div>
          </div>

          {/* Postopek - only if tvorjenka */}
          {tvorjenka && (
            <div>
              <label className="block text-sm font-semibold text-rose-900 mb-2 uppercase tracking-wide">
                Postopek
              </label>
              <div className="flex flex-wrap gap-3">
                {["izpeljava", "zlaganje", "sestavljanje"].map((tip) => (
                  <label
                    key={tip}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="postopek"
                      checked={postopek === tip}
                      onChange={() => setPostopek(tip)}
                      className="w-4 h-4 text-rose-900 focus:ring-rose-900"
                    />
                    <span className="text-neutral-800 capitalize">{tip}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Slovnicno */}
          <div className="border-t-2 border-rose-100 pt-4">
            <h3 className="text-sm font-bold text-rose-900 mb-3 uppercase tracking-wide">
              Slovnično
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Besedna vrsta
                </label>
                <select
                  value={besednaVrsta}
                  onChange={(e) => setBesednaVrsta(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 outline-none bg-white/80"
                >
                  <option value="">-- Izberite --</option>
                  <option value="samostalnik">samostalnik</option>
                  <option value="pridevnik">pridevnik</option>
                  <option value="glagol">glagol</option>
                  <option value="prislov">prislov</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Spol
                </label>
                <select
                  value={spol}
                  onChange={(e) => setSpol(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 outline-none bg-white/80"
                >
                  <option value="">-- Izberite --</option>
                  <option value="moški">moški</option>
                  <option value="ženski">ženski</option>
                  <option value="srednji">srednji</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Končnica
                </label>
                <div className="flex gap-1 items-stretch">
                  <input
                    type="text"
                    value={koncnica}
                    onChange={(e) => setKoncnica(e.target.value)}
                    placeholder="npr. a, ø"
                    className="flex-1 min-w-0 px-3 py-2 text-sm border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 outline-none bg-white/80"
                  />
                  <button
                    type="button"
                    onClick={() => setKoncnica("ø")}
                    className="w-9 h-auto flex items-center justify-center text-sm font-bold bg-rose-100 hover:bg-rose-200 text-rose-900 border-2 border-rose-200 rounded-xl transition-colors flex-shrink-0"
                    title="Vstavi ø"
                  >
                    ø
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Morfemi - only if tvorjenka */}
          {tvorjenka && (
            <div className="border-t-2 border-rose-100 pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wide">
                  Morfemi
                </h3>
                <button
                  type="button"
                  onClick={addMorfem}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold rounded-xl transition-colors text-xs"
                >
                  <Plus className="w-4 h-4" />
                  Dodaj morfem
                </button>
              </div>

              {morfemi.length === 0 ? (
                <p className="text-sm text-neutral-500 italic">
                  Dodajte morfeme (osnove, predpone, pripone, medpone)
                </p>
              ) : (
                <div className="space-y-2">
                  {morfemi.map((morfem, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex gap-2 items-center bg-white/80 p-3 rounded-xl border-2 transition-all cursor-move ${
                        draggedIndex === index
                          ? "border-rose-400 opacity-50"
                          : "border-rose-100 hover:border-rose-300"
                      }`}
                    >
                      {/* Position number on the left */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <GripVertical className="w-5 h-5 text-neutral-400" />
                        <div className="w-8 h-8 flex items-center justify-center bg-rose-100 text-rose-900 font-bold rounded-lg text-sm">
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-neutral-600 mb-1">
                            Tip
                          </label>
                          <select
                            value={morfem.tip}
                            onChange={(e) =>
                              updateMorfem(index, "tip", e.target.value)
                            }
                            className="w-full px-2 py-1.5 text-sm border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 outline-none"
                          >
                            <option value="osnova">osnova</option>
                            <option value="predpona">predpona</option>
                            <option value="pripona">pripona</option>
                            <option value="medpona">medpona</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-600 mb-1">
                            Vrednost
                          </label>
                          <input
                            type="text"
                            value={morfem.vrednost}
                            onChange={(e) =>
                              updateMorfem(index, "vrednost", e.target.value)
                            }
                            placeholder="npr. postav"
                            className="w-full px-2 py-1.5 text-sm border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMorfem(index)}
                        className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Odstrani morfem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white border-2 border-rose-100 text-rose-900 font-semibold rounded-2xl hover:bg-rose-50 transition"
            >
              Prekliči
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-900 to-rose-700 text-white font-bold rounded-2xl hover:from-rose-800 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Shranjujem..." : "Shrani"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditResultModal;
