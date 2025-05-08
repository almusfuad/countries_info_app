from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate



class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for the User model.
    
    This serializer is used to convert the User model instances into JSON format
    and validate incoming data for creating or updating User instances.
    """
    
    
    def validate_username(self, value):
        """Validate hat the username is unique."""
        if not value.strip():
            raise serializers.ValidationError("Username cannot be empty.")
        
        # Check for the existing username
        queryset = User.objects.filter(username__iexact=value.strip())
        
        
        # Exclude the current user during updates
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
            
        if queryset.exists():
            raise serializers.ValidationError("Username already exists.")
        
        return value.strip()
    
    
    def validate_email(self, value):
        """Validate that the email is unique and properly formatted."""
        if value and not value.strip():
            raise serializers.ValidationError("Email cannot be empty.")
        
        # Check for existing email
        if value:
            queryset = User.objects.filter(email__iexact=value.strip())
            
            
            # Exclude the current user during updates
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError("Email already exists.")
        return value.strip() if value else ""
    
    
    
    def validate(self, data):
        """Perform object-level validation."""
        # Ensure password is provided
        if not self.instance and 'password' not in data:
            raise serializers.ValidationError({"password": "Password is required."})
        
        return data
    
    
    def create(self, validated_data):
        """Create a new user with the validated data."""
        # Remove password from validated data
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        # Set the password using set_password to hash it
        if password:
            user.set_password(password)
        user.save()
        return user
    
    
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': True},
            'username': {'required': True},
            'email': {'required': False},
        }
        read_only_fields = ['id']
        
        
        
class LoginSerializer(serializers.Serializer):
    """Serializer for user login.
    
    This serializer is used to validate the username and password during login.
    """
    
    
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    
    def validate(self, data):
        """Validate login credentials."""
        username = data.get('username')
        password = data.get('password')
        
        
        if not username:
            raise serializers.ValidationError({"username":"Username can not be empty."})
        if not password:
            raise serializers.ValidationError({"password":"Password can not be empty."})
        
        
        # Authenticate the user
        user = authenticate(username=username, password=password)
        
        if user is None:
            raise serializers.ValidationError({"non_field_errors": "Invalid username or password."})
        
        
        if not user.is_active:
            raise serializers.ValidationError({"non_field_errors": "User account is inactive."})
        
        data['user']=user
        return data
