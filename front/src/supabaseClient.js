import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://enyqowqznpyiozbcrrzu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVueXFvd3F6bnB5aW96YmNycnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MTI2MjMsImV4cCI6MjA4MDE4ODYyM30.N5vY7Kx79SOfXc28LmHCSQK7rKpZ99J2sLvJoLCMrRg";

export const supabase = createClient(supabaseUrl, supabaseKey);
