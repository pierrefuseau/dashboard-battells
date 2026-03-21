import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iikppeldebhhqliepudo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpa3BwZWxkZWJoaHFsaWVwdWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwOTQwNzEsImV4cCI6MjA4OTY3MDA3MX0.NY5R-3cOoIH0b9QMQ5cVfeHLxG6MZVtLdNKCWjMJWZQ'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data } = await supabase
    .from('yt_daily_stats')
    .select('date')
    
  const dates = new Set((data || []).map(r => r.date))
  console.log('Dates mapped:', Array.from(dates))
}

test()
