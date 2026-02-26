// import { Client, SendEmailV3_1, LibraryResponse } from 'node-mailjet';

// const mailjet = new Client({
//   apiKey: Deno.env.get("MAILJET_API_KEY") || '',
//   apiSecret: Deno.env.get("MAILJET_SECRET") || ''
// });

// export async function sendMail(name: string) {
//     const data: SendEmailV3_1.Body = {
//     Messages: [
//       {
//         From: {
//           Email: 'no-reply@sg-gym.dk',
//         },
//         To: [
//           {
//             Email: 'esbenjuul@gmail.com',
//           },
//         ],
//         Subject: `Hi ${name}, Your email flight plan!`,
//         HTMLPart: '<h3>Dear passenger, welcome to Mailjet!</h3><br />May the delivery force be with you!',
//         TextPart: 'Dear passenger, welcome to Mailjet! May the delivery force be with you!',
//       },
//     ],
//   };

//   const result: LibraryResponse<SendEmailV3_1.Response> = await mailjet
//           .post('send', { version: 'v3.1' })
//           .request(data);

//   const { Status } = result.body.Messages[0];
//   console.log(Status)
// }

export async function sendMail(name:string) {
    const apiKey = Deno.env.get('MAILJET_API_KEY') + ':' + Deno.env.get('MAILJET_SECRET');
    try {
        const res = await fetch("https://api.mailjet.com/v3.1/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa(apiKey)}`,
        },
        body: JSON.stringify({
            Messages: [
                {
                    From: {
                        Email: "no-reply@designsystems.dk",
                        Name: "Mailjet Pilot",
                    },
                    To: [
                        {
                            Email: "esbenjuul@gmail.com",
                            Name: "passenger 1",
                        },
                    ],
                    Subject: "Your email flight plan!",
                    TextPart:
                        "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
                    HTMLPart:
                        '<h3>Dear passenger 1, welcome to <a href="http://localhost:5173/">Mailjet</a>!</h3><br />May the delivery force be with you!',
                },
            ],
        }),
    });
        
    if (res.ok) {
        const data = await res.json();
        console.log(data);
        
    }
    } catch(err) {
        console.log('mailjet error', err)
    }
    

}