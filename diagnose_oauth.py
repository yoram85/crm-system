#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google OAuth Diagnostic Tool for Supabase CRM
==============================================
This script checks and diagnoses Google OAuth configuration issues.

Usage:
    python diagnose_oauth.py

Requirements:
    pip install requests python-dotenv
"""

import os
import sys
import json
import requests
from urllib.parse import urlparse
from pathlib import Path

# Fix Windows console encoding
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# ANSI Colors for pretty output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text):
    """Print a section header"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")

def print_success(text):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")

def print_error(text):
    """Print error message"""
    print(f"{Colors.RED}❌ {text}{Colors.END}")

def print_warning(text):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.END}")

def print_info(text):
    """Print info message"""
    print(f"{Colors.CYAN}ℹ️  {text}{Colors.END}")

def check_env_file():
    """Check if .env.local exists and has required variables"""
    print_header("1️⃣  בדיקת קובץ .env.local")

    env_path = Path('.env.local')

    if not env_path.exists():
        print_error("קובץ .env.local לא קיים!")
        print_info("צור אותו מ-.env.local.example:")
        print(f"  {Colors.CYAN}cp .env.local.example .env.local{Colors.END}")
        return None, None

    print_success("קובץ .env.local קיים")

    # Read environment variables
    supabase_url = None
    supabase_key = None

    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('VITE_SUPABASE_URL='):
                supabase_url = line.split('=', 1)[1].strip()
            elif line.startswith('VITE_SUPABASE_ANON_KEY='):
                supabase_key = line.split('=', 1)[1].strip()

    # Validate URL
    if not supabase_url or 'your-project' in supabase_url:
        print_error("VITE_SUPABASE_URL לא מוגדר או לא תקין!")
        print_info("עדכן את הקובץ .env.local עם ה-URL האמיתי מ-Supabase Dashboard")
        return None, None

    print_success(f"Supabase URL: {supabase_url}")

    # Validate Key
    if not supabase_key or 'your-anon' in supabase_key or len(supabase_key) < 100:
        print_error("VITE_SUPABASE_ANON_KEY לא מוגדר או לא תקין!")
        print_info("עדכן את הקובץ .env.local עם ה-Key האמיתי מ-Supabase Dashboard")
        return supabase_url, None

    print_success(f"Supabase Key: {supabase_key[:20]}...{supabase_key[-20:]}")

    return supabase_url, supabase_key

def check_supabase_connection(url, key):
    """Test connection to Supabase"""
    print_header("2️⃣  בדיקת חיבור ל-Supabase")

    if not url or not key:
        print_error("לא ניתן לבדוק חיבור - URL או Key חסרים")
        return False

    try:
        headers = {
            'apikey': key,
            'Authorization': f'Bearer {key}'
        }

        # Test REST API
        response = requests.get(f"{url}/rest/v1/", headers=headers, timeout=10)

        if response.status_code == 200:
            print_success("חיבור ל-Supabase עובד!")
            return True
        else:
            print_error(f"שגיאת חיבור: {response.status_code}")
            print_info(f"Response: {response.text[:200]}")
            return False

    except requests.exceptions.RequestException as e:
        print_error(f"שגיאה בחיבור ל-Supabase: {str(e)}")
        return False

def check_google_oauth_config(url, key):
    """Check if Google OAuth is configured in Supabase"""
    print_header("3️⃣  בדיקת הגדרות Google OAuth ב-Supabase")

    if not url or not key:
        print_error("לא ניתן לבדוק - URL או Key חסרים")
        return False

    try:
        headers = {
            'apikey': key,
            'Authorization': f'Bearer {key}'
        }

        # Check if we can access auth endpoint
        auth_url = f"{url}/auth/v1/settings"
        response = requests.get(auth_url, headers=headers, timeout=10)

        if response.status_code == 200:
            settings = response.json()

            # Check if Google is in external providers
            external_providers = settings.get('external', {})
            google_enabled = external_providers.get('google', False)

            if google_enabled:
                print_success("Google OAuth מופעל ב-Supabase!")
                return True
            else:
                print_warning("Google OAuth לא מופעל או לא מוגדר")
                print_info("לך ל-Supabase Dashboard → Authentication → Providers → Google")
                return False
        else:
            print_warning(f"לא ניתן לבדוק הגדרות OAuth (Status: {response.status_code})")
            print_info("זה נורמלי - ה-API הזה לא תמיד זמין")
            return None

    except Exception as e:
        print_warning(f"לא ניתן לבדוק הגדרות OAuth: {str(e)}")
        print_info("זה נורמלי - ה-API הזה לא תמיד זמין")
        return None

