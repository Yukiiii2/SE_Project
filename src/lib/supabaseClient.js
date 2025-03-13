import { createClient } from '@supabase/supabase-js'

export const supabase = createClient('https://htxybqylbdrleiccxarx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eHlicXlsYmRybGVpY2N4YXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NzExMzYsImV4cCI6MjA1NzI0NzEzNn0.oeW9jIah3KzsSLeQvACdG-TmL9SpiTr3sKgmaVS3hJY')