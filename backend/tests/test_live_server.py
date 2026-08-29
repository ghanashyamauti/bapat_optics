import requests
import uuid

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_tests():
    random_str = str(uuid.uuid4())[:8]
    test_email = f"customer_{random_str}@example.com"
    test_password = "Password@12345"

    print("--- 1. Testing Registration ---")
    reg_res = requests.post(f"{BASE_URL}/auth/register", json={
        "email": test_email,
        "full_name": "Rohan Test Kulkarni",
        "phone": "+919822011223",
        "password": test_password
    })
    print("Registration status:", reg_res.status_code)
    assert reg_res.status_code == 201, reg_res.text
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("--- 2. Testing Profile Retrieval & Update ---")
    me_res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    assert me_res.status_code == 200
    print("Current user:", me_res.json()["full_name"], me_res.json()["email"])

    up_res = requests.put(f"{BASE_URL}/auth/profile", json={
        "full_name": "Rohan Luxury Kulkarni",
        "phone": "+919822099999"
    }, headers=headers)
    assert up_res.status_code == 200
    assert up_res.json()["full_name"] == "Rohan Luxury Kulkarni"
    print("Updated profile:", up_res.json())

    print("--- 3. Testing Password Change & Re-login ---")
    new_pwd = "NewPassword@99999"
    pwd_res = requests.put(f"{BASE_URL}/auth/change-password", json={
        "old_password": test_password,
        "new_password": new_pwd
    }, headers=headers)
    assert pwd_res.status_code == 200

    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": test_email,
        "password": new_pwd
    })
    assert login_res.status_code == 200
    new_token = login_res.json()["access_token"]
    new_headers = {"Authorization": f"Bearer {new_token}"}
    print("Password change & login confirmed!")

    print("--- 4. Testing Eye Test Appointment Booking & Retrieval ---")
    apt_res = requests.post(f"{BASE_URL}/appointments", json={
        "customer_name": "Rohan Luxury Kulkarni",
        "customer_phone": "+919822099999",
        "customer_email": test_email,
        "branch": "Kothrud ZEISS Center",
        "appointment_date": "2026-09-20",
        "time_slot": "11:30 AM - 12:30 PM",
        "test_type": "Zeiss 3D Digital Wavefront Examination",
        "notes": "Automated email notification test"
    })
    assert apt_res.status_code == 201
    print("Appointment booked:", apt_res.json()["id"])

    my_apts = requests.get(f"{BASE_URL}/auth/me/appointments", headers=new_headers)
    assert my_apts.status_code == 200
    assert len(my_apts.json()) >= 1
    print("Customer appointments count:", len(my_apts.json()))

    print("--- 5. Testing Order Creation, Razorpay Verification & PDF Invoicing ---")
    # Fetch a product to order
    prods = requests.get(f"{BASE_URL}/products?page_size=1").json()["items"]
    assert len(prods) > 0
    p = prods[0]

    order_payload = {
        "customer_name": "Rohan Luxury Kulkarni",
        "customer_phone": "+919822099999",
        "customer_email": test_email,
        "delivery_type": "HOME_DELIVERY",
        "shipping_address": "Penthouse 12, Kothrud",
        "city": "Pune",
        "pincode": "411038",
        "state": "Maharashtra",
        "lens_selection_type": "ZEISS SmartLife Progressive",
        "prescription_data": "Right: -1.25 / Left: -1.50, Axis 90",
        "items": [{
            "product_id": p["id"],
            "product_name": p["name"],
            "product_sku": p["sku"],
            "product_image": p["primary_image"],
            "unit_price": p["price"],
            "quantity": 1,
            "lens_type": "ZEISS SmartLife Progressive",
            "lens_price": 5500.0
        }],
        "notes": "Urgent luxury delivery"
    }

    ord_res = requests.post(f"{BASE_URL}/orders", json=order_payload, headers=new_headers)
    assert ord_res.status_code == 201
    order_data = ord_res.json()
    order_id = order_data["order_id"]
    order_number = order_data["order_number"]
    print("Order created:", order_number)

    verify_res = requests.post(f"{BASE_URL}/orders/verify-payment", json={
        "order_id": order_id,
        "razorpay_order_id": order_data["razorpay_order_id"],
        "razorpay_payment_id": f"pay_test_{random_str}",
        "razorpay_signature": "mock_sig_valid"
    })
    assert verify_res.status_code == 200
    print("Payment verified and email dispatched!")

    # Check customer orders list
    my_orders = requests.get(f"{BASE_URL}/auth/me/orders", headers=new_headers)
    assert my_orders.status_code == 200
    assert len(my_orders.json()) >= 1
    print("Customer order list count:", len(my_orders.json()))

    # Check PDF Invoice Download
    inv_res = requests.get(f"{BASE_URL}/orders/invoice/{order_id}")
    assert inv_res.status_code == 200
    assert "application/pdf" in inv_res.headers.get("content-type", "")
    assert f"Invoice_{order_number}.pdf" in inv_res.headers.get("content-disposition", "")
    print(f"Tax Invoice PDF downloaded successfully: {len(inv_res.content)} bytes!")

    print("\n=======================================================")
    print("ALL API ENDPOINTS & PDF GENERATION TESTS PASSED 100%!")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()
