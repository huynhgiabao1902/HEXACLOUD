// Script to check Supabase configuration
console.log("🔍 Checking Supabase Configuration...")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("\n📋 Environment Variables:")
console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl || "❌ Not set")
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "✅ Set" : "❌ Not set")

// Validate URL format
if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl)
    if (url.hostname.includes("supabase.co")) {
      console.log("✅ URL format looks correct")
    } else {
      console.log("⚠️  URL doesn't look like a Supabase URL")
    }
  } catch (error) {
    console.log("❌ Invalid URL format")
  }
} else {
  console.log("❌ Supabase URL not configured")
}

// Validate key format
if (supabaseKey) {
  if (supabaseKey.length > 50) {
    console.log("✅ Anon key format looks correct")
  } else {
    console.log("⚠️  Anon key seems too short")
  }
} else {
  console.log("❌ Supabase anon key not configured")
}

console.log("\n🔧 Next steps if configuration is missing:")
console.log("1. Go to your Supabase dashboard")
console.log("2. Navigate to Settings > API")
console.log("3. Copy the Project URL and anon public key")
console.log("4. Add them to your .env.local file")
console.log("5. Restart your development server")

console.log("\n📚 Supabase Dashboard URL:")
if (supabaseUrl) {
  const projectRef = supabaseUrl.split("//")[1]?.split(".")[0]
  if (projectRef) {
    console.log(`https://supabase.com/dashboard/project/${projectRef}`)
  }
}
