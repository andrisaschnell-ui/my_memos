import asyncio
from sqlalchemy import text
from database import engine

async def create_indexes():
    print("Creating indexes on Supabase...")
    async with engine.begin() as conn:
        # Index on guest_id in reservations to speed up joins and lookups
        await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_reservations_guest_id ON reservations (guest_id);"))
        # Index on lodge_id in guests to speed up filtering
        await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_guests_lodge_id ON guests (lodge_id);"))
    print("Indexes created successfully.")

if __name__ == "__main__":
    asyncio.run(create_indexes())
