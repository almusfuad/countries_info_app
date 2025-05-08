from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from api.serializers.auth import LoginSerializer



class LoginView(APIView):
    """API view for user login.
    
    This view handles user authentication and returns a token if successful.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle user login.
        
        This method authenticates the user and returns a token if successful.
        """
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.validated_data.get("user")
        try:
            # Generate JWT token
            refresh = RefreshToken.for_user(user)
            access = str(refresh.access_token)
            
            return Response({
                'message': 'Login successful',
                'refresh': str(refresh),
                'access': access,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "detail": f"Failed to login: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            


class LogoutView(APIView):
    """API view for user logout.
    
    This view handles user logout and invalidates the session.
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        """Handle user logout.
        
        This method invalidates the user's session.
        """
        
        try:
            refresh_token = request.query_params.get('refresh_token')
            if not refresh_token:
                return Response({
                    "detail": "Refresh token is required."
                }, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "detail": f"Failed to logout: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            