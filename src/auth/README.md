# Authentication flow

1. Frontend sends a request to Google or etc., get a one-time code
2. Frontend requests a token by sending the code and the OAuth provider (Google, etc.) to the backend
3. Backend creates a session, and sends back the token that can be used
4. Frontend stores that token in the local storage
