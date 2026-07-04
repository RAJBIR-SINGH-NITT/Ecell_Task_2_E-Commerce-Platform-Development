# Shopwave - E-Commerce Platform (E-Cell NIT Trichy, Task 2)

A full-stack e-commerce platform built for E-Cell NIT Trichy's Tech Domain
Task 2. It has a customer-facing storefront and a separate admin dashboard,
backed by a Flask API.

Live demo: `<add your Vercel link here>`
Backend API: `https://ecell-task-2-e-commerce-platform.onrender.com`

## What's in it

**For customers**
- Landing page with a hero section, featured products, and promo banners
- Product listing with search and category filtering
- Product detail pages
- Cart, kept client-side until checkout
- Checkout flow - address, coupon code, simulated payment, order confirmation
- Order history / tracking
- Responsive on mobile and desktop

**For admins**
- Add, edit, and delete products, including categories and stock
- View and manage customer orders, update order status
- Analytics - revenue, top-selling products, order counts
- Coupon management (percentage or fixed discounts, expiry dates) - bonus feature
- Banner management for the homepage - bonus feature

**Auth**
- JWT-based login/register
- Role-based access - admin routes and pages are blocked for regular
  customers, both on the API side and in the UI

## Tech stack

- Frontend: React 18 with Vite, and React Router for navigation
- Backend: Flask, with Flask-SQLAlchemy, Flask-JWT-Extended, Flask-Bcrypt,
  and Flask-CORS
- Database: SQLite for development - easy to swap for Postgres/MySQL later
  by changing one line in `app.py`
- Deployment: frontend on Vercel, backend on Render

I went with Flask instead of Node/Express since the brief listed a few
stack options and I'm more comfortable in Python - the priority was
covering every required and bonus feature properly rather than sticking
to one specific stack.

## How the project is organized

- `backend/app.py` - the Flask app itself: all the API routes for auth,
  products, orders, coupons, banners, and analytics
- `backend/models.py` - the database models (User, Category, Product,
  Order, OrderItem, Coupon, Banner)
- `backend/seed.py` - fills the database with demo products and a couple
  of test accounts
- `backend/requirements.txt` - Python dependencies
- `frontend/src/pages` - the main customer-facing pages (Home, Shop,
  Product Detail, Cart, Checkout, Orders, Login, Register)
- `frontend/src/pages/admin` - the admin dashboard pages (Product,
  Order, Coupon, and Banner management, plus Analytics)
- `frontend/src/components` - shared pieces like the Navbar, product
  cards, and the route guard for private pages
- `frontend/src/context` - auth state and cart state, shared across pages
- `frontend/src/api.js` - the one place that talks to the backend, so the
  API base URL only needs to change in one spot

## Getting it running locally

**Backend**
- Move into the `backend` folder and create a virtual environment
- Activate it (on Windows: `venv\Scripts\Activate.ps1`, on Mac/Linux:
  `source venv/bin/activate`)
- Install dependencies with `pip install -r requirements.txt`
- Create a `.env` file inside `backend/` with:
  - `JWT_SECRET_KEY` - any random secret string
  - `DATABASE_URL=sqlite:///ecommerce.db`
  - `FRONTEND_URL=http://localhost:5173`
- Run `python app.py` to create the database tables and start the API on
  port 5000
- In a second terminal, run `python seed.py` to load demo data

That creates two demo accounts:
- Admin - admin@ecell.com / admin123
- Customer - customer@ecell.com / customer123

**Frontend**
- Move into the `frontend` folder
- Run `npm install`
- Run `npm run dev` to start it on port 5173, which proxies API calls to
  the backend automatically in development

## Deploying it

- Backend on Render — new web service, root directory set to `backend`,
  build command `pip install -r requirements.txt`, start command
  `gunicorn app:app`, with `JWT_SECRET_KEY` and `FRONTEND_URL` added as
  environment variables
- Frontend on Vercel - import the repo, set root directory to `frontend`
  (Vite is auto-detected), and add a `VITE_API_URL` environment variable
  pointing at the deployed Render URL, since the local dev proxy doesn't
  exist in production

## A few notes on decisions I made

- SQLite is fine for a project like this, but I'd move to Postgres for
  anything real - the SQLAlchemy setup makes that a one-line change
- The cart lives in the browser rather than the database, since the
  brief describes checkout as simulated rather than a live payment flow
- I focused on getting every required and bonus feature working
  end-to-end rather than polishing animations - that would be the next
  thing I'd add with more time

## AI usage

I used AI help throughout this project, both for the initial build and
for debugging environment and deployment issues along the way. The full
list of prompts I used is in [AI_PROMPTS.md](./AI_PROMPTS.md).
