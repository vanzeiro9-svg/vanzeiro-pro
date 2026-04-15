import { supabase } from "@/lib/supabase";

type CheckoutMode = "new" | "reactivation";
type CheckoutOptions = {
  couponId?: string;
};

export async function startStripeCheckout(mode: CheckoutMode = "new", options: CheckoutOptions = {}) {
  const origin = window.location.origin;

  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: {
      mode,
      couponId: options.couponId,
      successUrl: `${origin}/dashboard?checkout=success`,
      cancelUrl: `${origin}/planos?checkout=cancel`,
    },
  });

  if (error) throw error;

  if (!data?.url) {
    throw new Error("Não foi possível iniciar o checkout.");
  }

  window.location.assign(data.url);
}
