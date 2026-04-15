import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    const stripePriceId = Deno.env.get("STRIPE_PRICE_ID") ?? "";
    const stripeCouponId = Deno.env.get("STRIPE_COUPON_ID") ?? "COLOQUE_AQUI_O_ID_DO_CUPOM";

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !stripeSecretKey || !stripePriceId) {
      throw new Error("Variáveis de ambiente obrigatórias não configuradas.");
    }

    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return new Response(JSON.stringify({ error: "Não autorizado." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Usuário inválido." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });

    const body = await req.json().catch(() => ({}));
    const checkoutMode = body.mode === "reactivation" ? "reactivation" : "new";
    const couponIdFromRequest =
      typeof body.couponId === "string" && body.couponId.trim().length > 0
        ? body.couponId.trim()
        : null;
    const successUrl = body.successUrl || `${new URL(req.url).origin}/dashboard?checkout=success`;
    const cancelUrl = body.cancelUrl || `${new URL(req.url).origin}/planos?checkout=cancel`;

    const { data: profile } = await adminClient
      .from("profiles")
      .select("stripe_customer_id, email, nome")
      .eq("user_id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id as string | null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? profile?.email ?? undefined,
        name: profile?.nome ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: false,
      discounts:
        checkoutMode === "reactivation" && (couponIdFromRequest || stripeCouponId)
          ? [{ coupon: couponIdFromRequest || stripeCouponId }]
          : undefined,
      subscription_data: {
        metadata: {
          user_id: user.id,
          checkout_mode: checkoutMode,
        },
      },
      metadata: {
        user_id: user.id,
        checkout_mode: checkoutMode,
      },
    });

    await adminClient
      .from("profiles")
      .update({
        stripe_customer_id: customerId,
        subscription_status: "pending",
        subscription_active: false,
      })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado no checkout.";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
