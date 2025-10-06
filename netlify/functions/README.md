# Netlify Functions

תיקייה זו מכילה Serverless Functions עבור Netlify.

## שימוש

כל קובץ JavaScript או TypeScript בתיקייה זו הופך אוטומטית ל-API endpoint:

- `hello.js` → `/.netlify/functions/hello`

## דוגמת שימוש

```javascript
// netlify/functions/example.js
exports.handler = async (event, context) => {
  const { httpMethod, body, queryStringParameters } = event

  // טיפול ב-GET
  if (httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Hello from GET' }),
    }
  }

  // טיפול ב-POST
  if (httpMethod === 'POST') {
    const data = JSON.parse(body)
    return {
      statusCode: 200,
      body: JSON.stringify({ received: data }),
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' }),
  }
}
```

## קריאה מהאפליקציה

```typescript
// מהאפליקציה React
const response = await fetch('/.netlify/functions/example', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John' }),
})
const data = await response.json()
```

## משתני סביבה

Functions יכולים לגשת למשתני סביבה:

```javascript
const supabaseUrl = process.env.VITE_SUPABASE_URL
```

הגדר משתני סביבה ב-Netlify Dashboard:
Site Settings → Environment Variables

## תיעוד

- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Event Object](https://docs.netlify.com/functions/build/#anatomy-of-a-lambda-function)
