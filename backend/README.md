# CRM Backend Server

Backend server for handling Google Sheets integration for the CRM system.

## Installation

```bash
cd backend
npm install
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will run on `http://localhost:3001`

## Endpoints

### Health Check
- **GET** `/health`
- Returns server status

### Google Sheets Integration
- **POST** `/api/google-sheets`
- Body:
  ```json
  {
    "credentials": "{...service account JSON...}",
    "spreadsheetId": "your-spreadsheet-id",
    "event": "customer|deal|task|product|service|test",
    "action": "create|update|delete",
    "data": { ... }
  }
  ```

## Configuration

1. Copy `.env.example` to `.env`
2. Set `PORT` if you want to change the default port (3001)

## CORS

CORS is enabled for all origins. In production, you should restrict this to your frontend domain only.

## Google Sheets Setup

1. Create a Service Account in Google Cloud Console
2. Download the JSON key file
3. Share your Google Spreadsheet with the service account email (found in the JSON file)
4. Use the credentials JSON in your CRM integration settings
