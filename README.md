# Kissan Kart

A creative farm-to-home grocery ecommerce MVP using:

- HTML5 + CSS3
- Vanilla JavaScript
- Node.js
- Express.js
- MongoDB + Mongoose
- Dark / light theme
- Responsive UI
- Product search and category filters
- Persistent local cart
- Checkout and order storage

## Run locally

1. Install Node.js and MongoDB.
2. Open this folder in a terminal.
3. Install packages:

   npm install

4. Copy `.env.example` to `.env` and adjust `MONGO_URI` if needed.
5. Start development mode:

   npm run dev

6. Open:

   http://localhost:5000

The app automatically seeds the starter products into MongoDB on first run.

## API

GET `/api/products`
- `?category=Fruits`
- `?search=mango`

POST `/api/orders`

GET `/api/orders/:id`

POST `/api/seed`

## Next production upgrades

- JWT authentication and user accounts
- Admin dashboard
- Farmer onboarding and profiles
- Razorpay/Stripe payment integration
- Real delivery-slot logic
- Image uploads via cloud storage
- Inventory transactions
- Coupons and referral system
- Order tracking with delivery status
- Address geocoding and delivery zones
