var moment = require('moment');
var EmailService = {
  sendVerificationEmail: function(user, otp) {
    console.log(user, "user", otp)
    const email = (user.email).toString()
    const name= (user.name).toString()
    console.log(email,name, otp)
      var sendGrid = require('sendgrid')("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")
      var request = sendGrid.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
          personalizations: [{
            to: [{
              email: email
            }],
            substitutions: {
              '%name%': name,
              '%otp%': otp.toString()
            },
            subject: 'Welcome to Telos',
          }],
          from: {
            email: 'support@telos-technology.com',
          },
          content: [
            {
              type: 'text/html',
              value: 'I\'m replacing the <strong>body tag</strong>',
            },
          ],
          template_id: '21f88245-5b62-4ee3-87f4-e3db6db678a1',
        }
      });

      sendGrid.API(request, function (error, response) {
        if (error) {
          console.log('Error response received', error.response.body.errors);
        } else {
          console.log('response', response.body.errors);
        }        
      });
  },
 
}

module.exports = EmailService
