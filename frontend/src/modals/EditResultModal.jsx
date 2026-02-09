import { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { useScrollLock } from "../hooks/useScrollLock";

function EditResultModal({ isOpen, onClose, result, onSave }) {
  const [tvorjenka, setTvorjenka] = useState(true);
  const [postopek, setPostopek] = useState("izpeljava");

  // Slovnicno fields
  const [besednaVrsta, setBesednaVrsta] = useState("");
  const [spol, setSpol] = useState("");
  const [koncnica, setKoncnica] = useState("");

  // Izpeljava fields
  const [osnova, setOsnova] = useState("");
  const [predpone, setPredpone] = useState("");
  const [pripone, setPripone] = useState("");

  // Zlaganje fields
  const [osnove, setOsnove] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useScrollLock(isOpen);

  useEffect(() => {
    if (result) {
      setTvorjenka(result.tvorjenka ?? true);
      setPostopek(result.postopek || "izpeljava");

      setBesednaVrsta(result.slovnicno?.besedna_vrsta || "");
      setSpol(result.slovnicno?.spol || "");
      setKoncnica(result.slovnicno?.koncnica || "");

      setOsnova(result.osnova || "");
      setPredpone(result.predpone?.join(", ") || "");
      setPripone(result.pripone?.join(", ") || "");

      setOsnove(result.osnove?.join(", ") || "");

      setError("");
    }
  }, [result]);

  useEffect(() => {
    if (postopek === "izpeljava") {
      setOsnove("");
    } else if (postopek === "zlaganje") {
      setOsnova("");
      setPredpone("");
      setPripone("");
    }
  }, [postopek]);

  if (!isOpen) return null;

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
        postopek: tvorjenka ? postopek : "netvorjenka",
        slovnicno: {
          besedna_vrsta: besednaVrsta || undefined,
          spol: spol || undefined,
          koncnica: koncnica || undefined,
        },
      };

      // Add fields based on postopek
      if (tvorjenka && postopek === "izpeljava") {
        updateData.osnova = osnova.trim() || undefined;
        updateData.predpone = predpone
          ? predpone
              .split(",")
              .map((p) => p.trim())
              .filter((p) => p)
          : [];
        updateData.pripone = pripone
          ? pripone
              .split(",")
              .map((p) => p.trim())
              .filter((p) => p)
          : [];
        updateData.osnove = [];
      } else if (tvorjenka && postopek === "zlaganje") {
        updateData.osnove = osnove
          ? osnove
              .split(",")
              .map((o) => o.trim())
              .filter((o) => o)
          : [];
        updateData.osnova = undefined;
        updateData.predpone = [];
        updateData.pripone = [];
      } else {
        // netvorjenka - clear all derivative fields
        updateData.osnova = undefined;
        updateData.predpone = [];
        updateData.pripone = [];
        updateData.osnove = [];
      }

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
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPostopek("izpeljava")}
                  className={`flex-1 px-4 py-3 font-semibold rounded-2xl transition-all ${
                    postopek === "izpeljava"
                      ? "bg-gradient-to-r from-rose-900 to-rose-700 text-white shadow-lg"
                      : "bg-white border-2 border-rose-200 text-rose-900 hover:bg-rose-50"
                  }`}
                >
                  Izpeljava
                </button>
                <button
                  type="button"
                  onClick={() => setPostopek("zlaganje")}
                  className={`flex-1 px-4 py-3 font-semibold rounded-2xl transition-all ${
                    postopek === "zlaganje"
                      ? "bg-gradient-to-r from-rose-900 to-rose-700 text-white shadow-lg"
                      : "bg-white border-2 border-rose-200 text-rose-900 hover:bg-rose-50"
                  }`}
                >
                  Zlaganje
                </button>
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

          {/* Izpeljava fields */}
          {tvorjenka && postopek === "izpeljava" && (
            <div className="border-t-2 border-rose-100 pt-4">
              <h3 className="text-sm font-bold text-rose-900 mb-3 uppercase tracking-wide">
                Izpeljava
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    Osnova
                  </label>
                  <input
                    type="text"
                    value={osnova}
                    onChange={(e) => setOsnova(e.target.value)}
                    placeholder="npr. postav"
                    className="w-full px-3 py-2 text-sm border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 outline-none bg-white/80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    Predpone (ločene z vejico)
                  </label>
                  <input
                    type="text"
                    value={predpone}
                    onChange={(e) => setPredpone(e.target.value)}
                    placeholder="npr. pred, po"
                    className="w-full px-3 py-2 text-sm border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 outline-none bg-white/80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    Pripone (ločene z vejico)
                  </label>
                  <input
                    type="text"
                    value={pripone}
                    onChange={(e) => setPripone(e.target.value)}
                    placeholder="npr. ka, ič"
                    className="w-full px-3 py-2 text-sm border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 outline-none bg-white/80"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Zlaganje fields */}
          {tvorjenka && postopek === "zlaganje" && (
            <div className="border-t-2 border-rose-100 pt-4">
              <h3 className="text-sm font-bold text-rose-900 mb-3 uppercase tracking-wide">
                Zlaganje
              </h3>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Osnove (ločene z vejico)
                </label>
                <input
                  type="text"
                  value={osnove}
                  onChange={(e) => setOsnove(e.target.value)}
                  placeholder="npr. avto, cesta"
                  className="w-full px-3 py-2 text-sm border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 outline-none bg-white/80"
                />
              </div>
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
