#!/usr/bin/env node

/**
 * Security Testing Script for Rezme v2.0
 *
 * This script tests the security implementations:
 * - CSRF protection
 * - Rate limiting
 * - Input validation
 * - Security headers
 */

const http = require("http");
const https = require("https");

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";
const isHttps = BASE_URL.startsWith("https");

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const client = isHttps ? https : http;

    const req = client.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testSecurityHeaders() {
  console.log("\n🔒 Testing Security Headers...");

  try {
    const response = await makeRequest({
      hostname: new URL(BASE_URL).hostname,
      port: new URL(BASE_URL).port || (isHttps ? 443 : 80),
      path: "/",
      method: "GET",
    });

    const headers = response.headers;
    const tests = [
      {
        name: "Content-Security-Policy",
        header: "content-security-policy",
        expected: true,
      },
      {
        name: "X-Content-Type-Options",
        header: "x-content-type-options",
        expected: "nosniff",
      },
      {
        name: "X-XSS-Protection",
        header: "x-xss-protection",
        expected: "1; mode=block",
      },
      {
        name: "X-Frame-Options",
        header: "x-frame-options",
        expected: "DENY",
      },
      {
        name: "Referrer-Policy",
        header: "referrer-policy",
        expected: "strict-origin-when-cross-origin",
      },
    ];

    tests.forEach((test) => {
      const headerValue = headers[test.header];
      if (test.expected === true) {
        console.log(
          `  ${headerValue ? "✅" : "❌"} ${test.name}: ${
            headerValue ? "Present" : "Missing"
          }`
        );
      } else {
        const matches = headerValue === test.expected;
        console.log(
          `  ${matches ? "✅" : "❌"} ${test.name}: ${headerValue || "Missing"}`
        );
      }
    });
  } catch (error) {
    console.error("❌ Error testing security headers:", error.message);
  }
}

async function testCSRFProtection() {
  console.log("\n🛡️ Testing CSRF Protection...");

  try {
    // Test POST request without CSRF token
    const response = await makeRequest(
      {
        hostname: new URL(BASE_URL).hostname,
        port: new URL(BASE_URL).port || (isHttps ? 443 : 80),
        path: "/api/send-email",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      JSON.stringify({
        to: "test@example.com",
        subject: "Test",
        html: "Test message",
      })
    );

    if (response.statusCode === 403) {
      console.log("  ✅ CSRF Protection: Request blocked without token");
    } else {
      console.log(
        `  ❌ CSRF Protection: Request allowed without token (Status: ${response.statusCode})`
      );
    }
  } catch (error) {
    console.error("❌ Error testing CSRF protection:", error.message);
  }
}

async function testRateLimiting() {
  console.log("\n⏱️ Testing Rate Limiting...");

  try {
    const requests = [];
    const numRequests = 12; // Should exceed the 10 request limit

    for (let i = 0; i < numRequests; i++) {
      requests.push(
        makeRequest(
          {
            hostname: new URL(BASE_URL).hostname,
            port: new URL(BASE_URL).port || (isHttps ? 443 : 80),
            path: "/api/send-email",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          },
          JSON.stringify({
            to: "test@example.com",
            subject: "Rate limit test",
            html: "Test message",
          })
        )
      );
    }

    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter((r) => r.statusCode === 429);

    if (rateLimitedResponses.length > 0) {
      console.log(
        `  ✅ Rate Limiting: ${rateLimitedResponses.length} requests rate limited`
      );
    } else {
      console.log("  ❌ Rate Limiting: No requests were rate limited");
    }
  } catch (error) {
    console.error("❌ Error testing rate limiting:", error.message);
  }
}

async function testInputValidation() {
  console.log("\n🔍 Testing Input Validation...");

  try {
    const testCases = [
      {
        name: "Invalid Email",
        data: { to: "invalid-email", subject: "Test", html: "Test" },
        expectedStatus: 400,
      },
      {
        name: "Missing Required Fields",
        data: { to: "test@example.com" },
        expectedStatus: 400,
      },
      {
        name: "Script Injection",
        data: {
          to: "test@example.com",
          subject: "Test",
          html: '<script>alert("xss")</script>',
        },
        expectedStatus: 400,
      },
    ];

    for (const testCase of testCases) {
      const response = await makeRequest(
        {
          hostname: new URL(BASE_URL).hostname,
          port: new URL(BASE_URL).port || (isHttps ? 443 : 80),
          path: "/api/send-email",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
        JSON.stringify(testCase.data)
      );

      const passed = response.statusCode === testCase.expectedStatus;
      console.log(
        `  ${passed ? "✅" : "❌"} ${testCase.name}: Status ${
          response.statusCode
        } (Expected: ${testCase.expectedStatus})`
      );
    }
  } catch (error) {
    console.error("❌ Error testing input validation:", error.message);
  }
}

async function testHTTPMethods() {
  console.log("\n🚫 Testing HTTP Method Restrictions...");

  try {
    const methods = ["GET", "PUT", "DELETE", "PATCH"];

    for (const method of methods) {
      const response = await makeRequest({
        hostname: new URL(BASE_URL).hostname,
        port: new URL(BASE_URL).port || (isHttps ? 443 : 80),
        path: "/api/send-email",
        method: method,
      });

      const blocked = response.statusCode === 405;
      console.log(
        `  ${blocked ? "✅" : "❌"} ${method} Method: ${
          blocked ? "Blocked" : "Allowed"
        } (Status: ${response.statusCode})`
      );
    }
  } catch (error) {
    console.error("❌ Error testing HTTP methods:", error.message);
  }
}

async function runSecurityTests() {
  console.log("🔐 Rezme v2.0 Security Test Suite");
  console.log("==================================");
  console.log(`Testing against: ${BASE_URL}`);

  await testSecurityHeaders();
  await testCSRFProtection();
  await testRateLimiting();
  await testInputValidation();
  await testHTTPMethods();

  console.log("\n✨ Security testing complete!");
  console.log(
    "\nNote: Some tests may show as failed if the server is not running"
  );
  console.log(
    "or if you are testing against production with different configurations."
  );
}

// Run the tests
if (require.main === module) {
  runSecurityTests().catch(console.error);
}

module.exports = {
  runSecurityTests,
  testSecurityHeaders,
  testCSRFProtection,
  testRateLimiting,
  testInputValidation,
  testHTTPMethods,
};
