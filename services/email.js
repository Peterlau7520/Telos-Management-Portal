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
          template_id: '768fe477-7549-4df4-8a10-342649d632c9',
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
 sendConfirmationEmail: function(user) {
  console.log(user)
    const email = (user.email).toString()
    const name= (user.username).toString()
    console.log(email,name)
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
          template_id: '44624a63-4d5b-4c66-88d4-f63159709e44',
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
