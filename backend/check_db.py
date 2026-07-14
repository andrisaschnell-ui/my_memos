import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import sys

# Load env manually
env_p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
if os.path.exists(env_p):
    with open(env_p, "r", encoding="utf-8") as f:
        for line in f:
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.strip().split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL.startswith("postgresql+asyncpg://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://").replace("postgresql://", "postgresql+asyncpg://")
if "prepared_statement_cache_size" not in DATABASE_URL:
    DATABASE_URL += "?prepared_statement_cache_size=0"

import ssl
connect_args = {"statement_cache_size": 0, "timeout": 10.0, "command_timeout": 10.0}
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE
connect_args["ssl"] = ssl_context

engine = create_async_engine(DATABASE_URL, echo=False, connect_args=connect_args)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def check():
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("UPDATE recordings SET lodge_id = '9b3dea15-2ab2-484e-8859-c4309a817e5b' WHERE lodge_id IS NULL;"))
        await session.commit()
        print("Database updated!")

asyncio.run(check())
