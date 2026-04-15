import requests
import json

BASE_URL = "http://localhost:3000/server/communityAPI"

def test_create_invoice():
    print("Testing Invoice Creation...")
    payload = {
        "residentId": "1234567890123456789",
        "resident": "Test Resident",
        "apartment": "T-999",
        "amount": 1500.50,
        "dueDate": "2024-12-31",
        "status": "pending",
        "type": "Maintenance"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/invoices", json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        if response.status_code == 201:
            print("SUCCESS: Invoice created.")
        else:
            print("FAILURE: Could not create invoice.")
    except Exception as e:
        print(f"ERROR: {e}")

def test_list_invoices():
    print("\nTesting Invoice Listing...")
    try:
        response = requests.get(f"{BASE_URL}/invoices")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json().get('data', [])
            print(f"Found {len(data)} invoices.")
            print("SUCCESS: Invoices fetched.")
        else:
            print("FAILURE: Could not fetch invoices.")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_create_invoice()
    test_list_invoices()
