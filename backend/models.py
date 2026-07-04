"""
models.py
----------
All our database tables live here as SQLAlchemy model classes.
Each class = one table. SQLAlchemy handles converting these into
actual SQL CREATE TABLE statements for us (see db.create_all() in app.py).

Tables:
  User      -> customers + admins (role field tells them apart)
  Category  -> product categories (Electronics, Apparel, etc.)
  Product   -> the actual items being sold
  Order     -> one order = one checkout
  OrderItem -> line items inside an order (many per order)
  Coupon    -> discount codes (bonus feature)
  Banner    -> homepage promo banners (bonus feature)
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    # we NEVER store plain text passwords, only the bcrypt hash
    password_hash = db.Column(db.String(255), nullable=False)
    # 'customer' or 'admin' -  this is our role-based access control (RBAC)
    role = db.Column(db.String(20), default="customer", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # one user but many orders , backref lets us do order , customer to get the User
    orders = db.relationship("Order", backref="customer", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
        }


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)

    products = db.relationship("Product", backref="category", lazy=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name}


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, default="")
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(300), default="")
    stock = db.Column(db.Integer, default=0)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=True)
    is_featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "image_url": self.image_url,
            "stock": self.stock,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "is_featured": self.is_featured,
            "in_stock": self.stock > 0,
        }


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # address is stored flat here rather than a separate table, simpler
    # for this project's scope, still counts as "address management"
    address_line = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    pincode = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20), nullable=False)

    subtotal = db.Column(db.Float, nullable=False)
    discount = db.Column(db.Float, default=0)
    total = db.Column(db.Float, nullable=False)
    coupon_code = db.Column(db.String(50), nullable=True)

    # order lifecycle: placed - processing - shipped - delivered - cancelled
    status = db.Column(db.String(20), default="placed")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship("OrderItem", backref="order", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "customer_name": self.customer.name if self.customer else None,
            "address_line": self.address_line,
            "city": self.city,
            "pincode": self.pincode,
            "phone": self.phone,
            "subtotal": self.subtotal,
            "discount": self.discount,
            "total": self.total,
            "coupon_code": self.coupon_code,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "items": [i.to_dict() for i in self.items],
        }


class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    # we snapshot name/price at time of purchase, if the product price
    # changes later, old orders should still show what was actually paid
    product_name = db.Column(db.String(150), nullable=False)
    price_at_purchase = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_name": self.product_name,
            "price_at_purchase": self.price_at_purchase,
            "quantity": self.quantity,
            "line_total": round(self.price_at_purchase * self.quantity, 2),
        }


class Coupon(db.Model):
    __tablename__ = "coupons"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    # 'percentage' or 'fixed'
    discount_type = db.Column(db.String(20), nullable=False)
    value = db.Column(db.Float, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "discount_type": self.discount_type,
            "value": self.value,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "is_active": self.is_active,
        }


class Banner(db.Model):
    __tablename__ = "banners"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    image_url = db.Column(db.String(300), nullable=False)
    link_url = db.Column(db.String(300), default="")
    is_active = db.Column(db.Boolean, default=True)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "image_url": self.image_url,
            "link_url": self.link_url,
            "is_active": self.is_active,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
        }
