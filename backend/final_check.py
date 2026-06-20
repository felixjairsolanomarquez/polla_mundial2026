import http.client
import json

def check():
    conn = http.client.HTTPConnection("127.0.0.1", 8000)
    
    print("--- TESTING /admin/lookups ---")
    conn.request("GET", "/admin/lookups")
    res = conn.getresponse()
    if res.status == 200:
        data = json.loads(res.read().decode())
        print(f"Total pending_matches returned: {len(data['pending_matches'])}")
        for m in data['pending_matches']:
            print(f"  [PENDING] ID: {m['id']} | {m['name']}")
        
        print(f"Total all_matches returned: {len(data['all_matches'])}")
        for m in data['all_matches']:
            print(f"  [ALL] ID: {m['id']} | {m['home']} vs {m['away']} | Status: '{m['status']}'")
    else:
        print(f"Error Lookup: {res.status}")
    
    conn.close()

if __name__ == "__main__":
    check()
