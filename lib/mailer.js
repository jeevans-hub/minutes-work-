import nodemailer from 'nodemailer';

let transporter = null;

export const initMailer = async () => {
  if (transporter) return transporter;

  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    console.log('Nodemailer configured with Ethereal email.');
    return transporter;
  } catch (err) {
    console.error('Failed to init mailer:', err);
    return null;
  }
};

export const sendNotificationEmail = async (to, subject, html) => {
  try {
    const tp = await initMailer();
    if (!tp) return;

    const info = await tp.sendMail({
      from: '"MintWork Notifications" <noreply@mintwork.test>',
      to,
      subject,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (err) {
    console.error('Failed to send email:', err);
  }
};
