#!/usr/bin/env node

/**
 * Quick test to verify CSRF token handling
 */

const http = require("http");

const HOST = "localhost";
const PORT = 3000;

async function testCSRFToken() {
  console.log("🔐 Testing CSRF Token Handling...\n");

  try {
    // Test 1: GET request should set CSRF token
    console.log("1. Testing GET request for CSRF token...");
    const response = await fetch(`http://${HOST}:${PORT}/hr-admin/dashboard`, {
      method: "GET",
      credentials: "include",
    });

    const cookies = response.headers.get("set-cookie");
    const hasCSRFToken = cookies && cookies.includes("csrf-token=");

    console.log(`   Status: ${response.status}`);
    console.log(`   CSRF Token Set: ${hasCSRFToken ? "✅" : "❌"}`);

    if (hasCSRFToken) {
      console.log("   ✅ CSRF token is being set correctly");
    } else {
      console.log("   ❌ CSRF token not found in response cookies");
    }
  } catch (error) {
    console.log("❌ Test failed - make sure the dev server is running:");
    console.log("   npm run dev");
    console.log(`   Error: ${error.message}`);
  }
}

// Only run if server is available
async function checkServer() {
  try {
    const response = await fetch(`http://${HOST}:${PORT}/`, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log("🚀 Please start the development server first:");
    console.log("   npm run dev");
    console.log("\nThen run this test again.");
    return;
  }

  await testCSRFToken();

  console.log("\n📝 How to test email functionality:");
  console.log("1. Go to HR Admin Dashboard");
  console.log("2. Try sending an invitation email");
  console.log("3. Check browser console for CSRF initialization logs");
  console.log('4. Verify emails send without "CSRF token not found" errors');
}

main().catch(console.error);
