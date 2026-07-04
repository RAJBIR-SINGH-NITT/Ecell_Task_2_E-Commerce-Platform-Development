"""
seed.py
-------
Run this once after the server has created the tables:
    python seed.py

Fills the DB with an admin, a customer, some categories/products,
a coupon, and a banner so the app isn't empty when you demo it.
"""

from app import app, bcrypt
from models import db, User, Category, Product, Coupon, Banner
from datetime import datetime, timedelta

with app.app_context():
    db.create_all()

    if User.query.count() == 0:
        admin = User(
            name="Admin",
            email="admin@ecell.com",
            password_hash=bcrypt.generate_password_hash("admin123").decode("utf-8"),
            role="admin",
        )
        customer = User(
            name="Rajbir",
            email="customer@ecell.com",
            password_hash=bcrypt.generate_password_hash("customer123").decode("utf-8"),
            role="customer",
        )
        db.session.add_all([admin, customer])

    if Category.query.count() == 0:
        electronics = Category(name="Electronics")
        apparel = Category(name="Apparel")
        home = Category(name="Home & Living")
        db.session.add_all([electronics, apparel, home])
        db.session.commit()

        products = [
            Product(name="Wireless Headphones", description="Noise-cancelling over-ear headphones",
                     price=2999, stock=25, image_url="https://picsum.photos/seed/headphones/400",
                     category_id=electronics.id, is_featured=True),
            Product(name="Smartwatch", description="Fitness tracking smartwatch with heart-rate monitor",
                     price=4499, stock=15, image_url="https://picsum.photos/seed/watch/400",
                     category_id=electronics.id, is_featured=True),
            Product(name="Cotton T-Shirt", description="Breathable everyday cotton tee",
                     price=599, stock=50, image_url="https://picsum.photos/seed/tshirt/400",
                     category_id=apparel.id, is_featured=False),
            Product(name="Denim Jacket", description="Classic fit denim jacket",
                     price=1899, stock=20, image_url="https://picsum.photos/seed/jacket/400",
                     category_id=apparel.id, is_featured=True),
            Product(name="Ceramic Mug Set", description="Set of 4 handcrafted ceramic mugs",
                     price=799, stock=30, image_url="https://picsum.photos/seed/mug/400",
                     category_id=home.id, is_featured=False),
            Product(name="Table Lamp", description="Minimalist wooden base table lamp",
                     price=1299, stock=0, image_url="https://picsum.photos/seed/lamp/400",
                     category_id=home.id, is_featured=False),
        ]
        db.session.add_all(products)

    if Coupon.query.count() == 0:
        db.session.add(Coupon(code="WELCOME10", discount_type="percentage", value=10,
                               expires_at=datetime.utcnow() + timedelta(days=90), is_active=True))
        db.session.add(Coupon(code="FLAT100", discount_type="fixed", value=100,
                               expires_at=datetime.utcnow() + timedelta(days=30), is_active=True))

    if Banner.query.count() == 0:
        db.session.add(Banner(title="Big Summer Sale - Up to 40% Off", is_active=True,
                               image_url="https://picsum.photos/seed/banner1/1200/400"))

    db.session.commit()
    print("Seed complete: admin@ecell.com / admin123, customer@ecell.com / customer123")
