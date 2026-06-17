import { PRIVATE_STRIPE_API_KEY } from "$env/static/private"
import Stripe from "stripe"

// Временная заглушка для Stripe (если ключа нет)
let stripe: Stripe | null = null
try {
  if (PRIVATE_STRIPE_API_KEY && PRIVATE_STRIPE_API_KEY !== 'sk_test_placeholder_for_now') {
    stripe = new Stripe(PRIVATE_STRIPE_API_KEY, { apiVersion: "2023-08-16" })
  }
} catch (e) {
  console.warn('Stripe not configured')
}

// Заглушка для получения ID клиента
export async function getOrCreateCustomerId(userId: string, email: string): Promise<string | null> {
  // Если Stripe не настроен, возвращаем заглушку
  if (!stripe) {
    return `cust_${userId}_mock`
  }
  
  try {
    // Ищем клиента по email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    })
    
    if (customers.data.length > 0) {
      return customers.data[0].id
    }
    
    // Создаём нового клиента
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        userId: userId
      }
    })
    
    return customer.id
  } catch (error) {
    console.error('Error getting or creating customer:', error)
    return null
  }
}

// Заглушка для получения подписки
export async function fetchSubscription(customerId: string): Promise<any | null> {
  if (!stripe || !customerId) {
    return {
      id: 'sub_mock',
      status: 'active',
      plan: {
        id: 'price_free',
        nickname: 'Free'
      },
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
    }
  }
  
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    })
    
    if (subscriptions.data.length === 0) {
      return null
    }
    
    const sub = subscriptions.data[0]
    const plan = sub.items.data[0]?.price
    
    return {
      id: sub.id,
      status: sub.status,
      plan: plan ? {
        id: plan.id,
        nickname: plan.nickname || plan.id,
        amount: plan.unit_amount ? plan.unit_amount / 100 : 0,
        currency: plan.currency || 'usd'
      } : null,
      current_period_end: sub.current_period_end
    }
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return null
  }
}

// Экспорт для страницы подписок
export async function getSubscriptionStatus() {
  return { status: 'free', plan: 'free' }
}

export async function getSubscriptionDetails() {
  return null
}

export async function getSubscriptionPlans() {
  return [
    { id: 'free', name: 'Free', price: 0, features: ['Basic features'] },
    { id: 'pro', name: 'Pro', price: 29, features: ['All features'] }
  ]
}

// Функция для отмены подписки
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  if (!stripe || !subscriptionId) {
    return true // Заглушка: всегда успешно
  }
  
  try {
    await stripe.subscriptions.cancel(subscriptionId)
    return true
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return false
  }
}

// Функция для обновления подписки
export async function updateSubscription(subscriptionId: string, priceId: string): Promise<any | null> {
  if (!stripe) {
    return { id: subscriptionId, status: 'updated' }
  }
  
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: priceId
      }]
    })
    return updated
  } catch (error) {
    console.error('Error updating subscription:', error)
    return null
  }
}
