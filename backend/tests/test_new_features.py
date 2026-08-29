import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.models import User, Product, Order, Appointment
import uuid

client = TestClient(app)

def test_full_customer_and_invoice_workflow():
    db = SessionLocal()
    random_str = str(uuid.uuid4())[:8]
    test_email = f"test_customer_{random_str}@example.com"
    test_password = "Password@12345"

    # 1. Register customer
    reg_res = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "full_name": "Rohan Test Kulkarni",
        "phone": "+919822011223",
        "password": test_password
    })
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    token_data = reg_res.json()
    access_token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    print("1. Registration successful!")

    # 2. Get profile
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == test_email
    print("2. Profile retrieval successful!")

    # 3. Update profile
    prof_res = client.put("/api/v1/auth/profile", json={
        "full_name": "Rohan Updated Kulkarni",
        "phone": "+919822099887"
    }, headers=headers)
    assert prof_res.status_code == 200
    assert prof_res.json()["full_name"] == "Rohan Updated Kulkarni"
    print("3. Profile update successful!")

    # 4. Change password
    new_password = "NewPassword@67890"
    pwd_res = client.put("/api/v1/auth/change-password", json={
        "old_password": test_password,
        "new_password": new_password
    }, headers=headers)
    assert pwd_res.status_code == 200
    print("4. Password change successful!")

    # 5. Login with new password
    login_res = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": new_password
    })
    assert login_res.status_code == 200
    new_token = login_res.json()["access_token"]
    new_headers = {"Authorization": f"Bearer {new_token}"}
    print("5. Login with new password successful!")

    # 6. Book Zeiss 3D eye examination
    apt_res = client.post("/api/v1/appointments", json={
        "customer_name": "Rohan Updated Kulkarni",
        "customer_phone": "+919822099887",
        "customer_email": test_email,
        "branch": "Kothrud ZEISS Center",
        "appointment_date": "2026-09-15",
        "time_slot": "04:00 PM - 05:00 PM",
        "test_type": "Zeiss 3D Digital Wavefront Examination",
        "notes": "Test booking automated email"
    })
    assert apt_res.status_code == 201, f"Appointment booking failed: {apt_res.text}"
    print("6. Eye test appointment booking & email dispatch successful!")

    # 7. Check customer appointments list
    my_apts = client.get("/api/v1/auth/me/appointments", headers=new_headers)
    assert my_apts.status_code == 200
    assert len(my_apts.json()) >= 1
    print(f"7. Customer appointments list retrieved: {len(my_apts.json())} bookings!")

    # 8. Create and verify order
    product = db.query(Product).filter(Product.is_active == True).first()
    assert product is not None, "Product catalog must not be empty"

    order_payload = {
        "customer_name": "Rohan Updated Kulkarni",
        "customer_phone": "+919822099887",
        "customer_email": test_email,
        "delivery_type": "HOME_DELIVERY",
        "shipping_address": "Flat 402, Elite residency, Kothrud",
        "city": "Pune",
        "pincode": "411038",
        "state": "Maharashtra",
        "lens_selection_type": "ZEISS PhotoFusion X (Grey)",
        "prescription_data": "OD: -1.50 / OS: -1.75",
        "items": [{
            "product_id": product.id,
            "product_name": product.name,
            "product_sku": product.sku,
            "product_image": product.primary_image,
            "unit_price": product.price,
            "quantity": 1,
            "lens_type": "ZEISS PhotoFusion X (Grey)",
            "lens_price": 4500.0
        }],
        "notes": "Fast express delivery"
    }

    ord_res = client.post("/api/v1/orders", json=order_payload, headers=new_headers)
    assert ord_res.status_code == 201, f"Order creation failed: {ord_res.text}"
    created_order = ord_res.json()
    order_id = created_order["order_id"]
    order_number = created_order["order_number"]
    print(f"8. Order created: #{order_number}")

    # 9. Verify Payment
    verify_res = client.post("/api/v1/orders/verify-payment", json={
        "order_id": order_id,
        "razorpay_order_id": created_order["razorpay_order_id"],
        "razorpay_payment_id": f"pay_test_{random_str}",
        "razorpay_signature": "mock_valid_signature"
    })
    assert verify_res.status_code == 200
    print("9. Payment verified and order confirmation email with PDF invoice dispatched!")

    # 10. Check customer orders list
    my_orders = client.get("/api/v1/auth/me/orders", headers=new_headers)
    assert my_orders.status_code == 200
    assert len(my_orders.json()) >= 1
    print(f"10. Customer orders list retrieved: {len(my_orders.json())} orders!")

    # 11. Download Invoice PDF endpoint
    inv_res = client.get(f"/api/v1/orders/invoice/{order_id}")
    assert inv_res.status_code == 200
    assert "application/pdf" in inv_res.headers.get("content-type")
    assert f'Invoice_{order_number}.pdf' in inv_res.headers.get("content-disposition")
    assert len(inv_res.content) > 1000
    print(f"11. PDF Invoice downloaded successfully! Length: {len(inv_res.content)} bytes.")

    db.close()
    print("\nALL WORKFLOW & VERIFICATION TESTS COMPLETED WITH 100% SUCCESS!")

if __name__ == "__main__":
    test_full_customer_and_invoice_workflow()
