import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { SimpleOrderConfirmationEmail } from '@/utils/email-templates/SimpleOrderConfirmationEmail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email requis' 
      }, { status: 400 });
    }

    // Données de test simples
    const orderItems = [
      'Photo Numérique - Session Surf La Torche',
      'Photo Numérique - Action Wave',
    ];

    const { data, error } = await resend.emails.send({
      from: 'Arode Studio <onboarding@resend.dev>',
      to: email,
      subject: '✅ Commande confirmée - Arode Studio',
      react: SimpleOrderConfirmationEmail({
        customerName: 'Test Customer',
        totalPrice: 30,
        orderItems: orderItems
      })
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email de confirmation simple envoyé !',
      emailId: data?.id 
    });

  } catch (error) {
    console.error('Erreur endpoint test simple:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}