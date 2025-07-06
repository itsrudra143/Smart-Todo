import jwt
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import authentication, exceptions


class SupabaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request).split()

        if not auth_header or auth_header[0].lower() != b"bearer":
            return None  # No token provided, authentication will fail

        if len(auth_header) != 2:
            raise exceptions.AuthenticationFailed(
                "Invalid token header. No credentials provided."
            )

        token = auth_header[1]
        try:
            decoded_token = jwt.decode(
                token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"]
            )

            user_id = decoded_token.get("sub")
            email = decoded_token.get("email")

            if not user_id or not email:
                raise exceptions.AuthenticationFailed(
                    "Invalid token: missing user identification."
                )

            # This is "Just-In-Time" user provisioning.
            # If the user from the JWT doesn't exist in our Django database, create them.
            user, created = User.objects.get_or_create(
                username=user_id, defaults={"email": email}
            )

            return (user, None)

        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token has expired.")
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f"Invalid token: {e}")
        except Exception as e:
            raise exceptions.AuthenticationFailed(
                f"An unexpected error occurred during authentication: {e}"
            )
