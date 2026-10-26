export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const name = formData.get('Name');
    const email = formData.get('Email');
    const nachricht = formData.get('Nachricht');

    // Validierung
    if (!name || !email || !nachricht) {
      return new Response(JSON.stringify({ error: 'Bitte alle Felder ausfüllen.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Anfrage an Resend senden
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Einklick Fotografie <onboarding@resend.dev>',
        to: ['einklick.fotografie@gmail.com'], // EXACT Kleinbuchstaben wie im Fehler gefordert!
        reply_to: email,
        subject: `Neue Anfrage von ${name}`,
        text: `Neue Nachricht über das Kontaktformular:\n\nName: ${name}\nE-Mail: ${email}\n\nNachricht:\n${nachricht}`,
      }),
    });

    if (resendResponse.ok) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      const errorData = await resendResponse.json();
      return new Response(JSON.stringify({ error: 'Fehler beim Mailversand', details: errorData }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}