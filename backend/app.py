"""
app.py
------
Entry point for the Flask backend. This is where we:
  1. Create the Flask app and configure it
  2. Wire up extensions (db, jwt, bcrypt, cors)
  3. Define every API route (auth, products, cart/checkout, orders,
     coupons, banners, analytics)

Route naming convention: everything lives under /api/... so the React
frontend can proxy cleanly to it (see vite.config.js on the frontend side).
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, get_jwt
)
from datetime import datetime, timedelta
from functools import wraps
from sqlalchemy import func

from models import db, User, Category, Product, Order, OrderItem, Coupon, Banner

app = Flask(__name__)

#  Configuration 
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///ecommerce.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "dev-secret-change-this-in-production"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=2)

#  Extensions 
db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)  # allows the React dev server (different port) to call this API


# Helper: admin-only route guard

def admin_required(fn):
    """
    Wraps a route so it 401s normal users. We stash the user's role
    inside the JWT itself (see additional_claims below at login time),
    so we don't need a DB hit just to check permissions.
    """
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper



# AUTH ROUTES

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    name, email, password = data.get("name"), data.get("email"), data.get("password")

    if not all([name, email, password]):
        return jsonify({"error": "name, email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists"}), 409

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    # first ever registered user becomes admin automatically, just so the
    # seed/demo flow has an admin without manual DB editing
    role = "admin" if User.query.count() == 0 else "customer"

    user = User(name=name, email=email, password_hash=hashed, role=role)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify({"token": token, "user": user.to_dict()}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email, password = data.get("email"), data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify({"token": token, "user": user.to_dict()}), 200


@app.route("/api/auth/me", methods=["GET"])
@jwt_required()
def me():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict())



# PRODUCT + CATEGORY ROUTES  (public read, admin write)

@app.route("/api/categories", methods=["GET"])
def get_categories():
    return jsonify([c.to_dict() for c in Category.query.all()])


@app.route("/api/categories", methods=["POST"])
@admin_required
def create_category():
    data = request.get_json()
    cat = Category(name=data["name"])
    db.session.add(cat)
    db.session.commit()
    return jsonify(cat.to_dict()), 201


@app.route("/api/products", methods=["GET"])
def get_products():
    """
    Supports the storefront's search + filter bar via query params:
    /api/products?search=shoe&category=2&min_price=10&max_price=500&featured=true
    """
    query = Product.query

    search = request.args.get("search")
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    category_id = request.args.get("category")
    if category_id:
        query = query.filter(Product.category_id == int(category_id))

    min_price = request.args.get("min_price")
    if min_price:
        query = query.filter(Product.price >= float(min_price))

    max_price = request.args.get("max_price")
    if max_price:
        query = query.filter(Product.price <= float(max_price))

    if request.args.get("featured") == "true":
        query = query.filter(Product.is_featured.is_(True))

    products = query.order_by(Product.created_at.desc()).all()
    return jsonify([p.to_dict() for p in products])


@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify(product.to_dict())


@app.route("/api/products", methods=["POST"])
@admin_required
def create_product():
    data = request.get_json()
    product = Product(
        name=data["name"],
        description=data.get("description", ""),
        price=data["price"],
        image_url=data.get("image_url", ""),
        stock=data.get("stock", 0),
        category_id=data.get("category_id"),
        is_featured=data.get("is_featured", False),
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_dict()), 201


@app.route("/api/products/<int:product_id>", methods=["PUT"])
@admin_required
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    for field in ["name", "description", "price", "image_url", "stock", "category_id", "is_featured"]:
        if field in data:
            setattr(product, field, data[field])
    db.session.commit()
    return jsonify(product.to_dict())


@app.route("/api/products/<int:product_id>", methods=["DELETE"])
@admin_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted"})


# COUPON ROUTES

@app.route("/api/coupons", methods=["GET"])
@admin_required
def list_coupons():
    return jsonify([c.to_dict() for c in Coupon.query.all()])


@app.route("/api/coupons", methods=["POST"])
@admin_required
def create_coupon():
    data = request.get_json()
    expires = data.get("expires_at")
    coupon = Coupon(
        code=data["code"].upper(),
        discount_type=data["discount_type"],  # "percentage" | "fixed"
        value=data["value"],
        expires_at=datetime.fromisoformat(expires) if expires else None,
        is_active=data.get("is_active", True),
    )
    db.session.add(coupon)
    db.session.commit()
    return jsonify(coupon.to_dict()), 201


@app.route("/api/coupons/validate", methods=["POST"])
@jwt_required()
def validate_coupon():
    """Customer-facing: check a code at checkout and return the discount."""
    data = request.get_json()
    code = data.get("code", "").upper()
    subtotal = data.get("subtotal", 0)

    coupon = Coupon.query.filter_by(code=code, is_active=True).first()
    if not coupon:
        return jsonify({"error": "Invalid or inactive coupon"}), 404
    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        return jsonify({"error": "This coupon has expired"}), 400

    if coupon.discount_type == "percentage":
        discount = subtotal * (coupon.value / 100)
    else:
        discount = coupon.value
    discount = min(discount, subtotal)  # never discount more than the order is worth

    return jsonify({"discount": round(discount, 2), "code": coupon.code})


# BANNER ROUTES (bonus feature)

@app.route("/api/banners", methods=["GET"])
def get_active_banners():
    """Public: only banners that are active AND within their scheduled window."""
    now = datetime.utcnow()
    banners = Banner.query.filter_by(is_active=True).all()
    visible = [
        b for b in banners
        if (not b.start_date or b.start_date <= now)
        and (not b.end_date or b.end_date >= now)
    ]
    return jsonify([b.to_dict() for b in visible])


@app.route("/api/banners/all", methods=["GET"])
@admin_required
def get_all_banners():
    return jsonify([b.to_dict() for b in Banner.query.all()])


@app.route("/api/banners", methods=["POST"])
@admin_required
def create_banner():
    data = request.get_json()
    banner = Banner(
        title=data["title"],
        image_url=data["image_url"],
        link_url=data.get("link_url", ""),
        is_active=data.get("is_active", True),
        start_date=datetime.fromisoformat(data["start_date"]) if data.get("start_date") else None,
        end_date=datetime.fromisoformat(data["end_date"]) if data.get("end_date") else None,
    )
    db.session.add(banner)
    db.session.commit()
    return jsonify(banner.to_dict()), 201


@app.route("/api/banners/<int:banner_id>", methods=["DELETE"])
@admin_required
def delete_banner(banner_id):
    banner = Banner.query.get_or_404(banner_id)
    db.session.delete(banner)
    db.session.commit()
    return jsonify({"message": "Banner deleted"})



# ORDER / CHECKOUT ROUTES

@app.route("/api/orders", methods=["POST"])
@jwt_required()
def place_order():
    """
    The checkout endpoint. Expects:
    {
      "items": [{"product_id": 1, "quantity": 2}, ...],
      "address_line", "city", "pincode", "phone",
      "coupon_code": "SAVE10"   (optional)
    }
    We recompute prices server-side from the DB , never trust totals
    sent by the client, that's how people give themselves free discounts.
    """
    user_id = int(get_jwt_identity())
    data = request.get_json()
    cart_items = data.get("items", [])

    if not cart_items:
        return jsonify({"error": "Cart is empty"}), 400

    order_items = []
    subtotal = 0.0

    for entry in cart_items:
        product = Product.query.get(entry["product_id"])
        qty = entry["quantity"]
        if not product:
            return jsonify({"error": f"Product {entry['product_id']} not found"}), 404
        if product.stock < qty:
            return jsonify({"error": f"Not enough stock for {product.name}"}), 400

        line_total = product.price * qty
        subtotal += line_total
        order_items.append(OrderItem(
            product_id=product.id,
            product_name=product.name,
            price_at_purchase=product.price,
            quantity=qty,
        ))
        product.stock -= qty  # decrement inventory immediately (simulated)

    discount = 0.0
    coupon_code = data.get("coupon_code")
    if coupon_code:
        coupon = Coupon.query.filter_by(code=coupon_code.upper(), is_active=True).first()
        if coupon and (not coupon.expires_at or coupon.expires_at >= datetime.utcnow()):
            discount = subtotal * (coupon.value / 100) if coupon.discount_type == "percentage" else coupon.value
            discount = min(discount, subtotal)

    order = Order(
        user_id=user_id,
        address_line=data["address_line"],
        city=data["city"],
        pincode=data["pincode"],
        phone=data["phone"],
        subtotal=round(subtotal, 2),
        discount=round(discount, 2),
        total=round(subtotal - discount, 2),
        coupon_code=coupon_code,
        status="placed",
    )
    order.items = order_items
    db.session.add(order)
    db.session.commit()

    return jsonify(order.to_dict()), 201


@app.route("/api/orders/mine", methods=["GET"])
@jwt_required()
def my_orders():
    user_id = int(get_jwt_identity())
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders])


@app.route("/api/orders", methods=["GET"])
@admin_required
def all_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders])


@app.route("/api/orders/<int:order_id>/status", methods=["PUT"])
@admin_required
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    new_status = request.get_json().get("status")
    if new_status not in ["placed", "processing", "shipped", "delivered", "cancelled"]:
        return jsonify({"error": "Invalid status"}), 400
    order.status = new_status
    db.session.commit()
    return jsonify(order.to_dict())



# ANALYTICS (admin dashboard, bonus depth)

@app.route("/api/analytics/summary", methods=["GET"])
@admin_required
def analytics_summary():
    total_revenue = db.session.query(func.sum(Order.total)).scalar() or 0
    total_orders = Order.query.count()
    total_customers = User.query.filter_by(role="customer").count()

    top_products_query = (
        db.session.query(
            OrderItem.product_name,
            func.sum(OrderItem.quantity).label("units_sold"),
            func.sum(OrderItem.price_at_purchase * OrderItem.quantity).label("revenue"),
        )
        .group_by(OrderItem.product_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )
    top_products = [
        {"name": name, "units_sold": int(units), "revenue": round(rev, 2)}
        for name, units, rev in top_products_query
    ]

    # orders placed per day, last 7 days, powers a simple line chart
    orders_by_day = (
        db.session.query(
            func.date(Order.created_at).label("day"),
            func.count(Order.id).label("count"),
        )
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
        .all()
    )

    return jsonify({
        "total_revenue": round(total_revenue, 2),
        "total_orders": total_orders,
        "total_customers": total_customers,
        "conversion_rate": round((total_orders / max(total_customers, 1)) * 100, 1),
        "top_products": top_products,
        "orders_by_day": [{"day": str(d), "count": c} for d, c in orders_by_day],
    })


if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # creates tables if they don't already exist
    app.run(debug=True, port=5000)
