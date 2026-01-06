const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { to, customerName, vehicle, flightDate, returnDate, status } = JSON.parse(event.body);

        let subject, html;

        if (status === 'accepted') {
            subject = '✅ Your DontPark Booking is Confirmed!';
            html = `
                <h2>Great news, ${customerName}!</h2>
                <p>Your booking has been accepted by the shop.</p>
                <p><strong>Vehicle:</strong> ${vehicle}</p>
                <p><strong>Drop-off Date:</strong> ${flightDate}</p>
                <p><strong>Return Date:</strong> ${returnDate}</p>
                <p>We'll be in touch with pickup details.</p>
                <p>Thanks for choosing DontPark!</p>
            `;
        } else {
            subject = 'DontPark Booking Update';
            html = `
                <h2>Hi ${customerName},</h2>
                <p>Unfortunately, the shop was unable to accept your booking at this time.</p>
                <p>Please try booking with another shop or contact us for assistance.</p>
                <p>Thanks for choosing DontPark!</p>
            `;
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'DontPark <onboarding@resend.dev>',
                to: to,
                subject: subject,
                html: html
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Resend error:', data);
            return { statusCode: 500, body: JSON.stringify({ error: 'Email failed' }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Email sent' })
        };

    } catch (error) {
        console.error('Function error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
