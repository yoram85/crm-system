import { useState, useEffect } from 'react'
import { FileSpreadsheet, AlertCircle } from 'lucide-react'

interface GoogleSheetsPickerProps {
  onSelect: (spreadsheetId: string, spreadsheetName: string, sheets: string[]) => void
  clientId?: string
  apiKey?: string
}

export default function GoogleSheetsPicker({ onSelect, clientId, apiKey }: GoogleSheetsPickerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGapiLoaded, setIsGapiLoaded] = useState(false)

  useEffect(() => {
    // Check if gapi is loaded
    const checkGapi = setInterval(() => {
      if (window.gapi && window.google) {
        setIsGapiLoaded(true)
        clearInterval(checkGapi)
      }
    }, 100)

    return () => clearInterval(checkGapi)
  }, [])

  const handleOpenPicker = async () => {
    if (!clientId || !apiKey) {
      setError('חסרים Google Client ID או API Key. אנא הגדר אותם בקובץ .env')
      return
    }

    if (!isGapiLoaded) {
      setError('Google APIs עדיין לא נטענו. אנא נסה שוב.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Initialize the Google API client
      await new Promise((resolve) => {
        window.gapi.load('client:picker', resolve)
      })

      // Initialize the client
      await window.gapi.client.init({
        apiKey: apiKey,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      })

      // Create and render a Picker object for searching spreadsheets
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly',
        callback: async (response: any) => {
          if (response.error) {
            setError('שגיאה באימות Google: ' + response.error)
            setIsLoading(false)
            return
          }

          // Create picker
          const picker = new window.google.picker.PickerBuilder()
            .addView(
              new window.google.picker.DocsView(window.google.picker.ViewId.SPREADSHEETS)
                .setIncludeFolders(true)
            )
            .setOAuthToken(response.access_token)
            .setDeveloperKey(apiKey)
            .setCallback(async (data: any) => {
              if (data.action === window.google.picker.Action.PICKED) {
                const spreadsheetId = data.docs[0].id
                const spreadsheetName = data.docs[0].name

                try {
                  // Fetch sheet names
                  const sheetsResponse = await window.gapi.client.sheets.spreadsheets.get({
                    spreadsheetId: spreadsheetId,
                  })

                  const sheets = sheetsResponse.result.sheets.map((sheet: any) => sheet.properties.title)

                  onSelect(spreadsheetId, spreadsheetName, sheets)
                  setIsLoading(false)
                } catch (err: any) {
                  setError('שגיאה בטעינת הגיליונות: ' + err.message)
                  setIsLoading(false)
                }
              } else if (data.action === window.google.picker.Action.CANCEL) {
                setIsLoading(false)
              }
            })
            .build()

          picker.setVisible(true)
        },
      })

      // Request access token
      tokenClient.requestAccessToken()
    } catch (err: any) {
      setError('שגיאה בפתיחת Google Picker: ' + err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleOpenPicker}
        disabled={isLoading || !isGapiLoaded}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <FileSpreadsheet className="w-5 h-5" />
        {isLoading ? 'טוען...' : isGapiLoaded ? 'בחר גיליון מ-Google Drive' : 'טוען Google APIs...'}
      </button>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {!clientId || !apiKey ? (
        <p className="text-sm text-gray-600">
          💡 כדי להשתמש ב-Google Picker, צריך להגדיר Google OAuth credentials. ראה הוראות ב-README.
        </p>
      ) : null}
    </div>
  )
}
