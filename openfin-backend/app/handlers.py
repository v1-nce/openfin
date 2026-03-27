import json
from fastapi import Response, HTTPException
from fastapi.responses import StreamingResponse
from tinyfish import TinyFish

from app.config import get_settings
from app.schemas import User, SignupRequest, LoginRequest, AuthResponse, HealthResponse

users_db = {}

def signup_handler(data: SignupRequest) -> AuthResponse:
    if data.username in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    users_db[data.username] = data.password
    return AuthResponse(message="User created perfectly", user=User(username=data.username))

def login_handler(data: LoginRequest, response: Response) -> AuthResponse:
    from app.auth import create_access_token
    if data.username not in users_db or users_db[data.username] != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({"sub": data.username})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False  # Set to True in production over HTTPS
    )
    return AuthResponse(message="Login successful", user=User(username=data.username))

def healthcheck_handler() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(status="ok", environment=settings.environment)

async def scrape_handler(url: str, goal: str):
    settings = get_settings()
    if not settings.tinyfish_api_key:
        raise HTTPException(status_code=503, detail="TinyFish API key is not configured. Please add TINYFISH_API_KEY to .env")
        
    try:
        tf_client = TinyFish(api_key=settings.tinyfish_api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize TinyFish: {str(e)}")

    def event_stream():
        try:
            with tf_client.agent.stream(url=url, goal=goal) as stream:
                for event in stream:
                    yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
