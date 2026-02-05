# Besedotvorje - ChatGPT Word Formation Analyzer

A full-stack MERN application that analyzes Slovenian words using OpenAI's ChatGPT API. The app intelligently caches results in MongoDB - if a word has been analyzed before, it retrieves the cached result; otherwise, it sends a request to ChatGPT.

## 🚀 Features

- **ChatGPT Integration**: Analyzes Slovenian word formation using GPT-4
- **Smart Caching**: Saves ChatGPT responses to MongoDB to avoid duplicate API calls
- **React Frontend**: Modern UI built with React and Tailwind CSS
- **Real-time Analysis**: Instant word formation breakdown
- **History Tracking**: View all previously analyzed words
- **Access Statistics**: Track how many times each word was analyzed

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **OpenAI API Key** - Get one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

## 🛠️ Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Edit `backend/.env` and add your OpenAI API key:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/besedotvorje
NODE_ENV=development
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Start MongoDB

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### 4. Start Backend Server

```bash
cd backend
npm run dev
```

Server will run on `http://localhost:5000`

### 5. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

### 6. Start Frontend Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🎯 Usage

1. Open `http://localhost:3000` in your browser
2. Enter a Slovenian word (e.g., "voznik", "srečelov")
3. Click "Analiziraj" or press Enter
4. View the ChatGPT analysis result
5. Check the history panel for previously analyzed words

### How the Caching Works

- **First time**: Word is sent to ChatGPT API, response is saved to MongoDB
- **Subsequent times**: Response is retrieved from MongoDB (no API call)
- **Indicator**: "📦 Iz predpomnilnika" badge shows cached results

## 📁 Project Structure

```
Besedotvorje/
├── backend/
│   ├── controllers/
│   │   └── wordController.js       # ChatGPT API logic & caching
│   ├── models/
│   │   └── Word.js                 # MongoDB schema
│   ├── routes/
│   │   └── wordRoutes.js           # API endpoints
│   ├── .env                         # Environment variables (not in git)
│   ├── .gitignore
│   ├── package.json
│   └── server.js                    # Express server
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── WordAnalyzer.jsx    # Main word input component
    │   │   └── History.jsx         # History sidebar
    │   ├── App.jsx                  # Root component
    │   ├── main.jsx                 # React entry point
    │   └── index.css                # Tailwind imports
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

## 🔌 API Endpoints

### POST `/api/words/analyze`

Analyze a word (checks DB first, then ChatGPT if needed)

**Request:**

```json
{
  "word": "voznik"
}
```

**Response:**

```json
{
  "word": "voznik",
  "analysis": "- Predpone: ni\n- Koren: voz\n- Besedotvorno obrazilo: -nik\n- Tip: izpeljanka",
  "fromCache": false,
  "accessCount": 1
}
```

### GET `/api/words/history`

Get all analyzed words (last 50)

**Response:**

```json
[
  {
    "_id": "...",
    "word": "voznik",
    "analysis": "...",
    "accessCount": 3,
    "createdAt": "2026-02-05T10:30:00.000Z",
    "lastAccessed": "2026-02-05T11:15:00.000Z"
  }
]
```

## ⚙️ Configuration

### Change OpenAI Model

Edit `backend/controllers/wordController.js`:

```javascript
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo", // Change to gpt-3.5-turbo for faster/cheaper
  // or keep "gpt-4" for better quality
  ...
})
```

### Customize ChatGPT Prompt

The prompt is defined in `backend/controllers/wordController.js`:

```javascript
const PROMPT_TEMPLATE = `Navedi besedotvorno podstavo besede: {word}...`;
```

### Styling

- **Tailwind classes**: Edit components in `frontend/src/components/`
- **Custom CSS**: Edit `frontend/src/index.css`
- **Theme colors**: Modify `frontend/tailwind.config.js`

## 💰 Cost Considerations

- **GPT-4**: ~$0.03 per analysis (more expensive, better quality)
- **GPT-3.5-turbo**: ~$0.002 per analysis (cheaper, faster)
- **Caching**: Subsequent requests for the same word cost nothing!

## 🐛 Troubleshooting

### Backend won't start

- Check if MongoDB is running
- Verify `OPENAI_API_KEY` is set in `.env`
- Run `npm install` in backend folder

### Frontend can't connect to backend

- Make sure backend is running on port 5000
- Check browser console for CORS errors
- Verify proxy is configured in `vite.config.js`

### OpenAI API errors

- Check API key is valid
- Verify you have credits in your OpenAI account
- Check rate limits if getting 429 errors

## 📝 TODO / Future Enhancements

- [ ] Add user authentication
- [ ] Export history to CSV/PDF
- [ ] Allow editing/correcting ChatGPT responses
- [ ] Add morpheme visualization
- [ ] Support batch word analysis
- [ ] Add pronunciation guide
- [ ] Deploy to production (Vercel/Render/Railway)

## 📄 License

ISC

## 👥 Contributing

Feel free to submit issues and enhancement requests!
