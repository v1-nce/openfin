from pydantic import BaseModel

class User(BaseModel):
    username: str

class SignupRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class AuthResponse(BaseModel):
    message: str
    user: User

class HealthResponse(BaseModel):
    status: str
    environment: str
