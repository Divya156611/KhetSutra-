import sys
from pathlib import Path
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from backend.database.session import Base
except ImportError:
    from database.session import Base

# 1. User Authentication Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=True, default="किसान मित्र")
    email = Column(String(120), unique=True, index=True, nullable=True)
    mobile_number = Column(String(20), unique=True, index=True, nullable=True)
    mobile = Column(String(20), nullable=True) # Synonym for mobile_number
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    farms = relationship("Farm", back_populates="user", cascade="all, delete-orphan")

# 2. Farmer Profile
class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    full_name = Column(String(100), nullable=False, default="राहुल शर्मा (Rahul Sharma)")
    mobile = Column(String(20), nullable=False, default="9876543210")
    language = Column(String(10), default="hi")  # Strictly 'hi' or 'en'
    state = Column(String(100), default="Haryana")
    district = Column(String(100), default="Faridabad")
    village = Column(String(100), default="तिगांव (Tigaon)")
    location = Column(String(150), default="तिगांव, फरीदाबाद")
    pincode = Column(String(10), default="121101")
    latitude = Column(Float, default=28.4089)
    longitude = Column(Float, default=77.3178)
    farm_area = Column(Float, default=5.0)
    total_landholding = Column(Float, default=5.0)  # in acres
    land_unit = Column(String(20), default="Acres")
    number_of_fields = Column(Integer, default=2)
    primary_soil_type = Column(String(50), default="loamy")
    primary_irrigation_method = Column(String(50), default="canal")
    is_onboarded = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    user = relationship("User", back_populates="profile")
    fields = relationship("Field", back_populates="farmer", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="farmer", cascade="all, delete-orphan")
    activities = relationship("FarmActivity", back_populates="farmer", cascade="all, delete-orphan")

# 3. Farm & Field Management
class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    farmer_id = Column(Integer, nullable=True)
    farm_name = Column(String(100), nullable=False, default="मेरा खेत (Main Farm)")
    area = Column(Float, default=5.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="farms")
    crops = relationship("Crop", back_populates="farm", cascade="all, delete-orphan")
    fields = relationship("Field", back_populates="farm")

class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    field_name = Column(String(100), nullable=False)
    area = Column(Float, nullable=False, default=2.5)  # in acres
    crop_name = Column(String(50), nullable=False, default="wheat")
    crop_variety = Column(String(100), default="HD-2967 / DBW-187")
    sowing_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    soil_type = Column(String(50), default="loamy")
    irrigation_method = Column(String(50), default="canal")
    previous_crop = Column(String(50), default="rice")
    expected_harvest_date = Column(String(20), nullable=True)
    current_stage = Column(String(100), default="Crown Root Initiation")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    farmer = relationship("FarmerProfile", back_populates="fields")
    farm = relationship("Farm", back_populates="fields")
    activities = relationship("FarmActivity", back_populates="field", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="field", cascade="all, delete-orphan")

# 4. Crop Management
class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=True)
    crop_name = Column(String(50), nullable=False)
    sowing_date = Column(String(20), nullable=False)
    season = Column(String(20), default="Rabi")
    growth_stage = Column(String(100), default="Vegetative")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    farm = relationship("Farm", back_populates="crops")

# 5. Digital Farm Diary & Activities
class FarmActivity(Base):
    __tablename__ = "farm_activities"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id"), nullable=False)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=True)
    activity_type = Column(String(50), nullable=False)
    title = Column(String(150), nullable=False)
    notes = Column(Text, nullable=True)
    date = Column(String(20), nullable=False)  # YYYY-MM-DD
    cost = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    farmer = relationship("FarmerProfile", back_populates="activities")
    field = relationship("Field", back_populates="activities")

# 6. Smart Irrigation Records
class IrrigationRecord(Base):
    __tablename__ = "irrigation_records"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id"), nullable=False)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=False)
    date = Column(String(20), nullable=False)
    status = Column(String(50), nullable=False)
    reason = Column(Text, nullable=False)
    water_source = Column(String(50), default="Canal")
    duration_hours = Column(Float, default=3.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 7. Farm Finance & Expenses
class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id"), nullable=False)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=True)
    category = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=True)
    date = Column(String(20), nullable=False)
    is_projected = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    farmer = relationship("FarmerProfile", back_populates="expenses")
    field = relationship("Field", back_populates="expenses")

# 8. Harvest Records
class HarvestRecord(Base):
    __tablename__ = "harvest_records"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id"), nullable=False)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=False)
    crop_name = Column(String(50), nullable=False)
    harvest_date = Column(String(20), nullable=False)
    yield_quantity = Column(Float, nullable=False)
    yield_unit = Column(String(20), default="Quintals (क्विंटल)")
    revenue = Column(Float, default=0.0)
    sold_to = Column(String(100), default="Local Mandi (स्थानीय मंडी)")
    quality_grade = Column(String(20), default="Grade A")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 9. AI Crop Doctor Observations
class CropHealthObservation(Base):
    __tablename__ = "crop_health_observations"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id"), nullable=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=True)
    crop_name = Column(String(50), default="Wheat")
    image_url = Column(Text, nullable=True)
    detected_issue_en = Column(String(150), nullable=False)
    detected_issue_hi = Column(String(150), nullable=False)
    symptoms_en = Column(Text, nullable=False)
    symptoms_hi = Column(Text, nullable=False)
    confidence = Column(String(20), default="High (88%)")
    preventive_measures_en = Column(Text, nullable=False)
    preventive_measures_hi = Column(Text, nullable=False)
    expert_advice_needed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 10. Government Schemes Catalog
class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id = Column(Integer, primary_key=True, index=True)
    scheme_code = Column(String(50), unique=True, nullable=False)
    name_en = Column(String(200), nullable=False)
    name_hi = Column(String(200), nullable=False)
    ministry = Column(String(150), nullable=False)
    benefit_amount = Column(String(255), nullable=True)
    description_en = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=False)
    eligibility_en = Column(Text, nullable=False)
    eligibility_hi = Column(Text, nullable=False)
    documents_en = Column(Text, nullable=False)
    documents_hi = Column(Text, nullable=False)
    official_url = Column(String(255), nullable=False)
    last_verified = Column(String(50), default="March 2026")

# 11. Notifications & Field Alerts
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id"), nullable=True)
    title_en = Column(String(150), nullable=False)
    title_hi = Column(String(150), nullable=False)
    message_en = Column(Text, nullable=False)
    message_hi = Column(Text, nullable=False)
    type = Column(String(50), default="advisory")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 12. Chat Messages
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, nullable=True)
    user_message = Column(Text, nullable=False)
    assistant_message = Column(Text, nullable=False)
    language = Column(String(10), default="hi")
    tools_used = Column(Text, nullable=True)
    confidence = Column(String(20), default="High")
    why_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Backward Compatibility
class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, default="राहुल शर्मा")
    language = Column(String(20), default="hi")
    village_or_district = Column(String(150), nullable=False, default="Faridabad, Haryana")
    crop = Column(String(50), nullable=False, default="wheat")
    sowing_date = Column(String(20), nullable=False, default="2024-11-10")
    field_size = Column(Float, nullable=False, default=2.5)
    soil_type = Column(String(50), nullable=False, default="loamy")
    irrigation_method = Column(String(50), nullable=False, default="canal")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class Advisory(Base):
    __tablename__ = "advisories"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, nullable=True)
    recommendation = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    confidence = Column(String(20), default="High")
    weather_snapshot = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
