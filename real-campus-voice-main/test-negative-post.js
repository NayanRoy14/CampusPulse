import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zoriujlmxojjdxsdqrcz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvcml1amxteG9qamR4c2RxcmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2Mzc1OTAsImV4cCI6MjA5MDIxMzU5MH0.KZWFRcLuD7sbBEgqrpuxlC5qXkrrgUtIJ23wMP_6UW4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function insertNegativePost() {
  console.log('Inserting negative sentiment post...')
  const { data, error } = await supabase.from('posts').insert([
    {
      user_id: 'tester_01',
      user_alias: 'AngryStudent',
      title: 'Terrible Mess Experience',
      content: 'The food today was completely inedible. This is unacceptable!',
      category: 'Food',
      sentiment_score: -0.85,
      status: 'Open'
    }
  ]).select()

  if (error) {
    console.error('Error inserting post:', error.message)
    process.exit(1)
  } else {
    console.log('Negative post inserted successfully! ID:', data[0].id)
    process.exit(0)
  }
}

insertNegativePost()
