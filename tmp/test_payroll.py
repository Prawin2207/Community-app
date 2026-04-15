import requests
import json

BASE_URL = "http://localhost:3000/server/communityAPI"

def test_generate_payroll():
    print("Testing Payroll Generation...")
    payload = {
        "staffId": "9876543210987654321",
        "amount": 25000.00,
        "month": "December 2024",
        "payrolldate": "2024-12-01",
        "status": "Pending"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/payroll", json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        if response.status_code == 201:
            print("SUCCESS: Payroll created.")
        else:
            print("FAILURE: Could not create payroll.")
    except Exception as e:
        print(f"ERROR: {e}")

def test_list_payroll():
    print("\nTesting Payroll Listing...")
    try:
        response = requests.get(f"{BASE_URL}/payroll")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json().get('data', [])
            print(f"Found {len(data)} payroll records.")
            print("SUCCESS: Payroll records fetched.")
        else:
            print("FAILURE: Could not fetch payroll.")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_generate_payroll()
    test_list_payroll()
