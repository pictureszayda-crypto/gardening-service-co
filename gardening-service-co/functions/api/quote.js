// Cloudflare Pages Function: POST /api/quote
// Required environment variables (Pages project > Settings > Variables and Secrets):
// RESEND_API_KEY = Resend API key (secret)
// QUOTE_TO_EMAIL = inbox receiving quote requests
// QUOTE_FROM_EMAIL = verified sender, e.g. quotes@your-verified-domain.com
export async function onRequestPost({ request, env }) {
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers });

  if (!env.RESEND_API_KEY || !env.QUOTE_TO_EMAIL || !env.QUOTE_FROM_EMAIL) {
    return json(503, { error: 'The quote form is not configured yet. Please call 818-915-7442 or email blancatreeservices@gmail.com.' });
  }

  let form;
  try { form = await request.formData(); }
  catch { return json(400, { error: 'Please submit the form again.' }); }

  // Basic bot trap. Real users leave this hidden field empty.
  if (String(form.get('website') || '').trim()) return json(200, { ok: true });

  const name = clean(form.get('name'), 120);
  const phone = clean(form.get('phone'), 40);
  const email = clean(form.get('email'), 200);
  const location = clean(form.get('location'), 240);
  const service = clean(form.get('service'), 100);
  const message = clean(form.get('message'), 5000);
  const photoLinks = clean(form.get('photoLinks'), 500);
  const consent = form.get('consent') === 'yes';

  if (!name || !phone || !email || !service || !message || !consent) {
    return json(400, { error: 'Please complete all required fields and confirm that we may contact you.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { error: 'Please enter a valid email address.' });
  if (/[\r\n]/.test(email)) return json(400, { error: 'Please check the email address and try again.' });

  const textBody = [
    'New Gardening Service Co. quote request',
    '',
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    `Property location: ${location || 'Not provided'}`,
    `Service: ${service}`,
    `Photo link: ${photoLinks || 'Not provided'}`,
    '',
    'Project details:',
    message
  ].join('\n');

  let result;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.QUOTE_FROM_EMAIL,
        to: [env.QUOTE_TO_EMAIL],
        reply_to: email,
        subject: `Website quote request: ${service} — ${name}`,
        text: textBody
      })
    });
    result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Resend send failed', response.status, result?.message || result?.name || 'Unknown error');
      return json(502, { error: 'We could not send your request right now. Please call 818-915-7442 or email blancatreeservices@gmail.com.' });
    }
  } catch (error) {
    console.error('Quote email request failed', error);
    return json(502, { error: 'We could not send your request right now. Please call 818-915-7442 or email blancatreeservices@gmail.com.' });
  }

  return json(200, { ok: true });
}

function clean(value, maxLength) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}
