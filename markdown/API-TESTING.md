# API Testing Guide

## Analyze Word Endpoint

### Endpoint
```
POST /api/words/analyze
```

### Request Body
```json
{
  "beseda": "predpostavka"
}
```

### Response (from AI)
```json
{
  "source": "ai",
  "data": {
    "_id": "...",
    "beseda": "predpostavka",
    "tvorjenka": true,
    "postopek": "izpeljava",
    "slovnicno": {
      "besedna_vrsta": "samostalnik",
      "spol": "ženski",
      "koncnica": "a"
    },
    "osnova": "postav",
    "predpone": ["pred"],
    "pripone": ["ka"],
    "osnove": [],
    "confidence": 0.95,
    "__v": 0
  }
}
```

### Response (from database)
```json
{
  "source": "database",
  "data": {
    "_id": "...",
    "beseda": "predpostavka",
    "tvorjenka": true,
    "postopek": "izpeljava",
    ...
  }
}
```

### Error Response
```json
{
  "error": "Please provide a valid word (beseda)"
}
```

## Testing with cURL

```bash
# Test the analyze endpoint
curl -X POST http://localhost:3000/api/words/analyze \
  -H "Content-Type: application/json" \
  -d '{"beseda": "predpostavka"}'

# Test with another word
curl -X POST http://localhost:3000/api/words/analyze \
  -H "Content-Type: application/json" \
  -d '{"beseda": "pisalo"}'
```

## Testing with JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:3000/api/words/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    beseda: 'predpostavka'
  })
});

const result = await response.json();
console.log(result);
```

## Expected Behavior

1. **First Request**: Word is not in database
   - System calls OpenAI API
   - Validates the AI response
   - Saves to Word collection
   - Creates WordMetadata entry
   - Returns `source: "ai"`

2. **Subsequent Requests**: Word exists in database
   - Returns cached result immediately
   - Increments `accessCount` in metadata
   - Returns `source: "database"`
   - No API call = faster + cheaper

## AI Output Validation

The system validates:
- ✅ `beseda` is a string
- ✅ `tvorjenka` is boolean
- ✅ `postopek` is one of: "izpeljava", "zlaganje", "netvorjenka"
- ✅ If `postopek` = "izpeljava" → `osnova` must exist
- ✅ If `postopek` = "zlaganje" → `osnove` must have at least 2 elements
- ✅ `confidence` is between 0 and 1

Invalid responses are rejected before saving.
