import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { OrderConfirmationWithDownloadsEmail } from '@/utils/email-templates/OrderConfirmationWithDownloadsEmail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    // Test data
    const testDownloads = [
      {
        photoId: 'test-photo-1',
        downloadUrl: 'https://example.com/download/photo1',
        thumbnailUrl: 'https://via.placeholder.com/300x200',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      },
      {
        photoId: 'test-photo-2', 
        downloadUrl: 'https://example.com/download/photo2',
        thumbnailUrl: 'https://via.placeholder.com/300x200',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { data, error } = await resend.emails.send({
      from: 'Arode Studio <contact@arodestudio.com>',
      to: email,
      subject: '🧪 Test - Vos photos Arode Studio sont prêtes !',
      react: OrderConfirmationWithDownloadsEmail({
        customerName: 'Test User',
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
      message: 'Email test envoyé !',
      emailId: data?.id 
    });

  } catch (error) {
    console.error('Erreur endpoint test:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}