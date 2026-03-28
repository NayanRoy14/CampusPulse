import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zoriujlmxojjdxsdqrcz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvcml1amxteG9qamR4c2RxcmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2Mzc1OTAsImV4cCI6MjA5MDIxMzU5MH0.KZWFRcLuD7sbBEgqrpuxlC5qXkrrgUtIJ23wMP_6UW4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function insertPost() {
  console.log('Inserting post...')
  const { data, error } = await supabase.from('posts').insert([
    {
      user_id: 'anon_123',
      title: 'Bad mess food',
      content: 'Food quality is खराब',
      category: 'food'
    }
  ]).select()

  if (error) {
    console.error('Error inserting post:', error.message)
    process.exit(1)
  } else {
    console.log('Post inserted successfully:', data)
    process.exit(0)
  }
}

insertPost()
