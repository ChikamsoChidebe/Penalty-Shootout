# Supabase Database Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for the project to be ready (2-3 minutes)

## 2. Get Your Credentials

1. Go to Project Settings → API
2. Copy your Project URL and anon public key
3. Update your `.env` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Run the Database Schema

1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the sidebar
3. Copy and paste the entire contents of `database/schema.sql`
4. Click "Run" to execute the schema

## 4. Verify Setup

After running the schema, you should see these tables in your Database:
- `players` - Stores player information and stats
- `matches` - Stores match data and results
- `game_rounds` - Stores individual round data
- `transactions` - Tracks blockchain transactions

## 5. Test the Integration

1. Start your development server: `npm run dev`
2. Connect your wallet
3. Create a test match
4. Check your Supabase dashboard to see data being stored

## Database Features

### Automatic Updates
- Player stats update automatically when matches finish
- Win rates calculated automatically
- Last active timestamps updated on wallet interactions

### Real-time Data
- All stats are pulled from live database
- Leaderboard updates in real-time
- Match history tracked permanently

### Security
- Row Level Security (RLS) enabled
- Public read access for leaderboards and stats
- Secure write operations

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and key are correct
- Check that your project is active (not paused)
- Ensure you're using the anon key, not the service key

### Schema Errors
- Make sure you ran the complete schema.sql file
- Check for any error messages in the SQL editor
- Verify all tables were created successfully

### Data Not Updating
- Check browser console for errors
- Verify RLS policies are set correctly
- Ensure triggers are working (check Functions tab)

## Production Considerations

1. **Remove Demo Data**: Delete the demo players from the `players` table
2. **Backup Strategy**: Set up automated backups in Supabase
3. **Monitoring**: Enable database monitoring and alerts
4. **Rate Limiting**: Consider implementing rate limiting for API calls