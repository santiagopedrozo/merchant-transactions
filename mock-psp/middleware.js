module.exports = (req, res, next) => {
  // Simular comportamiento de PSP
  
  // Headers de PSP
  res.setHeader('X-PSP-Version', '2023-10-16');
  res.setHeader('X-Request-Id', `req_${Date.now()}`);
  
  // POST /v1/payment_intents - Crear pago
  if (req.method === 'POST' && req.path === '/v1/payment_intents') {
    const paymentId = `pay_${Date.now()}`;
    const now = Math.floor(Date.now() / 1000);
    
    // Simular diferentes respuestas basadas en el amount
    let status = 'succeeded';
    if (req.body.amount === 666) {
      status = 'requires_payment_method'; // Simular fallo
    } else if (req.body.amount === 777) {
      status = 'processing'; // Simular procesamiento async
    }
    
    const payment = {
      id: paymentId,
      amount: req.body.amount,
      currency: req.body.currency || 'usd',
      status: status,
      payment_method: {
        type: 'card',
        card: {
          brand: 'visa',
          last4: req.body.payment_method?.card?.number?.slice(-4) || '4242',
          exp_month: req.body.payment_method?.card?.exp_month || 12,
          exp_year: req.body.payment_method?.card?.exp_year || 2025
        }
      },
      metadata: req.body.metadata || {},
      created: now,
      description: req.body.description || 'Payment processed'
    };
    
    // Si el pago es exitoso, crear webhook automáticamente
    if (status === 'succeeded') {
      // Simular delay de webhook (opcional)
      setTimeout(() => {
        const webhook = {
          id: `evt_${Date.now()}`,
          type: 'payment.succeeded',
          data: {
            object: payment
          },
          created: Math.floor(Date.now() / 1000)
        };
        
        // En un escenario real, esto se enviaría via HTTP POST a tu endpoint
        console.log('🔔 Webhook simulado:', webhook);
        
        // Opcional: hacer POST real a tu app
        // fetch('http://localhost:3000/webhooks/psp', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(webhook)
        // }).catch(console.error);
      }, 1000);
    }
    
    res.status(201).json(payment);
    return;
  }
  
  // GET /v1/payment_intents/:id - Obtener pago
  if (req.method === 'GET' && req.path.startsWith('/v1/payment_intents/')) {
    const paymentId = req.path.split('/').pop();
    // JSON Server manejará esto automáticamente
  }
  
  // POST /v1/refunds - Crear reembolso
  if (req.method === 'POST' && req.path === '/v1/refunds') {
    const refundId = `re_${Date.now()}`;
    const now = Math.floor(Date.now() / 1000);
    
    const refund = {
      id: refundId,
      payment_id: req.body.payment_intent,
      amount: req.body.amount,
      status: 'succeeded',
      created: now,
      reason: req.body.reason || 'requested_by_customer'
    };
    
    res.status(201).json(refund);
    return;
  }
  
  next();
};