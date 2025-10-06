// Example Netlify Function
// דוגמת Function בסיסית
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'שלום מ-Netlify Functions!',
      timestamp: new Date().toISOString(),
    }),
  }
}
