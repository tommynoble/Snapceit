import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    console.log("Starting batch categorization job...");

    // Fetch all receipts with status 'ocr_done' (ready for categorization)
    const { data: receipts, error: fetchError } = await supabase
      .from("receipts")
      .select("id, user_id, vendor_text, total_amount, currency, receipt_date, country")
      .eq("status", "ocr_done")
      .limit(100); // Process 100 at a time

    if (fetchError) throw fetchError;

    if (!receipts || receipts.length === 0) {
      console.log("No receipts to process");
      return new Response(
        JSON.stringify({ message: "No receipts to process", processed: 0 }),
        { status: 200 }
      );
    }

    console.log(`Found ${receipts.length} receipts to process`);

    // Call categorize function for each receipt
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const receipt of receipts) {
      try {
        console.log(`Categorizing receipt ${receipt.id}...`);

        const response = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/categorize`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({ receipt_id: receipt.id }),
          }
        );

        const result = await response.json();

        if (response.ok) {
          successCount++;
          console.log(`✓ Categorized receipt ${receipt.id}:`, result);
        } else {
          errorCount++;
          console.error(`✗ Failed to categorize receipt ${receipt.id}:`, result);
        }

        results.push({
          receipt_id: receipt.id,
          success: response.ok,
          result,
        });
      } catch (error) {
        errorCount++;
        console.error(`✗ Error categorizing receipt ${receipt.id}:`, error);
        results.push({
          receipt_id: receipt.id,
          success: false,
          error: String(error),
        });
      }
    }

    console.log(
      `Batch processing complete: ${successCount} succeeded, ${errorCount} failed`
    );

    return new Response(
      JSON.stringify({
        message: "Batch processing complete",
        processed: results.length,
        succeeded: successCount,
        failed: errorCount,
        results,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in batch processing:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500 }
    );
  }
});
