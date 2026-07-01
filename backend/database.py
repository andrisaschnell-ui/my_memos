from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv
import os, ssl

load_dotenv()

raw_db_url = os.getenv("DATABASE_URL", "postgresql://memuser:mempass@db:5432/memassist")

# Ensure asyncpg driver is specified
if not raw_db_url.startswith("postgresql+asyncpg://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql+asyncpg://").replace("postgresql://", "postgresql+asyncpg://")

DATABASE_URL = raw_db_url

# Append prepared_statement_cache_size=0 to URL query parameters for PgBouncer / Transaction pooling mode
if "prepared_statement_cache_size" not in DATABASE_URL:
    if "?" in DATABASE_URL:
        DATABASE_URL += "&prepared_statement_cache_size=0"
    else:
        DATABASE_URL += "?prepared_statement_cache_size=0"

# Configure SSL for cloud databases (Supabase / Railway)
connect_args = {}
# Disable prepared statement cache for transaction pooler (PgBouncer compatibility)
connect_args["statement_cache_size"] = 0
connect_args["timeout"] = 10.0
connect_args["command_timeout"] = 10.0

if "supabase" in DATABASE_URL or "railway" in DATABASE_URL:
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ssl_context

engine = create_async_engine(DATABASE_URL, echo=False, connect_args=connect_args, pool_pre_ping=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
