const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { resolve } = require("path");
// Replace if using a different env file or config
const env = require("dotenv").config({ path: "./.env" });

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(process.env.STATIC_DIR));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


const cors = require('cors');

app.use(cors({ origin: 'http://localhost:3000' }));



app.get("/", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
});

app.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

const YOUR_DOMAIN = "http://localhost:3000";

app.post("/create-payment-intent", async (req, res) => {
  try {
    console.log("test amount", req.body);

    let price = req?.body?.amountStripe;
    // if (req?.body?.amountStripe) {
    //   price = req?.body?.amountStripe;
    // } else {
    //   price = 50000;
    // }⁄

    if (price) {
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "EUR",
        amount: price,
        automatic_payment_methods: { enabled: true },
        // payment_method_types: ['card'],
      });

      // Send publishable key and PaymentIntent details to client
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    }
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

// app.post("/create-checkout-session", async (req, res) => {
//   const session = await stripe.checkout.sessions.create({
//     line_items: [
//       {
//         // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
//         price: "{{PRICE_ID}}",
//         quantity: 1,
//       },
//     ],
//     mode: "payment",
//     success_url: `${YOUR_DOMAIN}?success=true`,
//     cancel_url: `${YOUR_DOMAIN}?canceled=true`,
//   });

// res.redirect(303, session.url);
// });

// app.post("/payment", async (req, res) => {
//   let status, error;
//   const { token, amount } = req.body;
//   try {
//     await stripe.charges.create({
//       source: token.id,
//       amount,
//       currency: "usd",
//     });
//     status = "success";
//   } catch (error) {
//     console.log(error);
//     status = "Failure";
//   }
//   res.json({ error, status });
// });

app.listen(5252, () =>
  console.log(`Node server listening at http://localhost:5252`)
);
