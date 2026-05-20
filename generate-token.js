/**
 * Google OAuth Refresh Token Generator
 * 
 * Step 1: Replace CLIENT_ID and CLIENT_SECRET with your credentials.
 * Step 2: Run `node generate-token.js` in your terminal.
 * Step 3: Open the printed URL, log in to Google, and approve access.
 * Step 4: You will be redirected to your local app (http://localhost:5173/?code=XXXX...).
 * Step 5: Copy the "code" query parameter from the browser's address bar.
 * Step 6: Paste it into the prompt in the terminal, and hit Enter.
 * Step 7: Save the printed `refresh_token` and configure your Supabase secrets.
 */

import { google } from 'googleapis';
import readline from 'readline';
import process from 'process';

// Replace these values with yours!
const CLIENT_ID =
  "";
const CLIENT_SECRET = '';

// Using your active Vite port for a seamless redirection!
const REDIRECT_URI = 'http://localhost:5173'; 

if (CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID' || CLIENT_SECRET === 'YOUR_GOOGLE_CLIENT_SECRET') {
  console.log('\n❌ Please open generate-token.js and replace the CLIENT_ID and CLIENT_SECRET placeholders first.');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const scopes = ['https://www.googleapis.com/auth/calendar'];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: scopes,
});

console.log('\n========================================================================');
console.log('1. Open this URL in your web browser:\n');
console.log(url);
console.log('\n========================================================================');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('2. Paste the "code" query parameter from your redirected URL here: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    console.log('\n🎉 SUCCESS! Generated Google OAuth Credentials:');
    console.log('\n-------------------------------------------------------------');
    console.log(`GOOGLE_CLIENT_ID:      ${CLIENT_ID}`);
    console.log(`GOOGLE_CLIENT_SECRET:  ${CLIENT_SECRET}`);
    console.log(`GOOGLE_REFRESH_TOKEN:  ${tokens.refresh_token}`);
    console.log('-------------------------------------------------------------');
    console.log('\nSave these tokens! Next, set them in your Supabase project:\n');
    console.log(`supabase secrets set GOOGLE_CLIENT_ID="${CLIENT_ID}" GOOGLE_CLIENT_SECRET="${CLIENT_SECRET}" GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"\n`);
  } catch (error) {
    console.error('\n❌ Failed to retrieve tokens:', error.message);
  } finally {
    rl.close();
  }
});
