/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Mercado Pago public key (Checkout Bricks / tarjeta en el sitio). Debe coincidir con la cuenta del MERCADOPAGO_ACCESS_TOKEN del backend. */
  readonly VITE_MERCADOPAGO_PUBLIC_KEY?: string;
  /** PayPal client id (Smart Buttons). Misma app que PAYPAL_CLIENT_ID del backend. */
  readonly VITE_PAYPAL_CLIENT_ID?: string;
}
