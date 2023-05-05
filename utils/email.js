// const nodemailer = require('nodemailer');
// const pug = require('pug');
// const htmlToText = require('html-to-text');
const sgMail = require('@sendgrid/mail');

module.exports = function (user, subject, text, html) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: `${user.email}`, // Change to your recipient
    from: 'sfe.healthify@gmail.com', // Change to your verified sender
    subject,
    text,
    html,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent');
    })
    .catch((error) => {
      console.error(error);
    });
};

// Email Class for sending emails
// module.exports = class Email {
//   constructor(user, url) {
//     this.to = user.email;
//     this.firstName = user.name.split(' ')[0];
//     this.url = url;
//     this.from = `Shehab Ashraf <${process.env.EMAIL_FROM}>`;
//   }

//   // Create a transport
//   newTransport() {
//     if (process.env.NODE_ENV === 'production') {
//       // Sendgrid
//       console.log('Sendgrid');
//       return nodemailer.createTransport({
//         service: 'SendGrid',
//         auth: {
//           user: process.env.SENDGRID_USERNAME,
//           pass: process.env.SENDGRID_PASSWORD,
//         },
//       });
//     }
//     // Mailtrap
//     return nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: process.env.EMAIL_PORT,
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//     });
//   }

//   // Send the actual email
//   async send(template, subject) {
//     // 1) Render HTML based on a pug template
//     const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
//       firstName: this.firstName,
//       url: this.url,
//       subject,
//     });

//     // 2) Define email options
//     const mailOptions = {
//       from: this.from,
//       to: this.to,
//       subject,
//       html,
//     };

//     // 3) Create a transport and send email
//     await this.newTransport().sendMail(mailOptions);
//   }

//   async sendWelcome() {
//     await this.send('welcome', 'Welcome to the Natours Family!');
//   }

//   async sendPasswordReset() {
//     await this.send(
//       'passwordReset',
//       'Your password reset token (valid for 10 minutes)'
//     );
//   }
// };
