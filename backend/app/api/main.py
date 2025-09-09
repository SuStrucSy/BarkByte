from fastapi import APIRouter

from app.api.routes import utils, private, login, users, specimen, failuremode, joinerytype
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(specimen.router)
api_router.include_router(failuremode.router)
api_router.include_router(joinerytype.router)

if settings.ENVIRONMENT == "local":
  api_router.include_router(private.router)