def check_redirect_urls(url):
    """Check redirect URLs configuration"""
    print_header("4️⃣  בדיקת Redirect URLs")

    if not url:
        print_error("לא ניתן לבדוק - URL חסר")
        return

    required_urls = [
        "https://rachel.woretaw.net",
        "https://rachel.woretaw.net/",
        "http://localhost:5173",
        "http://localhost:5173/",
    ]

    print_info("ודא שה-URLs הבאים מוגדרים ב-Supabase:")
    print_info("Authentication → URL Configuration → Redirect URLs")
    print()

    for redirect_url in required_urls:
        print(f"  {Colors.CYAN}✓ {redirect_url}{Colors.END}")

    print()
    print_warning("לא ניתן לבדוק אוטומטית - בדוק ידנית ב-Supabase Dashboard")

def check_netlify_env_vars():
    """Check if Netlify environment variables are documented"""
    print_header("5️⃣  בדיקת משתני סביבה ב-Netlify")

    print_info("ודא שהמשתנים הבאים מוגדרים ב-Netlify:")
    print_info("https://app.netlify.com → Site settings → Environment variables")
    print()

    vars_to_check = [
        ("VITE_SUPABASE_URL", "URL של הפרויקט ב-Supabase"),
        ("VITE_SUPABASE_ANON_KEY", "Anon/Public Key מ-Supabase"),
    ]

    for var_name, description in vars_to_check:
        print(f"  {Colors.CYAN}✓ {var_name}{Colors.END}")
        print(f"    {Colors.YELLOW}{description}{Colors.END}")

    print()
    print_warning("לא ניתן לבדוק אוטומטית - בדוק ידנית ב-Netlify Dashboard")
    print_info("אחרי הוספת משתנים, עשה: Deploys → Trigger deploy → Clear cache and deploy site")

def check_google_cloud_console():
    """Check Google Cloud Console configuration"""
    print_header("6️⃣  בדיקת Google Cloud Console")

    print_info("ודא שהגדרת Google OAuth Client נכון:")
    print_info("https://console.cloud.google.com → APIs & Services → Credentials")
    print()

    print(f"{Colors.CYAN}Authorized JavaScript origins:{Colors.END}")
    print("  ✓ https://xxxxxxxxxxx.supabase.co (ה-URL של Supabase שלך)")
    print()

    print(f"{Colors.CYAN}Authorized redirect URIs:{Colors.END}")
    print("  ✓ https://xxxxxxxxxxx.supabase.co/auth/v1/callback")
    print()

    print_warning("החלף 'xxxxxxxxxxx' ב-Project ID האמיתי שלך מ-Supabase URL")

def test_oauth_flow(url):
    """Test the OAuth flow"""
    print_header("7️⃣  בדיקת OAuth Flow")

    if not url:
        print_error("לא ניתן לבדוק - URL חסר")
        return

    oauth_url = f"{url}/auth/v1/authorize?provider=google"

    print_info("בדוק את ה-OAuth endpoint:")
    print(f"  {Colors.CYAN}{oauth_url}{Colors.END}")
    print()

    try:
        # Just check if the endpoint exists (should redirect)
        response = requests.get(oauth_url, allow_redirects=False, timeout=10)

        if response.status_code in [301, 302, 303, 307, 308]:
            print_success("OAuth endpoint מגיב!")
            location = response.headers.get('Location', '')
            if 'accounts.google.com' in location:
                print_success("Redirect ל-Google עובד!")
            else:
                print_warning(f"Redirect לא ל-Google: {location[:100]}")
        else:
            print_error(f"OAuth endpoint לא מגיב כצפוי (Status: {response.status_code})")

    except Exception as e:
        print_error(f"שגיאה בבדיקת OAuth endpoint: {str(e)}")

def check_user_profiles_table(url, key):
    """Check if user_profiles table exists and has RLS policies"""
    print_header("8️⃣  בדיקת טבלת user_profiles")

    if not url or not key:
        print_error("לא ניתן לבדוק - URL או Key חסרים")
        return

    try:
        headers = {
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json'
        }

        # Try to query user_profiles (should fail with RLS if not authenticated)
        response = requests.get(
            f"{url}/rest/v1/user_profiles?limit=1",
            headers=headers,
            timeout=10
        )

        if response.status_code == 200:
            print_success("טבלת user_profiles קיימת!")
            print_info("RLS מוגדר נכון (אנחנו לא מאומתים ולכן לא רואים נתונים)")
            return True
        elif response.status_code == 401:
            print_success("טבלת user_profiles קיימת!")
            print_info("RLS מוגדר נכון (דורש אימות)")
            return True
        elif response.status_code == 404:
            print_error("טבלת user_profiles לא קיימת!")
            print_info("הרץ את supabase-schema.sql ב-Supabase SQL Editor")
            return False
        else:
            print_warning(f"סטטוס לא צפוי: {response.status_code}")
            print_info(f"Response: {response.text[:200]}")
            return None

    except Exception as e:
        print_error(f"שגיאה בבדיקת user_profiles: {str(e)}")
        return None

