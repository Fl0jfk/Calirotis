import { type NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';


export async function POST(request: NextRequest) {
  const { email, name, message, telephone, numberInv, date, dateAMPM, location } = await request.json();

  const transport = nodemailer.createTransport({
    service: 'gmail',
      auth: {
        user: process.env.NEXT_PUBLIC_MY_EMAIL,
        pass: process.env.NEXT_PUBLIC_MY_PASSWORD,
      },
    });
  
    const mailOptions: Mail.Options = {
      from: process.env.NEXT_PUBLIC_MY_EMAIL,
      to: process.env.NEXT_PUBLIC_MY_EMAIL,
      subject: `Vous avez reçu un nouveau message depuis votre site internet.`,
      text: ` 
              ${name},
              ${email},
              ${telephone},
              Nombre d'invités souhaités : ${numberInv},
              Date de l'évènement : ${date},
              Midi ou soir ? : ${dateAMPM},
              Lieu de l'évènement : ${location},
              ci-après son message : ${message}.`
    };
  
    const sendMailPromise = () =>
      new Promise<string>((resolve, reject) => {
        transport.sendMail(mailOptions, function (err) {
          if (!err) {
            resolve('Email envoyé');
          } else {
            reject(err.message);
          }
        });
      });
  
    try {
      await sendMailPromise();
      return NextResponse.json({ message: 'Email envoyé' });
    } catch (err) {
      return NextResponse.json({ error: err }, { status: 500 });
    }
}