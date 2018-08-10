const url = process.env.CLIENT_URL
const fromEmail = process.env.FROM_EMAIL

module.exports.welcomeEmail = function(email, user) {
  const text = `
Hi,
Thank you for choosing enamel! 
You are just one click away from completing your account registration.

Confirm your email:\n
${url}/signup/${user.id}
`

  return {
    to: `${email}`,
    from: {
      address: fromEmail,
      name: 'enamel'
    },
    subject: 'Please complete your registration',
    text
  }
}
