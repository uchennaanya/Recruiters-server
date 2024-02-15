import nodemailer from "nodemailer";

const sendMail = async (option) => {
  // CREATE A TRANSPORTER
  const transporter = nodemailer.createTransport({
    host: 'gmail',
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_TEST,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //   DEFINE EMAIL OPTIONS
  const mailOptions = {
    from: "martinsanya19@gmail.com",
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendMail;



// import nodemailer from "nodemailer";

// const sendMail = async (option) => {
//   // CREATE A TRANSPORTER
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
//   //   DEFINE EMAIL OPTIONS
//   const mailOptions = {
//     from: "TechWings surpport<martinsanya19@gmail.com>",
//     to: option.email,
//     subject: option.subject,
//     text: option.message,
//   };

//   await transporter.sendMail(mailOptions);
// };

// export default sendMail;
