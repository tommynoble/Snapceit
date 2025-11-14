-- Enable the http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;

-- Create webhook trigger function for receipts
CREATE OR REPLACE FUNCTION public.trigger_receipt_webhook()
RETURNS TRIGGER AS $$
DECLARE
  response http_response;
BEGIN
  -- Call the Lambda function via HTTP POST
  SELECT * INTO response FROM http_post(
    'https://k5hrkbdnr3l53wllyhtrrduqqm0qvkzm.lambda-url.us-east-1.on.aws/',
    jsonb_build_object(
      'type', 'INSERT',
      'record', row_to_json(NEW),
      'table', 'receipts'
    )::text,
    'application/json'
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the insert
  RAISE WARNING 'Webhook trigger error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS receipt_webhook_trigger ON public.receipts;

-- Create the trigger
CREATE TRIGGER receipt_webhook_trigger
AFTER INSERT ON public.receipts
FOR EACH ROW
EXECUTE FUNCTION public.trigger_receipt_webhook();
