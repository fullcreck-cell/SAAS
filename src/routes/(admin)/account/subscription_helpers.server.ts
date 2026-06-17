// import { PRIVATE_STRIPE_API_KEY } from "$env/static/private"
// import Stripe from "stripe"
// const stripe = new Stripe(PRIVATE_STRIPE_API_KEY, { apiVersion: "2023-08-16" })

// Временная заглушка
export async function getSubscriptionStatus() {
  return { status: 'free', plan: 'free' }
}

export async function getSubscriptionDetails() {
  return null
}
