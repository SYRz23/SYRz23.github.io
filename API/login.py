import json

def handler(request):
    correct_username = "admin"
    correct_password = "password123"
    
    try:
        # Get JSON body from the incoming request
        body = json.loads(request.get_data())
    except json.JSONDecodeError:
        # Handle invalid JSON format error
        return json.dumps({'error': 'Invalid JSON format'}), 400
    
    # Retrieve username and password from the incoming request body
    username = body.get('username')
    password = body.get('password')
    
    # Check if the provided credentials match the expected ones
    if username == correct_username and password == correct_password:
        return json.dumps({'message': 'Login successful'}), 200
    else:
        return json.dumps({'message': 'Invalid credentials'}), 401
