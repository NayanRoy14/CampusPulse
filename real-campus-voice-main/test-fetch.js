import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zoriujlmxojjdxsdqrcz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvcml1amxteG9qamR4c2RxcmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2Mzc1OTAsImV4cCI6MjA5MDIxMzU5MH0.KZWFRcLuD7sbBEgqrpuxlC5qXkrrgUtIJ23wMP_6UW4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fetchPosts() {
  console.log('Fetching posts from Supabase...')
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error.message)
    process.exit(1)
  } else {
    console.log('Posts found in database:', data.length)
    console.log(JSON.stringify(data, null, 2))
    process.exit(0)
  }
}

fetchPosts()
