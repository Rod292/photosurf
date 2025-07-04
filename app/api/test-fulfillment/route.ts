import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { OrderConfirmationWithDownloadsEmail } from '@/utils/email-templates/OrderConfirmationWithDownloadsEmail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email requis' 
      }, { status: 400 });
    }

    // Données de test avec de vrais liens Supabase (mais factices)
    const testDownloads = [
      {
        photoId: 'test-photo-1',
        downloadUrl: 'https://chwddsmqzjzpfikuupuf.supabase.co/storage/v1/object/sign/originals/test-photo-1.jpg?token=test123&expires=1234567890',
        thumbnailUrl: 'https://chwddsmqzjzpfikuupuf.supabase.co/storage/v1/object/public/web-previews/test-photo-1-preview.jpg',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      },
      {
        photoId: 'test-photo-2', 
        downloadUrl: 'https://chwddsmqzjzpfikuupuf.supabase.co/storage/v1/object/sign/originals/test-photo-2.jpg?token=test456&expires=1234567890',
        thumbnailUrl: 'https://chwddsmqzjzpfikuupuf.supabase.co/storage/v1/object/public/web-previews/test-photo-2-preview.jpg',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { data, error } = await resend.emails.send({
      from: 'Arode Studio <contact@arodestudio.com>',
      to: email,
      subject: '📸 Vos photos Arode Studio sont prêtes !',
      react: OrderConfirmationWithDownloadsEmail({
        customerName: 'Test Customer',
        totalPrice: 30,
        downloads: testDownloads
      })
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email de fulfillment avec liens Supabase envoyé !',
      emailId: data?.id 
    });

  } catch (error) {
    console.error('Erreur test fulfillment:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}