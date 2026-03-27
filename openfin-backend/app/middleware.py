from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.auth import verify_token

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Open routes that bypass JWT verification
        open_routes = ["/auth/login", "/auth/signup", "/docs", "/openapi.json", "/", "/health"]
        
        # We also allow the scrape SSE endpoint to proceed without strict token verification for this phase, 
        # or we could secure it. Let's secure everything else.
        if request.url.path in open_routes or request.url.path.startswith("/api/scrape"):
            return await call_next(request)
            
        token = request.cookies.get("access_token")
        if not token:
            return JSONResponse(status_code=401, content={"detail": "Not authenticated. Missing cookie."})
            
        user_payload = verify_token(token)
        if not user_payload:
            return JSONResponse(status_code=401, content={"detail": "Invalid or expired token."})
            
        request.state.user = user_payload
        return await call_next(request)
