const { notificationWebhookUrl } = require('../config/env');

let lastDelivery = { status: 'not_configured', deliveredAt: null, error: null };

async function sendNotification(payload) {
  if (!notificationWebhookUrl) {
    lastDelivery = { status: 'not_configured', deliveredAt: null, error: null };
    return lastDelivery;
  }
  try {
    const response = await fetch(notificationWebhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        text: `[NER Logistics] ${payload.severity || 'info'} alert: ${payload.message}`,
        alert: payload
      })
    });
    if (!response.ok) throw new Error(`Webhook returned HTTP ${response.status}`);
    lastDelivery = { status: 'delivered', deliveredAt: new Date().toISOString(), error: null };
  } catch (error) {
    lastDelivery = { status: 'failed', deliveredAt: null, error: error.message };
  }
  return lastDelivery;
}

function notificationStatus() {
  return { configured: Boolean(notificationWebhookUrl), ...lastDelivery };
}

module.exports = { sendNotification, notificationStatus };
