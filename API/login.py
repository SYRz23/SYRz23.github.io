import json

def handler(request):
    # Define a simple hardcoded username and password (for demonstration)
    correct_username = "admin"
    correct_password = "password123"
    
    # Parse the incoming JSON request body
    try:
        body = json.loads(request.get_data())
    except json.JSONDecodeError:
        return json.dumps({'error': 'Invalid JSON format'}), 400
    
    # Extract the username and password from the request body
    username = body.get('username')
    password = body.get('password')
    
    # Check if username and password match the hardcoded credentials
    if username == correct_username and password == correct_password:
        return json.dumps({'message': 'Login successful'}), 200
    else:
        return json.dumps({'message': 'Invalid credentials'}), 401
