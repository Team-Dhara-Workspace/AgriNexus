import json
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def signup_view(request):
    if request.method != 'POST':
        return JsonResponse({"success": False, "error": "Only POST requests are allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid JSON payload"}, status=400)
    
    # Extract fields with case/naming variations
    username = data.get('username') or data.get('UserName') or data.get('username')
    email = data.get('email') or data.get('Email') or data.get('email')
    password = data.get('password') or data.get('new_password') or data.get('newPassword') or data.get('New password')
    confirm_password = data.get('confirm_password') or data.get('confirmPassword') or data.get('enterPasswordAgain') or data.get('Enter password again')
    
    # Strip spaces
    if username:
        username = username.strip()
    if email:
        email = email.strip()
        
    if not username or not email or not password or not confirm_password:
        return JsonResponse({"success": False, "error": "All fields (username, email, password, and confirm password) are required"}, status=400)
        
    if password != confirm_password:
        return JsonResponse({"success": False, "error": "Passwords do not match"}, status=400)
        
    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse({"success": False, "error": "Username is already taken"}, status=400)
        
    if User.objects.filter(email__iexact=email).exists():
        return JsonResponse({"success": False, "error": "Email is already registered"}, status=400)
        
    try:
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        return JsonResponse({"success": True, "message": "User registered successfully"}, status=201)
    except Exception as e:
        return JsonResponse({"success": False, "error": f"Failed to create user: {str(e)}"}, status=500)

@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({"success": False, "error": "Only POST requests are allowed"}, status=405)
        
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid JSON payload"}, status=400)
        
    # Extract identifier (either email or username)
    identifier = data.get('email_or_username') or data.get('username') or data.get('email') or data.get('identifier')
    password = data.get('password')
    
    if identifier:
        identifier = identifier.strip()
        
    if not identifier or not password:
        return JsonResponse({"success": False, "error": "Email/username and password are required"}, status=400)
        
    user = None
    
    # Try finding user by email first
    if '@' in identifier:
        user_obj = User.objects.filter(email__iexact=identifier).first()
        if user_obj:
            user = authenticate(request, username=user_obj.username, password=password)
            
    # Try finding user by username
    if user is None:
        user_obj = User.objects.filter(username__iexact=identifier).first()
        if user_obj:
            user = authenticate(request, username=user_obj.username, password=password)
        else:
            # Fallback to direct authenticate in case identifier is the username itself
            user = authenticate(request, username=identifier, password=password)
            
    if user is not None:
        login(request, user)
        return JsonResponse({
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        })
    else:
        return JsonResponse({"success": False, "error": "Invalid username/email or password"}, status=401)

@csrf_exempt
def logout_view(request):
    if request.method != 'POST':
        return JsonResponse({"success": False, "error": "Only POST requests are allowed"}, status=405)
    logout(request)
    return JsonResponse({"success": True, "message": "Logged out successfully"})
