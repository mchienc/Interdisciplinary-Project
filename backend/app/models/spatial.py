from sqlalchemy import Column, Integer, String, Text, Float, Numeric, DateTime, func
from geoalchemy2 import Geometry
from ..db import Base

class POI(Base):
    __tablename__ = "pois"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False, index=True) # heritage, beach, nature, museum, bridge, entertainment, culinary
    description = Column(Text, nullable=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    estimated_duration_min = Column(Integer, default=90)
    opening_hours = Column(String(100), default="07:30 - 18:00")
    ticket_price = Column(Integer, default=0)
    geom = Column(Geometry("POINT", srid=4326), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "lat": self.lat,
            "lon": self.lon,
            "estimated_duration_min": self.estimated_duration_min,
            "opening_hours": self.opening_hours,
            "ticket_price": self.ticket_price
        }

class Accommodation(Base):
    __tablename__ = "accommodations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), default="hotel") # resort, hotel, homestay, boutique
    stars = Column(Integer, default=3)
    rating = Column(Numeric(3, 2), default=4.0)
    price_per_night = Column(Integer, nullable=False)
    address = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    geom = Column(Geometry("POINT", srid=4326), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "stars": self.stars,
            "rating": float(self.rating) if self.rating is not None else 4.0,
            "price_per_night": self.price_per_night,
            "address": self.address,
            "phone": self.phone,
            "lat": self.lat,
            "lon": self.lon
        }
