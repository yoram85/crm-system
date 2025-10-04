const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CRM Backend Server is running' });
});

// Google Sheets integration endpoint
app.post('/api/google-sheets', async (req, res) => {
  try {
    const { credentials, spreadsheetId, event, action, data } = req.body;

    // Validate required fields
    if (!credentials || !spreadsheetId || !event || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: credentials, spreadsheetId, event, data'
      });
    }

    // Parse credentials
    let parsedCredentials;
    try {
      parsedCredentials = typeof credentials === 'string'
        ? JSON.parse(credentials)
        : credentials;
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials JSON format'
      });
    }

    // Create Google Auth client
    const auth = new google.auth.GoogleAuth({
      credentials: parsedCredentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Determine sheet name based on event type
    let sheetName;
    let rowData = [];

    switch (event) {
      case 'customer':
        sheetName = 'Customers';
        rowData = [
          new Date().toISOString(),
          data.id || '',
          data.name || '',
          data.email || '',
          data.phone || '',
          data.company || '',
          data.status || '',
          action || ''
        ];
        break;

      case 'deal':
        sheetName = 'Deals';
        rowData = [
          new Date().toISOString(),
          data.id || '',
          data.title || '',
          data.value || '',
          data.stage || '',
          data.probability || '',
          data.customerId || '',
          data.closeDate || '',
          action || ''
        ];
        break;

      case 'task':
        sheetName = 'Tasks';
        rowData = [
          new Date().toISOString(),
          data.id || '',
          data.title || '',
          data.description || '',
          data.priority || '',
          data.status || '',
          data.dueDate || '',
          data.assignedTo || '',
          action || ''
        ];
        break;

      case 'product':
        sheetName = 'Products';
        rowData = [
          new Date().toISOString(),
          data.id || '',
          data.name || '',
          data.description || '',
          data.price || '',
          data.category || '',
          action || ''
        ];
        break;

      case 'service':
        sheetName = 'Services';
        rowData = [
          new Date().toISOString(),
          data.id || '',
          data.name || '',
          data.description || '',
          data.price || '',
          data.duration || '',
          action || ''
        ];
        break;

      case 'test':
        // Test connection - just verify we can access the spreadsheet
        const testResponse = await sheets.spreadsheets.get({
          spreadsheetId,
        });

        return res.json({
          success: true,
          message: 'Connection successful',
          spreadsheetTitle: testResponse.data.properties.title
        });

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown event type: ${event}`
        });
    }

    // Append row to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [rowData]
      }
    });

    res.json({
      success: true,
      event,
      action,
      sheetName,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Google Sheets API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Airtable integration endpoint (optional - for future use)
app.post('/api/airtable', async (req, res) => {
  try {
    const { apiKey, baseId, tableName, data } = req.body;

    // TODO: Implement Airtable integration if needed
    res.json({ success: true, message: 'Airtable integration coming soon' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ CRM Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Google Sheets endpoint: http://localhost:${PORT}/api/google-sheets`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