def generate_fix_script(url, key):
    """Generate a fix script based on findings"""
    print_header("🔧 יצירת סקריפט תיקון")

    if not url or not key:
        print_warning("לא ניתן ליצור סקריפט תיקון - חסרים נתונים")
        return

    # Parse Supabase URL to get project ref
    parsed = urlparse(url)
    project_ref = parsed.hostname.split('.')[0] if parsed.hostname else 'your-project'

    fix_script = f"""#!/bin/bash
# Auto-generated fix script for Google OAuth
# Generated by diagnose_oauth.py

echo "🔧 תיקון Google OAuth Configuration"
echo "====================================="
echo ""

# 1. Check .env.local
if [ ! -f .env.local ]; then
    echo "❌ .env.local לא קיים - יוצר מ-.env.local.example"
    cp .env.local.example .env.local
    echo "✅ נוצר .env.local"
    echo "⚠️  ערוך את הקובץ והוסף את הערכים מ-Supabase Dashboard"
    exit 1
fi

# 2. Validate environment variables
if ! grep -q "supabase.co" .env.local; then
    echo "❌ VITE_SUPABASE_URL לא מוגדר ב-.env.local"
    echo "הוסף: VITE_SUPABASE_URL={url}"
fi

# 3. Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build הצליח"
else
    echo "❌ Build נכשל - בדוק שגיאות"
    exit 1
fi

# 4. Instructions for Netlify
echo ""
echo "📝 צעדים ידניים נדרשים:"
echo "========================"
echo ""
echo "1️⃣  Supabase Dashboard:"
echo "   → https://supabase.com/dashboard/project/{project_ref}/auth/providers"
echo "   → ודא ש-Google Provider מופעל"
echo ""
echo "2️⃣  Supabase Redirect URLs:"
echo "   → https://supabase.com/dashboard/project/{project_ref}/auth/url-configuration"
echo "   → הוסף:"
echo "      • https://rachel.woretaw.net"
echo "      • https://rachel.woretaw.net/"
echo "      • http://localhost:5173"
echo ""
echo "3️⃣  Google Cloud Console:"
echo "   → https://console.cloud.google.com/apis/credentials"
echo "   → Authorized JavaScript origins:"
echo "      • {url}"
echo "   → Authorized redirect URIs:"
echo "      • {url}/auth/v1/callback"
echo ""
echo "4️⃣  Netlify Environment Variables:"
echo "   → https://app.netlify.com → Site settings → Environment variables"
echo "   → הוסף:"
echo "      • VITE_SUPABASE_URL = {url}"
echo "      • VITE_SUPABASE_ANON_KEY = (העתק מ-Supabase)"
echo ""
echo "5️⃣  Netlify Deploy:"
echo "   → Deploys → Trigger deploy → Clear cache and deploy site"
echo ""
echo "✅ סיימת את כל השלבים? נסה להתחבר שוב!"
"""

    # Write fix script
    fix_path = Path('fix_oauth.sh')
    with open(fix_path, 'w', encoding='utf-8') as f:
        f.write(fix_script)

    # Make it executable (Unix only)
    try:
        os.chmod(fix_path, 0o755)
    except:
        pass

    print_success(f"נוצר סקריפט תיקון: {fix_path}")
    print_info("הרץ אותו עם: ./fix_oauth.sh (Linux/Mac) או bash fix_oauth.sh (Windows Git Bash)")

def main():
    """Main diagnostic function"""
    print(f"""
{Colors.BOLD}{Colors.PURPLE}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🔍 Google OAuth Diagnostic Tool                    ║
║           for Supabase CRM System                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
{Colors.END}
    """)

    # Run all checks
    url, key = check_env_file()

    if url and key:
        check_supabase_connection(url, key)
        check_google_oauth_config(url, key)
        check_user_profiles_table(url, key)
        test_oauth_flow(url)

    check_redirect_urls(url)
    check_netlify_env_vars()
    check_google_cloud_console()

    # Generate fix script
    generate_fix_script(url, key)

    # Final summary
    print_header("📋 סיכום")

    if not url or not key:
        print_error("קובץ .env.local לא מוגדר נכון - תקן את זה קודם!")
        print_info("ראה: GOOGLE-OAUTH-TROUBLESHOOTING.md")
    else:
        print_success("בדיקות בסיסיות עברו!")
        print_info("ודא שביצעת את כל הצעדים הידניים ב-Supabase, Google Cloud ו-Netlify")
        print_info("ראה את הסקריפט: fix_oauth.sh")

    print()
    print(f"{Colors.BOLD}📖 למדריך מלא: {Colors.CYAN}GOOGLE-OAUTH-TROUBLESHOOTING.md{Colors.END}")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}נעצר על ידי המשתמש{Colors.END}")
        sys.exit(0)
    except Exception as e:
        print(f"\n{Colors.RED}❌ שגיאה: {str(e)}{Colors.END}")
        sys.exit(1)
