const nodemailer = require("nodemailer");

module.exports = app => {    
  
  // async..await is not allowed in global scope, must use a wrapper
  async function send(message, subject, to) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();
  
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // TODO gmail
        pass: process.env.SMTP_PASSWORD, // gmail password
      },
      tls: {
          rejectUnauthorized: false
      }
    });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"IMUNI" <' + process.env.SMTP_USER + '>', // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: message, // plain text body
      html: message, // html body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }

  async function sendToMany(message, subject, toArray) {
      await send(message, subject, toArray.join(', '));
  }
  
  return { send, sendToMany };
};