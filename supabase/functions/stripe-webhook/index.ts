import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

function isActiveSubscription(status: string) {
  return status === "active";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

    if (!supabaseUrl || !supabaseServiceRoleKey || !stripeSecretKey || !stripeWebhookSecret) {
      throw new Error("Variáveis de ambiente do webhook não configuradas.");
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("Assinatura do Stripe ausente.");

    const payload = await req.text();
    const event = await stripe.webhooks.constructEventAsync(payload, signature, stripeWebhookSecret);

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = String(session.customer ?? "");
      const subscriptionId = String(session.subscription ?? "");

      if (customerId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const status = subscription.status;

        await adminClient
          .from("profiles")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: status,
            subscription_active: isActiveSubscription(status),
          })
          .eq("stripe_customer_id", customerId);
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = String(subscription.customer ?? "");
      const status = subscription.status;

      if (customerId) {
        await adminClient
          .from("profiles")
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: status,
            subscription_active: isActiveSubscription(status),
          })
          .eq("stripe_customer_id", customerId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado no webhook.";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
