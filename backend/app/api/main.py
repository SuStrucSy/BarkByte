from fastapi import APIRouter

from app.api.routes import utils, private, login, users, specimen, failuremode, joinerytype, subjoinerytype, fastenertype, loadingdirection
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(specimen.router)
api_router.include_router(failuremode.router)
api_router.include_router(joinerytype.router)
api_router.include_router(subjoinerytype.router)
api_router.include_router(fastenertype.router)
api_router.include_router(loadingdirection.router)

if settings.ENVIRONMENT == "local":
  api_router.include_router(private.router)
