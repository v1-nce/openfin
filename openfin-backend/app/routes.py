from fastapi import APIRouter
from app.handlers import healthcheck_handler, scrape_handler, signup_handler, login_handler
from app.schemas import HealthResponse

api_router = APIRouter()

api_router.add_api_route("/health", healthcheck_handler, methods=["GET"], response_model=HealthResponse, tags=["health"])
api_router.add_api_route("/auth/signup", signup_handler, methods=["POST"], tags=["auth"])
api_router.add_api_route("/auth/login", login_handler, methods=["POST"], tags=["auth"])
api_router.add_api_route("/api/scrape", scrape_handler, methods=["POST"], tags=["scrape"])
