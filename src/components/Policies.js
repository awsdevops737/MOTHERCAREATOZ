export const BIZ = {
  name: "MOTHER CARE",
  address: "Shop No.1, Hasmathpet Rd, beside Vennela Hospital, Ramgopal Enclave, Mahatma Nagar, Old Bowenpally, Secunderabad, Telangana 500011",
  phone: "+91 72075 60510",
  email: "mothercareatoz@gmail.com",
};

const PAGES = {
  refunds: {
    title: "Refund and Cancellation Policy",
    sections: [
      ["Cancelling an order", [
        "You can cancel an order before it is shipped. Call or email us with your order number as soon as possible and we will cancel it and refund the full amount.",
        "Once an order has been shipped it can no longer be cancelled, but you can return it after delivery as described below.",
      ]],
      ["Returns: 10 days", [
        "You can return a product within 10 days of delivery. The product must be unused and unopened, in its original packaging, with all labels and seals intact.",
        "To start a return, contact us with your order number. We will confirm the return and tell you how to send the product back.",
      ]],
      ["Items that cannot be returned", [
        "Diapers cannot be returned or exchanged, for hygiene and safety reasons.",
        "Opened or used products, and products damaged after delivery, cannot be returned.",
        "Exception: if any product, including diapers, arrives damaged or defective, or is different from what you ordered, contact us with photos within 10 days of delivery and we will replace it or refund you.",
      ]],
      ["How refunds are paid", [
        "Approved refunds go back to the original payment method (UPI, card or net banking) within 5 to 7 working days after we receive and check the returned product, or after a cancellation is confirmed. Your bank may take a little longer to show the credit.",
      ]],
      ["Payment deducted but order not confirmed", [
        "If money was deducted but your order was not confirmed, the amount is normally reversed automatically by your bank or our payment partner within 5 to 7 working days. If it is not, contact us with your payment ID and we will help.",
      ]],
    ],
  },
  shipping: {
    title: "Shipping and Delivery Policy",
    sections: [
      ["Delivery time", [
        "Orders are delivered in 5 to 7 working days from the day your payment is confirmed. Remote locations, public holidays and courier delays can add time.",
      ]],
      ["Where we deliver", [
        "We deliver to pincodes served by our courier partners across India. Enter your pincode at checkout; if we cannot deliver to your area, we will tell you.",
      ]],
      ["Delivery charges", [
        "Delivery is free for orders of Rs. 499 or more after discounts. For smaller orders the delivery charge is Rs. 49. The charge is shown at checkout before you pay.",
      ]],
      ["Tracking your order", [
        "When your order is shipped, a tracking link appears under My account, in your order history.",
      ]],
      ["Delivery problems", [
        "Please give a complete address and a working phone number so the courier can reach you. If your parcel is late, damaged or wrong, contact us and we will sort it out.",
      ]],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      ["What we collect", [
        "When you create an account or place an order we collect your name, email address, phone number, delivery address and order details. We do not store your card, UPI or bank details; payments are handled by Razorpay.",
      ]],
      ["How we use it", [
        "We use your information to create your account, process and deliver orders, handle returns and refunds, answer your questions and send order updates.",
      ]],
      ["Who we share it with", [
        "We share only what is needed with the services that help us run the store: Razorpay (payments), our courier and shipping partners (delivery), and our hosting and database providers. We do not sell your personal information.",
      ]],
      ["Cookies and storage", [
        "Your browser stores a login session and your shopping cart so the store works properly. You can clear this from your browser settings.",
      ]],
      ["Security and your choices", [
        "We use secure connections and access controls to protect your data. You can ask us to correct or delete your account information by emailing us. Some order records may be kept as required by law.",
      ]],
      ["Changes", [
        "We may update this policy from time to time. The date at the top shows when it was last updated.",
      ]],
    ],
  },
  terms: {
    title: "Terms and Conditions",
    sections: [
      ["About us", [
        "This website is operated by MOTHER CARE, Secunderabad, Telangana, India. By using the site or placing an order you agree to these terms.",
      ]],
      ["Products and prices", [
        "We sell baby products and daily essentials. Prices are in Indian rupees (INR) and may change without notice. We try to show products accurately, but colours and packaging may vary slightly. If a product is out of stock or a price is wrong, we may cancel the order and refund you in full.",
      ]],
      ["Orders and payment", [
        "An order is confirmed only after payment succeeds. Payments are made online through Razorpay using UPI, cards or net banking. Coupons are subject to their stated conditions and can be withdrawn at any time.",
      ]],
      ["Delivery, returns and refunds", [
        "Delivery, return and refund terms are set out in our Shipping and Delivery Policy and our Refund and Cancellation Policy, which form part of these terms.",
      ]],
      ["Your account", [
        "Keep your login details safe. You are responsible for activity on your account. We may suspend accounts that are used for fraud or misuse.",
      ]],
      ["Liability", [
        "We are not liable for delays or failures caused by events outside our control, such as courier delays, network failures or natural events. Our liability for any order is limited to the amount you paid for it.",
      ]],
      ["Governing law", [
        "These terms are governed by the laws of India. Disputes are subject to the courts at Hyderabad, Telangana.",
      ]],
    ],
  },
};

export default function Policies({ kind, go }) {
  const p = PAGES[kind];
  if (!p) return null;
  return (
    <section>
      <h1>{p.title}</h1>
      <p className="muted small">Last updated: 20 November 2026</p>
      {p.sections.map(([heading, paras]) => (
        <div className="panel" key={heading}>
          <h3>{heading}</h3>
          {paras.map((t, i) => <p key={i}>{t}</p>)}
        </div>
      ))}
      <div className="panel">
        <h3>Contact us</h3>
        <p><strong>{BIZ.name}</strong></p>
        <p>{BIZ.address}</p>
        <p>Phone: {BIZ.phone} · Email: {BIZ.email}</p>
        <button className="link" onClick={() => go("contact")}>Open contact page</button>
      </div>
    </section>
  );
}
