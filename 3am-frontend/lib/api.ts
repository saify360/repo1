const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = {
  // Feed
  async getFeed(limit = 20) {
    const res = await fetch(`${API_URL}/api/content/feed?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch feed');
    return res.json();
  },

  // Users
  async getCreator(username: string) {
    const res = await fetch(`${API_URL}/api/users/${username}`);
    if (!res.ok) throw new Error('Failed to fetch creator');
    return res.json();
  },

  async registerUser(data: any) {
    const res = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to register');
    return res.json();
  },

  // Payments
  async getBalance(userId: string) {
    const res = await fetch(`${API_URL}/api/payments/balance/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch balance');
    return res.json();
  },

  async createPaymentIntent(userId: string, amount: number) {
    const res = await fetch(`${API_URL}/api/payments/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, amount }),
    });
    if (!res.ok) throw new Error('Failed to create payment intent');
    return res.json();
  },

  async tipCreator(fromUserId: string, toUsername: string, amount: number, contentId?: string) {
    const res = await fetch(`${API_URL}/api/payments/tip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_user_id: fromUserId,
        to_creator_username: toUsername,
        amount,
        content_id: contentId,
      }),
    });
    if (!res.ok) throw new Error('Failed to send tip');
    return res.json();
  },

  async purchaseCredits(userId: string, amount: number, paymentMethodId: string) {
    const res = await fetch(`${API_URL}/api/payments/credits/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        amount,
        payment_method_id: paymentMethodId,
      }),
    });
    if (!res.ok) throw new Error('Failed to purchase credits');
    return res.json();
  },

  // Store
  async getStore(storeId: string) {
    const res = await fetch(`${API_URL}/api/stores/${storeId}`);
    if (!res.ok) throw new Error('Failed to fetch store');
    return res.json();
  },

  async getProducts(storeId: string) {
    const res = await fetch(`${API_URL}/api/stores/${storeId}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async purchaseProduct(userId: string, productId: string) {
    const res = await fetch(`${API_URL}/api/products/${productId}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) throw new Error('Failed to purchase product');
    return res.json();
  },
};
