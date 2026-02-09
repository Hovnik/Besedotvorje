# Besedotvorje Backend - Complete Workflow

## Overview

This backend analyzes Slovenian words for word formation (besedotvorje) using OpenAI's API. It implements a human-in-the-loop fine-tuning pipeline that improves over time.

## 🎯 Core Workflow

### 1. User Requests Word Analysis

```
User → POST /api/words/analyze { beseda: "predpostavka" }
```

### 2. Backend Checks Database

**If word exists:**
- Return cached result immediately
- Increment access count
- Response: `{ source: "database", data: {...} }`

**If word is new:**
- Proceed to AI analysis →

### 3. AI Analysis (New Words Only)

The system calls OpenAI with a **strict prompt** that enforces:
- JSON-only output
- Specific schema structure
- No explanations or extra text

**Model used:**
- Default: `gpt-4o-mini` (base model)
- After fine-tuning: `ft:gpt-4o-mini:your-org:slovene-morph:v1`
- Configured via `FT_MODEL_ID` in `.env`

### 4. Validation

Before saving, the response is validated:
```javascript
✅ beseda: string
✅ tvorjenka: boolean
✅ postopek: "izpeljava" | "zlaganje" | "netvorjenka"
✅ confidence: 0-1

Conditional validation:
✅ izpeljava → requires osnova
✅ zlaganje → requires osnove (min 2)
```

Invalid responses are **rejected** - never saved.

### 5. Save to Database

Two collections:

**Word** - Linguistic data:
```javascript
{
  beseda: "predpostavka",
  tvorjenka: true,
  postopek: "izpeljava",
  osnova: "postav",
  predpone: ["pred"],
  pripone: ["ka"],
  confidence: 0.95
}
```

**WordMetadata** - Human feedback:
```javascript
{
  wordId: ObjectId("..."),
  potrjeno: false,  // ← Human confirmation
  confidence: 0.95,
  likes: 0,
  dislikes: 0,
  accessCount: 1
}
```

## 🔄 Fine-Tuning Pipeline (Future)

### Step 1: Human Confirmation
Users vote/confirm correct analyses:
```javascript
WordMetadata.updateOne({ wordId }, { potrjeno: true })
```

### Step 2: Export Training Data
When you have 300-500 confirmed words:
```bash
npm run export-training
```

This creates `training-data/training.jsonl`:
```json
{"messages":[{"role":"system","content":"..."},{"role":"user","content":"Analyze the word: predpostavka"},{"role":"assistant","content":"{\"beseda\":\"predpostavka\",...}"}]}
```

### Step 3: Fine-Tune Model
Upload to OpenAI:
```bash
openai api fine_tuning.jobs.create \
  -t training-data/training.jsonl \
  -m gpt-4o-mini
```

Result: `ft:gpt-4o-mini:your-org:slovene-morph:v1`

### Step 4: Deploy Fine-Tuned Model
Update `.env`:
```env
FT_MODEL_ID=ft:gpt-4o-mini:your-org:slovene-morph:v1
```

Restart server. Done. ✅

## 📊 The Magic Loop

```
AI makes mistake
    ↓
User corrects
    ↓
potrjeno = true
    ↓
Export training data
    ↓
Fine-tune model
    ↓
Mistake disappears forever
```

This is **real learning**, not prompt engineering.

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add:
   # - OPENAI_API_KEY
   # - MONGODB_URI
   ```

3. **Start server:**
   ```bash
   npm run dev
   ```

4. **Test endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/words/analyze \
     -H "Content-Type: application/json" \
     -d '{"beseda": "predpostavka"}'
   ```

## 📁 File Structure

```
backend/
├── controllers/
│   └── wordController.js      # Main logic (AI + validation)
├── models/
│   ├── Word.js                # Linguistic schema
│   └── WordMetadata.js        # Human feedback schema
├── routes/
│   └── wordRoutes.js          # API endpoints
├── scripts/
│   └── exportTrainingData.js  # Export for fine-tuning
└── server.js                  # Express app
```

## 🔑 Key Functions

### wordController.js

| Function | Purpose |
|----------|---------|
| `buildPrompt(word)` | Creates strict JSON-enforcing prompt |
| `analyzeWordWithAI(word)` | Calls OpenAI API with validation |
| `validateAIOutput(data)` | Ensures response matches schema |
| `saveWordToDatabase(data)` | Saves Word + WordMetadata |
| `analyzeWord(req, res)` | Main endpoint handler |

## 🎓 Important Principles

1. **Never trust AI output blindly** - Always validate
2. **Separate concerns** - Linguistic data ≠ Metadata
3. **Cache everything** - DB first, AI second
4. **Human-in-the-loop** - Confirmation drives improvement
5. **Version your models** - v1, v2, v3 as you fine-tune

## 📈 Success Metrics

- **< 100 words**: Too early to fine-tune
- **300-500 words**: First fine-tuning ready
- **1000+ words**: Strong domain-specific model
- **5000+ words**: Production-ready accuracy

## 🛠️ Next Steps

1. Implement voting endpoints (like/dislike)
2. Add word editing functionality
3. Build confirmation interface
4. Monitor confidence scores
5. Plan first fine-tuning cycle

---

See [API-TESTING.md](./API-TESTING.md) for testing examples.
See [FINE-TUNING.md](../FINE-TUNING.md) for deep-dive theory.
