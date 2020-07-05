const nodemailer = require("nodemailer");

const body = 
`
<div>
  <header style="text-align: center;">
    <img alt="Supply Radar" src="data:image/png;base64, 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" />
    <h1 style="padding:34px 65px; font-family: 'Open Sans', verdana, sans-serif; font-size: 2.1875rem; font-weight:normal; line-height: 2.9rem;background-color:#BED1D2; color:#206164; text-align: center;">Existem pendências no seu contrato</h1>
  </header>
  <section style="padding:34px 65px;font-family: Open Sans, verdana, sans-serif; font-size: 1rem;line-height: 1.375rem; color: rgba(0, 0, 0, 0.87);">
    <b>Solar Power System</b>

    <p>Prezado(a) Anilson Soares,</p>
    <p>
    O contrato da sua empresa com o Supply Radar foi processado e necessita dos seguintes ajustes:
    </p>

    <p style="background-color: #E5E5E5; padding: 30px; font-style: italic; color: rgba(0, 0, 0, 0.54);">
    Lorem ipsum dolor sit amet
    </p>

    <p>Acesse o Supply Radar e realize as alterações necessarias. Em seguida, o contrato será submetido a uma nova análise.</p>

    <p>
      <a href="$urlSistema" style="display: inline-block; padding: 15px 30px; background-color: #429693;; color: white; border-radius: 4px;text-decoration: none; text-transform: uppercase;">Resolver pendências</a>
    </p>

    <p> 
    Abraços,<br/>
    Equipe Supply Radar
    </p>
  </section>
  <footer style="background-color:#EDEDED; color: rgba(0, 0, 0, 0.54);padding:34px 65px; font-family: 'Open Sans', verdana, sans-serif; font-size: 0.8rem; font-weight:normal; line-height: 1rem; text-align:center; border-bottom: 10px solid #2B8285;">
    <p>Copyright 2020 - Supply Radar - Todos os direitos reservados</p>

    <p>Não responda esta mensagem. Este é um e-mail automático. Para obter ajuda, entre em contato com o suporte ou através do email contato@supplyradar.com.</p>
    <p><a href="https://supplyradar.com">supplyradar.com</a></p>
  </footer>
</div>
`;

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'gilmar.victhur@gmail.com', // generated ethereal user
      pass: 'g1/m42123', // generated ethereal password
    },
    tls: {
        rejectUnauthorized: false
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: "gilmar-andrade@outlook.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: body, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

main().catch(console.error);