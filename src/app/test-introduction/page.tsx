"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function TestIntroduction() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testIntroductionAccess() {
      try {
        // Step 1: Check authentication
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          setAuthStatus({ error: authError.message });
          setLoading(false);
          return;
        }

        if (!user) {
          setAuthStatus({ error: "No user logged in" });
          setLoading(false);
          return;
        }

        setAuthStatus({
          success: true,
          userId: user.id,
          email: user.email,
        });

        // Step 2: Try to query introduction table
        console.log("Attempting to query introduction for user:", user.id);

        const { data, error: queryError } = await supabase
          .from("introduction")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (queryError) {
          console.error("Query error:", queryError);
          setError({
            code: queryError.code,
            message: queryError.message,
            details: queryError.details,
            hint: queryError.hint,
          });
        } else {
          setQueryResult(data || "No data found (null result)");
        }

        // Step 3: Also try a simple count query
        const { count, error: countError } = await supabase
          .from("introduction")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        console.log("Count query result:", { count, error: countError });
      } catch (err) {
        console.error("Unexpected error:", err);
        setError({ unexpected: err });
      } finally {
        setLoading(false);
      }
    }

    testIntroductionAccess();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Introduction Table Access Test
      </h1>

      {loading && <p>Loading...</p>}

      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Authentication Status:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </div>

        {error && (
          <div className="bg-red-100 p-4 rounded">
            <h2 className="font-bold mb-2 text-red-700">Error:</h2>
            <pre className="text-sm overflow-auto text-red-600">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        {queryResult && (
          <div className="bg-green-100 p-4 rounded">
            <h2 className="font-bold mb-2 text-green-700">Query Result:</h2>
            <pre className="text-sm overflow-auto text-green-600">
              {JSON.stringify(queryResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-bold mb-2 text-blue-700">Instructions:</h2>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>Make sure you're logged in as a user (not HR admin)</li>
            <li>Check the console for additional logs</li>
            <li>
              If you see a 406 error, run the migration script in Supabase
            </li>
            <li>
              The migration file is:
              supabase/migrations/20240401000000_fix_introduction_rls.sql
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
