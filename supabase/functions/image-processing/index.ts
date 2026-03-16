// Edge function: image-processing
// Listens for Supabase Storage object events and, for now,
// simply returns a JSON payload confirming the upload.

Deno.serve(async (req) => {
  try {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers":
        req.headers.get("Access-Control-Request-Headers") ??
        "content-type, authorization, apikey, x-client-info",
    };

    // Handle CORS preflight requests from the browser
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Handle cases where there is no JSON body (e.g. test invocations, GET requests)
    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ message: "missing or invalid JSON body" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        },
      );
    }

    const { bucket_id: bucketId, object_path: objectPath } = (payload ?? {}) as {
      bucket_id?: string;
      object_path?: string;
    };

    console.log("image-processing invoked with:", {
      bucket_id: bucketId,
      object_path: objectPath,
    });

    return new Response(
      JSON.stringify({ message: "file uploaded" }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  } catch (error) {
    console.error("Error in image-processing function:", error);

    return new Response(
      JSON.stringify({ message: "internal error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  }
});

