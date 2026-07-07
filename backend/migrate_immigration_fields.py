import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

db_url = "postgresql+asyncpg://postgres.iggjokbdhdgsfuanuqzc:gOYPbISmpNzYaZFg@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?prepared_statement_cache_size=0"

async def migrate():
    engine = create_async_engine(db_url, connect_args={"statement_cache_size": 0})
    async with engine.begin() as conn:
        print("Adding arrived_from, visa_number, and visa_validity to guests table...")
        await conn.execute(text("""
            ALTER TABLE guests ADD COLUMN IF NOT EXISTS arrived_from VARCHAR(255);
        """))
        await conn.execute(text("""
            ALTER TABLE guests ADD COLUMN IF NOT EXISTS visa_number VARCHAR(100);
        """))
        await conn.execute(text("""
            ALTER TABLE guests ADD COLUMN IF NOT EXISTS visa_validity DATE;
        """))
        
        print("Adding location to lodges table...")
        await conn.execute(text("""
            ALTER TABLE lodges ADD COLUMN IF NOT EXISTS location VARCHAR(255);
        """))
        
        print("Migration queries run successfully!")

if __name__ == "__main__":
    asyncio.run(migrate())
