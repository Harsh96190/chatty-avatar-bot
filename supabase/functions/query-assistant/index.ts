
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Gemini API key
const geminiApiKey = Deno.env.get("GEMINI_API_KEY") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, user_id, language } = await req.json();
    
    if (!query) {
      throw new Error("Query parameter is required");
    }
    
    // Store user query in database
    await supabase.from("user_queries").insert({
      user_id: user_id || null,
      query,
      language: language || "en-US",
    });

    // First try to find an answer in the knowledge base
    // For now, simple text matching since we don't have embeddings yet
    const { data: knowledgeBaseResults } = await supabase
      .from("knowledge_base")
      .select("question, answer")
      .ilike("question", `%${query}%`)
      .limit(1);

    // If we found a match in the knowledge base, return it
    if (knowledgeBaseResults && knowledgeBaseResults.length > 0) {
      return new Response(
        JSON.stringify({
          source: "knowledge_base",
          answer: knowledgeBaseResults[0].answer,
          question: knowledgeBaseResults[0].question,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no match in knowledge base, use Gemini API
    if (!geminiApiKey) {
      throw new Error("Gemini API key not configured");
    }

    // Use the Gemini 1.5 Pro model as suggested
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: query,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${await geminiResponse.text()}`);
    }

    const geminiData = await geminiResponse.json();
    
    // Extract the response text from Gemini API
    const geminiAnswer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I'm sorry, I couldn't generate a response at this time.";

    return new Response(
      JSON.stringify({
        source: "gemini",
        answer: geminiAnswer,
        question: query,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in query-assistant function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
