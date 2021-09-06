import Stripe from "stripe";

class StripeBuilder {
  private static _stripe: Stripe;

  public static build(): Stripe
  {
      // Do you need arguments? Make it a regular static method instead.
      if(!this._stripe)
        this._stripe = new Stripe(process.env.STRIPE_KEY!,{
          apiVersion: '2020-08-27'
        });
      return this._stripe  
  }  
}

export const stripe = StripeBuilder.build();