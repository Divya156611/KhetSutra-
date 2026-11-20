import os
import sys
import time
import secrets
from pathlib import Path

# Setup paths so imports succeed whether running from project root or inside backend/
BACKEND_DIR = Path(__file__).resolve().parent
ROOT_DIR = BACKEND_DIR.parent

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from contextlib import asynccontextmanager
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, Query, status, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

AUTH_ATTEMPTS: Dict[str, List[float]] = {}

def check_auth_rate_limit(request: Request) -> None:
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    attempts = [stamp for stamp in AUTH_ATTEMPTS.get(client_ip, []) if now - stamp < 600]
    if len(attempts) >= 10:
        raise HTTPException(status_code=429, detail="Too many authentication attempts. Please try again later.")
    attempts.append(now)
    AUTH_ATTEMPTS[client_ip] = attempts

# Import using try/except to support running both as 'main' and as 'backend.main'
try:
    from backend.config import settings
    from backend.database.session import engine, Base, get_db
    from backend.database.models import (
        User, FarmerProfile, Farm, Field, FarmActivity,
        IrrigationRecord, Expense, HarvestRecord,
        CropHealthObservation, GovernmentScheme, Notification,
        ChatMessage, Farmer, Advisory
    )
    from backend.models.schemas import (
        UserRegisterRequest, UserLoginRequest, ForgotPasswordRequest,
 TokenResponse, AuthResponse, UserMeResponse,
        FarmerProfileCreate, FarmerProfileUpdate, FarmerProfileResponse,
        FieldCreate, FieldUpdate, FieldResponse,
        FarmActivityCreate, FarmActivityResponse,
        ExpenseCreate, ExpenseResponse, FinanceSummaryResponse,
        MandiPriceResponse,
        GovernmentSchemeResponse,
        CropDoctorRequest, CropDoctorResponse,
        SeasonalPlannerResponse,
        RiskScoreResponse, RiskFactorItem,
        HarvestPlannerResponse,
        WeatherForecastResponse, CropStageInfo, DailyBriefingResponse,
        ChatRequest, ChatResponse, FarmerCreate, FarmerResponse
    )
    from backend.services.weather_service import WeatherService
    from backend.services.crop_data import calculate_crop_stage, CROPS_DATABASE, SEASONAL_INTELLIGENCE, detect_season
    from backend.services.agronomy_rules import AgronomyRulesEngine
    from backend.services.auth_service import AuthService
    from backend.services.mandi_service import MandiDataUnavailable, MandiService
    from backend.services.schemes_service import SchemesService, GOVERNMENT_SCHEMES
    from backend.services.crop_doctor_service import CropDoctorService, DISEASE_KNOWLEDGE_BASE
    from backend.agent.copilot_agent import CopilotAgent
    from backend.auth.dependencies import get_current_user, get_optional_user
except ImportError:
    from config import settings
    from database.session import engine, Base, get_db
    from database.models import (
        User, FarmerProfile, Farm, Field, FarmActivity,
        IrrigationRecord, Expense, HarvestRecord,
        CropHealthObservation, GovernmentScheme, Notification,
        ChatMessage, Farmer, Advisory
    )
    from models.schemas import (
        UserRegisterRequest, UserLoginRequest, ForgotPasswordRequest,
        TokenResponse, AuthResponse, UserMeResponse,
        FarmerProfileCreate, FarmerProfileUpdate, FarmerProfileResponse,
        FieldCreate, FieldUpdate, FieldResponse,
        FarmActivityCreate, FarmActivityResponse,
        ExpenseCreate, ExpenseResponse, FinanceSummaryResponse,
        MandiPriceResponse,
        GovernmentSchemeResponse,
        CropDoctorRequest, CropDoctorResponse,
        SeasonalPlannerResponse,
        RiskScoreResponse, RiskFactorItem,
        HarvestPlannerResponse,
        WeatherForecastResponse, CropStageInfo, DailyBriefingResponse,
        ChatRequest, ChatResponse, FarmerCreate, FarmerResponse
    )
    from services.weather_service import WeatherService
    from services.crop_data import calculate_crop_stage, CROPS_DATABASE, SEASONAL_INTELLIGENCE, detect_season
    from services.agronomy_rules import AgronomyRulesEngine
    from services.auth_service import AuthService
    from services.mandi_service import MandiDataUnavailable, MandiService
    from services.schemes_service import SchemesService, GOVERNMENT_SCHEMES
    from services.crop_doctor_service import CropDoctorService, DISEASE_KNOWLEDGE_BASE
    from agent.copilot_agent import CopilotAgent
    from auth.dependencies import get_current_user, get_optional_user

def init_db():
    """Initializes tables and seeds default realistic agricultural data."""
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE government_schemes ADD COLUMN benefit_amount VARCHAR(255)"))
            conn.commit()
        except Exception:
            pass
    Base.metadata.create_all(bind=engine)
    try:
        from backend.database.session import SessionLocal
    except ImportError:
        from database.session import SessionLocal
    db = SessionLocal()
    try:
        # 1. Seed Government Schemes
        if db.query(GovernmentScheme).count() == 0:
            for s in GOVERNMENT_SCHEMES:
                scheme_obj = GovernmentScheme(
                    scheme_code=s["scheme_code"],
                    name_en=s["name_en"],
                    name_hi=s["name_hi"],
                    ministry=s["ministry"],
                    benefit_amount=s.get("benefit_amount", ""),
                    description_en=s["description_en"],
                    description_hi=s["description_hi"],
                    eligibility_en=s["eligibility_en"],
                    eligibility_hi=s["eligibility_hi"],
                    documents_en=s["documents_en"],
                    documents_hi=s["documents_hi"],
                    official_url=s["official_url"],
                    last_verified=s.get("last_verified", "November 2026")
                )
                db.add(scheme_obj)
            db.commit()

        # 2. Seed Default User & FarmerProfile
        user = db.query(User).filter((User.mobile == "9876543210") | (User.mobile_number == "9876543210")).first()
        if not user:
            user = User(
                full_name="राहुल शर्मा (Rahul Sharma)",
                mobile="9876543210",
                mobile_number="9876543210",
                email="rahul.sharma@kisanmitra.in",
                password_hash=AuthService.hash_password(secrets.token_urlsafe(32)),
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
        if not profile:
            profile = FarmerProfile(
                user_id=user.id,
                full_name="राहुल शर्मा (Rahul Sharma)",
                mobile="9876543210",
                language="hi",
                state="Haryana",
                district="Faridabad",
                village="तिगांव (Tigaon)",
                pincode="121101",
                latitude=28.4089,
                longitude=77.3178,
                total_landholding=5.0,
                land_unit="Acres",
                number_of_fields=2,
                primary_soil_type="loamy",
                primary_irrigation_method="canal",
                is_onboarded=True
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)

        # 3. Seed Default Fields
        if db.query(Field).filter(Field.farmer_id == profile.id).count() == 0:
            sowing_wheat = (datetime.now() - timedelta(days=32)).strftime("%Y-%m-%d")
            sowing_mustard = (datetime.now() - timedelta(days=45)).strftime("%Y-%m-%d")
            
            f1 = Field(
                farmer_id=profile.id,
                field_name="उत्तर खेत (North Plot - Wheat)",
                area=3.0,
                crop_name="wheat",
                crop_variety="HD-2967 / DBW-187",
                sowing_date=sowing_wheat,
                soil_type="loamy",
                irrigation_method="canal",
                previous_crop="rice",
                expected_harvest_date=(datetime.now() + timedelta(days=103)).strftime("%Y-%m-%d"),
                current_stage="Crown Root Initiation (CRI)"
            )
            f2 = Field(
                farmer_id=profile.id,
                field_name="दक्षिण खेत (South Plot - Mustard)",
                area=2.0,
                crop_name="mustard",
                crop_variety="Pusa Bold (पूसा बोल्ड)",
                sowing_date=sowing_mustard,
                soil_type="loamy",
                irrigation_method="sprinkler",
                previous_crop="fallow",
                expected_harvest_date=(datetime.now() + timedelta(days=75)).strftime("%Y-%m-%d"),
                current_stage="Flowering & Pod Formation"
            )
            db.add_all([f1, f2])
            db.commit()

        # 4. Seed Default Expenses
        if db.query(Expense).filter(Expense.farmer_id == profile.id).count() == 0:
            exp1 = Expense(farmer_id=profile.id, category="seeds", amount=3500.0, description="गेहूँ व सरसों उन्नत बीज (Certified Seeds)", date=(datetime.now() - timedelta(days=35)).strftime("%Y-%m-%d"))
            exp2 = Expense(farmer_id=profile.id, category="fertilizers", amount=5800.0, description="DAP व यूरिया बेसल खाद (Basal DAP & Urea)", date=(datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"))
            exp3 = Expense(farmer_id=profile.id, category="machinery", amount=4200.0, description="ट्रैक्टर जुताई व रोटावेटर भाड़ा (Tractor & Rotavator)", date=(datetime.now() - timedelta(days=33)).strftime("%Y-%m-%d"))
            exp4 = Expense(farmer_id=profile.id, category="labour", amount=3000.0, description="बुवाई व पलेवा मजदूरी (Sowing Labour)", date=(datetime.now() - timedelta(days=28)).strftime("%Y-%m-%d"))
            exp5 = Expense(farmer_id=profile.id, category="irrigation", amount=1500.0, description="पहली सिंचाई डीजल/नहर पर्ची (Irrigation)", date=(datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d"))
            db.add_all([exp1, exp2, exp3, exp4, exp5])
            db.commit()

        # 5. Seed Default Farm Activities (Diary)
        if db.query(FarmActivity).filter(FarmActivity.farmer_id == profile.id).count() == 0:
            act1 = FarmActivity(farmer_id=profile.id, activity_type="sowing", title="गेहूँ बुवाई संपन्न (Wheat Sowing Done)", notes="HD-2967 बीज उपचारित कर 3 एकड़ में सीड-कम-फर्टिलाइजर ड्रिल से बोया।", date=(datetime.now() - timedelta(days=32)).strftime("%Y-%m-%d"), cost=3500.0)
            act2 = FarmActivity(farmer_id=profile.id, activity_type="irrigation", title="पहली सिंचाई - CRI अवस्था (First Irrigation - CRI)", notes="बुवाई के 22वें दिन नहर से हल्की सिंचाई की गई।", date=(datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d"), cost=1500.0)
            act3 = FarmActivity(farmer_id=profile.id, activity_type="pest_obs", title="खेत निरीक्षण - खरपतवार व कीट जांच", notes="सरसों में हल्के एफिड (माहू) का प्रारंभिक लक्षण दिखा, निगरानी जारी।", date=(datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d"), cost=0.0)
            db.add_all([act1, act2, act3])
            db.commit()

        # 6. Legacy Farmer table seed for backward compatibility
        legacy_farmer = db.query(Farmer).first()
        if not legacy_farmer:
            legacy_farmer = Farmer(
                name="राहुल शर्मा (Rahul Sharma)",
                language="hi",
                village_or_district="Faridabad, Haryana",
                crop="wheat",
                sowing_date=(datetime.now() - timedelta(days=32)).strftime("%Y-%m-%d"),
                field_size=5.0,
                soil_type="loamy",
                irrigation_method="canal"
            )
            db.add(legacy_farmer)
            db.commit()

    finally:
        db.close()

# Auto-initialize database schema and seeds on startup
try:
    init_db()
except Exception as e:
    print(f"init_db warning: {e}")

# Lifespan context to initialize database
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-CSRF-Token"],
)

@app.middleware("http")
async def csrf_protection(request: Request, call_next):
    if request.method in {"POST", "PUT", "PATCH", "DELETE"} and request.cookies.get("khetsutra_token"):
        cookie_token = request.cookies.get("kisanmitra_csrf")
        header_token = request.headers.get("X-CSRF-Token")
        if not cookie_token or not header_token or cookie_token != header_token:
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=403,
                content={"detail": "CSRF validation failed."}
            )
    return await call_next(request)

agent = CopilotAgent()

# Helper to get active profile
def get_active_profile(db: Session, current_user: Optional[User] = None) -> FarmerProfile:
    if current_user:
        p = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
        if p:
            return p
        p = FarmerProfile(
            user_id=current_user.id,
            full_name=current_user.full_name or "किसान मित्र",
            mobile=current_user.mobile or current_user.mobile_number or "",
            language="hi",
            state="",
            district="",
            village="",
            is_onboarded=False
        )
        db.add(p)
        db.commit()
        db.refresh(p)
        return p
    p = db.query(FarmerProfile).filter(FarmerProfile.user_id.is_(None)).order_by(FarmerProfile.id.asc()).first()
    if not p:
        p = FarmerProfile(
            full_name="राहुल शर्मा (Rahul Sharma)",
            mobile="9876543210",
            language="hi",
            state="Haryana",
            district="Faridabad",
            village="तिगांव (Tigaon)",
            pincode="121101",
            total_landholding=5.0,
            number_of_fields=2,
            primary_soil_type="loamy",
            primary_irrigation_method="canal",
            is_onboarded=True
        )
        db.add(p)
        db.commit()
        db.refresh(p)
    return p

# ----------------- 1. Authentication Endpoints -----------------

@app.post("/api/auth/register", response_model=TokenResponse)
def register_user(req: UserRegisterRequest, response: Response, request: Request, db: Session = Depends(get_db)):
    check_auth_rate_limit(request)
    # Check if mobile or email exists
    existing = None
    if req.mobile:
        existing = db.query(User).filter((User.mobile == req.mobile) | (User.mobile_number == req.mobile)).first()
    if not existing and req.email:
        existing = db.query(User).filter(User.email == req.email).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this mobile number or email already exists. Please login."
        )

    pwd_hash = AuthService.hash_password(req.password)
    user = User(
        full_name=req.full_name,
        email=req.email,
        mobile=req.mobile,
        mobile_number=req.mobile,
        password_hash=pwd_hash,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = FarmerProfile(
        user_id=user.id,
        full_name=req.full_name,
        mobile=req.mobile or "9876543210",
        language=req.language if req.language in ["hi", "en"] else "hi",
        state=req.state or "Haryana",
        district=req.district or "Faridabad",
        village=req.village or "तिगांव (Tigaon)",
        is_onboarded=False
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    # Issue HS256 JWT Token
    token_payload = {
        "sub": str(user.id),
        "mobile": user.mobile or "",
        "email": user.email or "",
        "name": user.full_name or ""
    }
    access_token = AuthService.create_access_token(token_payload)

    # Set secure HttpOnly cookie
    max_age_sec = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    response.set_cookie(
        key="khetsutra_token",
        value=access_token,
        httponly=True,
        max_age=max_age_sec,
        samesite="lax",
        secure=settings.ENVIRONMENT.lower() == "production"
    )
    csrf_token = secrets.token_urlsafe(32)
    response.set_cookie(
        key="kisanmitra_csrf",
        value=csrf_token,
        httponly=False,
        max_age=max_age_sec,
        samesite="lax",
        secure=settings.ENVIRONMENT.lower() == "production"
    )

    return TokenResponse(
        access_token=None,
        token_type="bearer",
        user_id=user.id,
        full_name=profile.full_name,
        mobile=user.mobile,
        email=user.email,
        language=profile.language,
        is_onboarded=profile.is_onboarded,
        message="Account created successfully! Welcome to KhetSutra."
    )

@app.post("/api/auth/login", response_model=TokenResponse)
def login_user(req: UserLoginRequest, response: Response, request: Request, db: Session = Depends(get_db)):
    check_auth_rate_limit(request)
    ident = req.get_identifier().strip()
    if not ident:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number or email is required."
        )

    # Find user by mobile, mobile_number or email
    user = db.query(User).filter(
        (User.mobile == ident) | 
        (User.mobile_number == ident) | 
        (User.email == ident)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid mobile number/email or password."
        )

    # Verify password with bcrypt
    is_valid_pwd = AuthService.verify_password(req.password, user.password_hash)
    if not is_valid_pwd:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid mobile number/email or password."
        )

    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
    if not profile:
        profile = FarmerProfile(
            user_id=user.id,
            full_name=user.full_name or "किसान मित्र (Farmer)",
            mobile=user.mobile or "9876543210",
            language="hi",
            is_onboarded=True
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Remember me extension
    expires_delta = timedelta(days=30) if req.remember_me else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {
        "sub": str(user.id),
        "mobile": user.mobile or "",
        "email": user.email or "",
        "name": user.full_name or ""
    }
    access_token = AuthService.create_access_token(token_payload, expires_delta=expires_delta)

    # Set secure HttpOnly cookie
    max_age_sec = int(expires_delta.total_seconds())
    response.set_cookie(
        key="khetsutra_token",
        value=access_token,
        httponly=True,
        max_age=max_age_sec,
        samesite="lax",
        secure=settings.ENVIRONMENT.lower() == "production"
    )
    csrf_token = secrets.token_urlsafe(32)
    response.set_cookie(
        key="kisanmitra_csrf",
        value=csrf_token,
        httponly=False,
        max_age=max_age_sec,
        samesite="lax",
        secure=settings.ENVIRONMENT.lower() == "production"
    )

    return TokenResponse(
        access_token=None,
        token_type="bearer",
        user_id=user.id,
        full_name=profile.full_name,
        mobile=user.mobile,
        email=user.email,
        language=profile.language,
        is_onboarded=profile.is_onboarded,
        message="Login successful! Welcome to KhetSutra."
    )

@app.post("/api/auth/logout")
def logout_user(response: Response):
    response.delete_cookie("khetsutra_token")
    response.delete_cookie("kisanmitra_csrf")
    return {"status": "success", "message": "Logged out successfully."}

@app.get("/api/auth/me", response_model=UserMeResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
    return UserMeResponse(
        id=current_user.id,
        full_name=current_user.full_name or (profile.full_name if profile else "किसान मित्र"),
        email=current_user.email,
        mobile=current_user.mobile or current_user.mobile_number,
        language=profile.language if profile else "hi",
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        profile={
            "id": profile.id,
            "user_id": profile.user_id,
            "full_name": profile.full_name,
            "mobile": profile.mobile,
            "language": profile.language,
            "state": profile.state,
            "district": profile.district,
            "village": profile.village,
            "is_onboarded": profile.is_onboarded
        } if profile else None
    )

@app.post("/api/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Password recovery is not available until a verified email or SMS provider is configured."
    )

@app.post("/api/auth/refresh", response_model=TokenResponse)
def refresh_token(response: Response, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
    token_payload = {
        "sub": str(current_user.id),
        "mobile": current_user.mobile or "",
        "email": current_user.email or "",
        "name": current_user.full_name or ""
    }
    new_token = AuthService.create_access_token(token_payload)
    max_age_sec = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    response.set_cookie(
        key="khetsutra_token",
        value=new_token,
        httponly=True,
        max_age=max_age_sec,
        samesite="lax",
        secure=settings.ENVIRONMENT.lower() == "production"
    )
    csrf_token = secrets.token_urlsafe(32)
    response.set_cookie(
        key="kisanmitra_csrf",
        value=csrf_token,
        httponly=False,
        max_age=max_age_sec,
        samesite="lax",
        secure=settings.ENVIRONMENT.lower() == "production"
    )
    return TokenResponse(
        access_token=None,
        token_type="bearer",
        user_id=current_user.id,
        full_name=profile.full_name if profile else (current_user.full_name or "किसान मित्र"),
        mobile=current_user.mobile,
        email=current_user.email,
        language=profile.language if profile else "hi",
        is_onboarded=profile.is_onboarded if profile else True,
        message="Token refreshed successfully."
    )

# ----------------- 2. Farmer Profile Endpoints -----------------

@app.get("/api/profile/full", response_model=FarmerProfileResponse)
def get_full_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_active_profile(db, current_user)

@app.post("/api/profile/full", response_model=FarmerProfileResponse)
def save_full_profile(data: FarmerProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_active_profile(db, current_user)
    profile.full_name = data.full_name
    profile.mobile = data.mobile
    profile.language = data.language if data.language in ["hi", "en"] else "hi"
    profile.state = data.state
    profile.district = data.district
    profile.village = data.village
    profile.pincode = data.pincode
    profile.latitude = data.latitude
    profile.longitude = data.longitude
    profile.total_landholding = data.total_landholding
    profile.land_unit = data.land_unit
    profile.number_of_fields = data.number_of_fields
    profile.primary_soil_type = data.primary_soil_type
    profile.primary_irrigation_method = data.primary_irrigation_method
    profile.is_onboarded = True
    
    db.commit()
    db.refresh(profile)

    # Also keep legacy Farmer synchronized
    legacy_farmer = db.query(Farmer).first()
    if legacy_farmer:
        legacy_farmer.name = profile.full_name
        legacy_farmer.village_or_district = f"{profile.village}, {profile.district}"
        legacy_farmer.language = profile.language
        legacy_farmer.soil_type = profile.primary_soil_type
        legacy_farmer.irrigation_method = profile.primary_irrigation_method
        legacy_farmer.field_size = profile.total_landholding
        db.commit()

    return profile

# Legacy endpoints for backward compatibility
@app.get("/api/profile", response_model=FarmerResponse)
def get_profile(farmer_id: Optional[int] = None, db: Session = Depends(get_db)):
    p = get_active_profile(db)
    field = db.query(Field).filter(Field.farmer_id == p.id).first()
    return FarmerResponse(
        id=p.id,
        name=p.full_name,
        language=p.language,
        village_or_district=f"{p.village}, {p.district}",
        crop=field.crop_name if field else "wheat",
        sowing_date=field.sowing_date if field else (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"),
        field_size=p.total_landholding,
        soil_type=p.primary_soil_type,
        irrigation_method=p.primary_irrigation_method,
        created_at=p.created_at,
        updated_at=p.updated_at
    )

@app.post("/api/profile", response_model=FarmerResponse)
def save_profile(data: FarmerCreate, farmer_id: Optional[int] = None, db: Session = Depends(get_db)):
    p = get_active_profile(db)
    p.full_name = data.name
    p.language = data.language if data.language in ["hi", "en"] else "hi"
    parts = [x.strip() for x in data.village_or_district.split(",")]
    if len(parts) >= 2:
        p.village = parts[0]
        p.district = parts[1]
    else:
        p.district = data.village_or_district
    p.primary_soil_type = data.soil_type
    p.primary_irrigation_method = data.irrigation_method
    p.total_landholding = data.field_size
    db.commit()
    db.refresh(p)
    return get_profile(farmer_id, db)

# ----------------- 3. Fields Management Endpoints -----------------

@app.get("/api/fields", response_model=List[FieldResponse])
def get_fields(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_active_profile(db, current_user)
    fields = db.query(Field).filter(Field.farmer_id == profile.id).all()
    
    res = []
    for f in fields:
        stage_info = calculate_crop_stage(f.crop_name, f.sowing_date)
        res.append(FieldResponse(
            id=f.id,
            farmer_id=f.farmer_id,
            field_name=f.field_name,
            area=f.area,
            crop_name=f.crop_name,
            crop_variety=f.crop_variety,
            sowing_date=f.sowing_date,
            soil_type=f.soil_type,
            irrigation_method=f.irrigation_method,
            previous_crop=f.previous_crop,
            expected_harvest_date=f.expected_harvest_date,
            current_stage=stage_info.get("current_stage"),
            days_since_sowing=stage_info.get("days_since_sowing"),
            stage_hindi=stage_info.get("stage_hindi"),
            progress_percentage=stage_info.get("progress_percentage", 50),
            created_at=f.created_at,
            updated_at=f.updated_at
        ))
    return res

@app.post("/api/fields", response_model=FieldResponse)
def create_field(data: FieldCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_active_profile(db, current_user)
    stage_info = calculate_crop_stage(data.crop_name, data.sowing_date)
    
    # Calculate estimated harvest date if not provided
    duration = stage_info.get("total_duration_days", 130)
    try:
        s_date = datetime.strptime(data.sowing_date, "%Y-%m-%d")
        est_harvest = (s_date + timedelta(days=duration)).strftime("%Y-%m-%d")
    except Exception:
        est_harvest = None

    field = Field(
        farmer_id=profile.id,
        field_name=data.field_name,
        area=data.area,
        crop_name=data.crop_name.lower().strip(),
        crop_variety=data.crop_variety or "Standard Quality",
        sowing_date=data.sowing_date,
        soil_type=data.soil_type,
        irrigation_method=data.irrigation_method,
        previous_crop=data.previous_crop,
        expected_harvest_date=data.expected_harvest_date or est_harvest,
        current_stage=stage_info.get("current_stage")
    )
    db.add(field)
    db.commit()
    db.refresh(field)

    return FieldResponse(
        id=field.id,
        farmer_id=field.farmer_id,
        field_name=field.field_name,
        area=field.area,
        crop_name=field.crop_name,
        crop_variety=field.crop_variety,
        sowing_date=field.sowing_date,
        soil_type=field.soil_type,
        irrigation_method=field.irrigation_method,
        previous_crop=field.previous_crop,
        expected_harvest_date=field.expected_harvest_date,
        current_stage=stage_info.get("current_stage"),
        days_since_sowing=stage_info.get("days_since_sowing"),
        stage_hindi=stage_info.get("stage_hindi"),
        progress_percentage=stage_info.get("progress_percentage", 0),
        created_at=field.created_at,
        updated_at=field.updated_at
    )

@app.delete("/api/fields/{field_id}")
def delete_field(field_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_active_profile(db, current_user)
    field = db.query(Field).filter(Field.id == field_id, Field.farmer_id == profile.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    db.delete(field)
    db.commit()
    return {"status": "success", "message": "Field deleted successfully"}

# ----------------- 4. Weather & Risk Endpoints -----------------

@app.get("/api/weather/current")
async def get_current_weather(location: Optional[str] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not location:
        p = get_active_profile(db, current_user)
        location = f"{p.village}, {p.district}"
    forecast = await WeatherService.get_forecast(location, days=1)
    return {
        "location": forecast.get("location"),
        "current": forecast.get("current"),
        "is_demo": forecast.get("is_demo", False)
    }

@app.get("/api/weather/forecast", response_model=WeatherForecastResponse)
async def get_weather_forecast(location: Optional[str] = None, days: int = Query(7, ge=1, le=14), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not location:
        p = get_active_profile(db, current_user)
        location = f"{p.village}, {p.district}"
    return await WeatherService.get_forecast(location, days=days)

@app.get("/api/dashboard/briefing", response_model=DailyBriefingResponse)
async def get_daily_briefing(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_active_profile(db, current_user)
    fields = db.query(Field).filter(Field.farmer_id == profile.id).all()
    primary_field = fields[0] if fields else None
    
    crop_name = primary_field.crop_name if primary_field else "wheat"
    sowing_date = primary_field.sowing_date if primary_field else (datetime.now() - timedelta(days=32)).strftime("%Y-%m-%d")
    
    loc = f"{profile.village}, {profile.district}"
    weather_data = await WeatherService.get_forecast(loc, days=7)
    crop_stage = calculate_crop_stage(crop_name, sowing_date)
    
    farm_dict = {
        "name": profile.full_name,
        "village_or_district": loc,
        "crop": crop_name,
        "soil_type": primary_field.soil_type if primary_field else profile.primary_soil_type,
        "irrigation_method": primary_field.irrigation_method if primary_field else profile.primary_irrigation_method
    }
    
    briefing = AgronomyRulesEngine.generate_daily_briefing(farm_dict, weather_data, crop_stage)
    briefing["farmer_name"] = profile.full_name
    return briefing

@app.get("/api/risk-score", response_model=RiskScoreResponse)
async def get_risk_score(field_id: Optional[int] = None, db: Session = Depends(get_db)):
    profile = get_active_profile(db)
    if field_id:
        f = db.query(Field).filter(Field.id == field_id).first()
    else:
        f = db.query(Field).filter(Field.farmer_id == profile.id).first()

    crop = f.crop_name if f else "wheat"
    sowing = f.sowing_date if f else (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    field_name = f.field_name if f else "मुख्य खेत (Main Field)"

    loc = f"{profile.village}, {profile.district}"
    weather = await WeatherService.get_forecast(loc, days=3)
    curr = weather.get("current", {})
    daily = weather.get("daily", [])

    temp = curr.get("temperature", 24.0)
    rain_prob = curr.get("rain_probability", 0)
    wind = curr.get("wind_speed", 12.0)
    humidity = curr.get("humidity", 65)

    # Compute risk factors
    f1_score = min(90, int(rain_prob * 0.8))
    f2_score = 30 if temp < 32 else (65 if temp < 38 else 85)
    f3_score = 25 if wind < 20 else (60 if wind < 30 else 80)
    f4_score = 75 if humidity > 75 and 15 <= temp <= 25 else 30 # fungal risk condition

    overall = int((f1_score * 0.3) + (f2_score * 0.25) + (f3_score * 0.2) + (f4_score * 0.25))
    
    if overall < 35:
        level = "Low"
        color = "text-emerald-700 bg-emerald-50 border-emerald-200"
    elif overall < 65:
        level = "Moderate"
        color = "text-amber-700 bg-amber-50 border-amber-200"
    else:
        level = "High"
        color = "text-red-700 bg-red-50 border-red-200"

    factors = [
        RiskFactorItem(
            factor_name_en="Precipitation & Waterlogging Risk",
            factor_name_hi="वर्षा एवं जलभराव जोखिम",
            score=f1_score,
            level="Low" if f1_score < 40 else "High",
            description_en=f"Rain probability is {rain_prob}%. No severe drainage stress currently.",
            description_hi=f"बारिश की संभावना {rain_prob}% है। खेत में जलभराव का खतरा सामान्य है।"
        ),
        RiskFactorItem(
            factor_name_en="Thermal Stress (Heat / Cold)",
            factor_name_hi="तापमान तनाव (गर्मी / पाला)",
            score=f2_score,
            level="Low" if f2_score < 40 else "Medium",
            description_en=f"Current temperature is {temp}°C, favorable for {crop.capitalize()} vegetative development.",
            description_hi=f"वर्तमान तापमान {temp}°C फसल वृद्धि के लिए अनुकूल है।"
        ),
        RiskFactorItem(
            factor_name_en="Wind Lodging & Spray Risk",
            factor_name_hi="हवा की गति एवं छिड़काव जोखिम",
            score=f3_score,
            level="Low" if f3_score < 40 else "High",
            description_en=f"Wind speed is {wind} km/h. Suitable for spray only in calm morning hours.",
            description_hi=f"हवा की रफ्तार {wind} किमी/घंटा है। केवल शांत सुबह के समय ही स्प्रे करें।"
        ),
        RiskFactorItem(
            factor_name_en="Microclimate Disease & Pest Pressure",
            factor_name_hi="मौसम आधारित कीट एवं रोग अनुकूलता",
            score=f4_score,
            level="Low" if f4_score < 45 else "Moderate",
            description_en=f"Relative humidity is {humidity}%. Mild susceptibility for foliar fungal rust/blight.",
            description_hi=f"नमी {humidity}% है। पत्तियों पर फफूंद रोग की नियमित निगरानी रखें।"
        )
    ]

    return RiskScoreResponse(
        overall_score=overall,
        risk_level=level,
        level_color=color,
        field_name=field_name,
        crop_name=crop.capitalize(),
        factors=factors,
        recommendations_en=[
            f"Field conditions are currently {level.lower()} risk. Maintain regular scouting.",
            "Irrigate according to moisture status; do not over-flood loamy soils.",
            "Avoid pesticide application during peak windy afternoon hours."
        ],
        recommendations_hi=[
            f"खेत में कुल जोखिम स्तर '{level}' है। सप्ताह में दो बार फसल का मुआयना करें।",
            "मिट्टी की नमी देखकर ही पानी लगाएं; खेत में पानी रुकने न दें।",
            "दोपहर में तेज धूप व हवा के समय किसी भी कीटनाशक का छिड़काव न करें।"
        ],
        disclaimer_en="Indicative agro-meteorological assessment. Not a substitute for on-ground agricultural inspection.",
        disclaimer_hi="यह एक सांकेतिक मौसम-कृषि जोखिम स्कोर है। खेत में व्यक्तिगत निरीक्षण अवश्य करें।"
    )

# ----------------- 5. AI Crop Doctor Endpoints -----------------

@app.post("/api/crop-doctor/diagnose", response_model=CropDoctorResponse)
def diagnose_crop_issue(req: CropDoctorRequest):
    res = CropDoctorService.diagnose_image(crop_name=req.crop_name, symptom_hint=req.symptom_hint)
    return CropDoctorResponse(**res)

@app.get("/api/crop-doctor/diseases")
def list_known_diseases():
    return DISEASE_KNOWLEDGE_BASE

# ----------------- 6. Smart Irrigation Planner -----------------

@app.get("/api/irrigation/planner")
async def get_irrigation_plan(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    profile = get_active_profile(db, user_id)
    fields = db.query(Field).filter(Field.farmer_id == profile.id).all()
    loc = f"{profile.village}, {profile.district}"
    weather = await WeatherService.get_forecast(loc, days=7)
    
    plans = []
    for f in fields:
        stage = calculate_crop_stage(f.crop_name, f.sowing_date)
        eval_res = AgronomyRulesEngine.evaluate_irrigation(
            weather_data=weather,
            crop_stage=stage,
            soil_type=f.soil_type,
            irrigation_method=f.irrigation_method
        )
        plans.append({
            "field_id": f.id,
            "field_name": f.field_name,
            "crop_name": f.crop_name.capitalize(),
            "area": f.area,
            "current_stage": stage.get("current_stage"),
            "stage_hindi": stage.get("stage_hindi"),
            "water_need": stage.get("stage_water_need"),
            "water_need_hi": stage.get("stage_water_need_hi"),
            "irrigation_action": eval_res.get("status"),
            "irrigation_action_hi": eval_res.get("status_hi"),
            "urgency": eval_res.get("urgency"),
            "reason": eval_res.get("reason"),
            "recommendation": eval_res.get("recommendation"),
            "soil_type": f.soil_type,
            "method": f.irrigation_method
        })
    return {
        "location": loc,
        "plans": plans,
        "general_tip_en": "Irrigate during evening hours to minimize evaporation losses by up to 35%.",
        "general_tip_hi": "शाम के समय सिंचाई करने से वाष्पीकरण द्वारा होने वाला पानी का नुकसान 35% तक कम होता है।"
    }

# ----------------- 7. Harvest Planning Assistant -----------------

@app.get("/api/harvest/planner", response_model=List[HarvestPlannerResponse])
async def get_harvest_planner(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_active_profile(db, current_user)
    fields = db.query(Field).filter(Field.farmer_id == profile.id).all()
    loc = f"{profile.village}, {profile.district}"
    weather = await WeatherService.get_forecast(loc, days=7)
    
    daily = weather.get("daily", [])
    max_rain_7d = max([d.get("rain_probability", 0) for d in daily]) if daily else 10
    
    plans = []
    for f in fields:
        stage = calculate_crop_stage(f.crop_name, f.sowing_date)
        duration = stage.get("total_duration_days", 130)
        days_done = stage.get("days_since_sowing", 30)
        maturity = min(100, int((days_done / duration) * 100))
        
        try:
            s_date = datetime.strptime(f.sowing_date, "%Y-%m-%d")
            est_start = (s_date + timedelta(days=duration - 7)).strftime("%Y-%m-%d")
            est_end = (s_date + timedelta(days=duration + 7)).strftime("%Y-%m-%d")
        except Exception:
            est_start = (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d")
            est_end = (datetime.now() + timedelta(days=75)).strftime("%Y-%m-%d")

        if maturity >= 90:
            status_win = "Optimal" if max_rain_7d < 30 else "Caution"
        elif maturity >= 75:
            status_win = "Approaching"
        else:
            status_win = "Growing Stage"

        plans.append(HarvestPlannerResponse(
            field_id=f.id,
            field_name=f.field_name,
            crop_name=f.crop_name.capitalize(),
            sowing_date=f.sowing_date,
            days_since_sowing=days_done,
            total_duration_days=duration,
            maturity_percentage=maturity,
            estimated_harvest_start=est_start,
            estimated_harvest_end=est_end,
            weather_window_status=status_win,
            rain_probability_next_7_days=max_rain_7d,
            recommendations_en=[
                f"Crop maturity is at {maturity}%. Expected harvest starts around {est_start}.",
                "Cease irrigation 10-12 days before the targeted harvest date to allow uniform drying.",
                "Ensure threshing machinery and clean grain storage bags are booked in advance."
            ],
            recommendations_hi=[
                f"फसल की परिपक्वता {maturity}% है। कटाई लगभग {est_start} से शुरू होने की संभावना है।",
                "कटाई से 10-12 दिन पहले सिंचाई पूरी तरह बंद करें ताकि दाना कड़ा हो सके।",
                "थ्रेशर मशीन व भंडारण के लिए बोरियों की व्यवस्था पहले से करके रखें।"
            ]
        ))
    return plans

# ----------------- 8. Farm Finance Endpoints -----------------

@app.get("/api/finance/summary", response_model=FinanceSummaryResponse)
def get_finance_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_active_profile(db, current_user)
    expenses = db.query(Expense).filter(Expense.farmer_id == profile.id).all()
    fields = db.query(Field).filter(Field.farmer_id == profile.id).all()
    
    total_acres = sum([f.area for f in fields]) or profile.total_landholding or 5.0
    total_spent = sum([e.amount for e in expenses])
    
    cat_breakdown = {
        "seeds": 0.0, "fertilizers": 0.0, "pesticides": 0.0,
        "labour": 0.0, "machinery": 0.0, "irrigation": 0.0, "transport": 0.0, "other": 0.0
    }
    for e in expenses:
        cat = e.category.lower() if e.category else "other"
        if cat in cat_breakdown:
            cat_breakdown[cat] += e.amount
        else:
            cat_breakdown["other"] += e.amount

    cost_per_acre = round(total_spent / total_acres, 1) if total_acres > 0 else 0.0
    
    # Benchmarking estimate: ~₹28,000 per acre revenue for wheat/mustard combo in North India
    est_rev_per_acre = 32000.0
    est_total_revenue = round(est_rev_per_acre * total_acres, 1)
    projected_additional_cost = 4500.0 * total_acres # anticipated harvesting + threshing
    total_projected_cost = total_spent + projected_additional_cost
    est_profit = round(est_total_revenue - total_projected_cost, 1)
    margin = round((est_profit / est_total_revenue) * 100, 1) if est_total_revenue > 0 else 0.0

    recent_objs = [
        ExpenseResponse(
            id=e.id,
            farmer_id=e.farmer_id,
            field_id=e.field_id,
            category=e.category,
            amount=e.amount,
            description=e.description,
            date=e.date,
            is_projected=e.is_projected,
            created_at=e.created_at,
            field_name=e.field.field_name if e.field else "General Farm"
        )
        for e in sorted(expenses, key=lambda x: x.date, reverse=True)[:10]
    ]

    return FinanceSummaryResponse(
        total_investment=round(total_spent, 1),
        cost_per_acre=cost_per_acre,
        total_acres=total_acres,
        actual_expenses=round(total_spent, 1),
        projected_expenses=round(projected_additional_cost, 1),
        estimated_revenue=est_total_revenue,
        estimated_profit=est_profit,
        profit_margin_percent=margin,
        expenses_by_category=cat_breakdown,
        recent_transactions=recent_objs
    )

@app.get("/api/finance/expenses", response_model=List[ExpenseResponse])
def get_expenses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_active_profile(db, current_user)
    expenses = db.query(Expense).filter(Expense.farmer_id == profile.id).order_by(Expense.date.desc()).all()
    return [
        ExpenseResponse(
            id=e.id,
            farmer_id=e.farmer_id,
            field_id=e.field_id,
            category=e.category,
            amount=e.amount,
            description=e.description,
            date=e.date,
            is_projected=e.is_projected,
            created_at=e.created_at,
            field_name=e.field.field_name if e.field else "सामान्य व्यय (General)"
        )
        for e in expenses
    ]

@app.post("/api/finance/expenses", response_model=ExpenseResponse)
def add_expense(data: ExpenseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_active_profile(db, current_user)
    exp = Expense(
        farmer_id=profile.id,
        field_id=data.field_id,
        category=data.category,
        amount=data.amount,
        description=data.description,
        date=data.date,
        is_projected=data.is_projected
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)

    # Also record in farm activity diary automatically
    act = FarmActivity(
        farmer_id=profile.id,
        field_id=data.field_id,
        activity_type=data.category,
        title=f"खर्च दर्ज: {data.category.capitalize()} - ₹{data.amount}",
        notes=data.description,
        date=data.date,
        cost=data.amount
    )
    db.add(act)
    db.commit()

    return ExpenseResponse(
        id=exp.id,
        farmer_id=exp.farmer_id,
        field_id=exp.field_id,
        category=exp.category,
        amount=exp.amount,
        description=exp.description,
        date=exp.date,
        is_projected=exp.is_projected,
        created_at=exp.created_at,
        field_name=exp.field.field_name if exp.field else "सामान्य व्यय (General)"
    )

@app.delete("/api/finance/expenses/{expense_id}")
def delete_expense(expense_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_active_profile(db, current_user)
    exp = db.query(Expense).filter(Expense.id == expense_id, Expense.farmer_id == profile.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(exp)
    db.commit()
    return {"status": "success", "message": "Expense deleted successfully"}

# ----------------- 9. Mandi Price Intelligence -----------------

@app.get("/api/mandi-prices", response_model=MandiPriceResponse)
async def get_mandi_prices(
    crop: str = Query("wheat", pattern="^(wheat|mustard|rice|cotton|potato|tomato|onion|chickpea)$"),
    quantity: float = Query(50.0, gt=0, le=5000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_active_profile(db, current_user)
    if not profile.state or not profile.district:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Add your state and district in profile settings to find nearby market prices."
        )
    try:
        data = await MandiService.get_prices(
            crop_name=crop,
            quantity_quintals=quantity,
            state=profile.state,
            district=profile.district,
            api_key=settings.DATA_GOV_IN_API_KEY or ""
        )
    except MandiDataUnavailable as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc)
        ) from None
    return MandiPriceResponse(**data)

# ----------------- 10. Farm Digital Diary Endpoints -----------------

@app.get("/api/diary/activities", response_model=List[FarmActivityResponse])
def get_activities(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_active_profile(db, current_user)
    activities = db.query(FarmActivity).filter(FarmActivity.farmer_id == profile.id).order_by(FarmActivity.date.desc()).all()
    return [
        FarmActivityResponse(
            id=a.id,
            farmer_id=a.farmer_id,
            field_id=a.field_id,
            activity_type=a.activity_type,
            title=a.title,
            notes=a.notes,
            date=a.date,
            cost=a.cost,
            created_at=a.created_at,
            field_name=a.field.field_name if a.field else "All Fields"
        )
        for a in activities
    ]

@app.post("/api/diary/activities", response_model=FarmActivityResponse)
def log_activity(data: FarmActivityCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_active_profile(db, current_user)
    act = FarmActivity(
        farmer_id=profile.id,
        field_id=data.field_id,
        activity_type=data.activity_type,
        title=data.title,
        notes=data.notes,
        date=data.date,
        cost=data.cost
    )
    db.add(act)
    db.commit()
    db.refresh(act)

    return FarmActivityResponse(
        id=act.id,
        farmer_id=act.farmer_id,
        field_id=act.field_id,
        activity_type=act.activity_type,
        title=act.title,
        notes=act.notes,
        date=act.date,
        cost=act.cost,
        created_at=act.created_at,
        field_name=act.field.field_name if act.field else "All Fields"
    )

@app.delete("/api/diary/activities/{activity_id}")
def delete_activity(activity_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_active_profile(db, current_user)
    act = db.query(FarmActivity).filter(FarmActivity.id == activity_id, FarmActivity.farmer_id == profile.id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity record not found")
    db.delete(act)
    db.commit()
    return {"status": "success", "message": "Activity record removed"}

# ----------------- 11. Government Schemes -----------------

@app.get("/api/schemes", response_model=List[GovernmentSchemeResponse])
def get_schemes(db: Session = Depends(get_db)):
    schemes = db.query(GovernmentScheme).all()
    return [
        GovernmentSchemeResponse(
            id=s.id,
            scheme_code=s.scheme_code,
            name_en=s.name_en,
            name_hi=s.name_hi,
            ministry=s.ministry,
            benefit_amount=s.benefit_amount,
            description_en=s.description_en,
            description_hi=s.description_hi,
            eligibility_en=s.eligibility_en,
            eligibility_hi=s.eligibility_hi,
            documents_en=s.documents_en,
            documents_hi=s.documents_hi,
            official_url=s.official_url,
            last_verified=s.last_verified
        )
        for s in schemes
    ]

# ----------------- 12. Seasonal Farming Intelligence -----------------

@app.get("/api/seasonal/planner", response_model=SeasonalPlannerResponse)
def get_seasonal_planner(crop: str = "wheat", season: Optional[str] = None):
    crop_clean = crop.lower().strip()
    crop_info = CROPS_DATABASE.get(crop_clean, CROPS_DATABASE["wheat"])
    detected_s = season or crop_info.get("season", "Rabi")
    s_intel = SEASONAL_INTELLIGENCE.get(detected_s, SEASONAL_INTELLIGENCE["Rabi"])
    
    today_str = (datetime.now() - timedelta(days=35)).strftime("%Y-%m-%d")
    stage_calc = calculate_crop_stage(crop_clean, today_str)

    return SeasonalPlannerResponse(
        crop=crop_clean.capitalize(),
        crop_hi=crop_info.get("name_hi", "गेहूँ"),
        season=detected_s,
        season_hi=crop_info.get("season_hi", "रबी"),
        total_duration_days=crop_info.get("total_duration_days", 135),
        current_stage=stage_calc.get("current_stage"),
        current_stage_hi=stage_calc.get("stage_hindi"),
        current_day=stage_calc.get("days_since_sowing", 35),
        progress_percentage=stage_calc.get("progress_percentage", 25),
        stages=crop_info.get("stages", []),
        seasonal_intelligence=s_intel
    )

# ----------------- 13. AI Copilot Chat Endpoints -----------------

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_active_profile(db, current_user)
    fields = db.query(Field).filter(Field.farmer_id == profile.id).all()
    primary_field = fields[0] if fields else None

    profile_dict = {
        "name": profile.full_name,
        "full_name": profile.full_name,
        "village": profile.village,
        "district": profile.district,
        "village_or_district": f"{profile.village}, {profile.district}",
        "crop": primary_field.crop_name if primary_field else "wheat",
        "sowing_date": primary_field.sowing_date if primary_field else (datetime.now() - timedelta(days=32)).strftime("%Y-%m-%d"),
        "soil_type": primary_field.soil_type if primary_field else profile.primary_soil_type,
        "irrigation_method": primary_field.irrigation_method if primary_field else profile.primary_irrigation_method,
        "language": profile.language
    }

    result = await agent.run(
        user_message=req.message,
        farmer_profile=profile_dict,
        language_hint=req.language_hint or profile.language
    )

    chat_record = ChatMessage(
        farmer_id=profile.id,
        user_message=req.message,
        assistant_message=result["answer"],
        language=result["language"],
        tools_used=str(result["tools_used"]),
        confidence=result["confidence"],
        why_reason=result["why_this_advice"]
    )
    db.add(chat_record)
    db.commit()

    return result

@app.get("/api/chat/history")
def get_chat_history(limit: int = 15, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_active_profile(db, current_user)
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.farmer_id == profile.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": m.id,
            "user_message": m.user_message,
            "assistant_message": m.assistant_message,
            "confidence": m.confidence,
            "why_reason": m.why_reason,
            "created_at": m.created_at
        }
        for m in reversed(messages)
    ]

# ----------------- 14. System Health -----------------

@app.get("/api/health")
def health_check():
    has_gemini = bool(settings.GEMINI_API_KEY)
    has_openai = bool(settings.OPENAI_API_KEY)
    return {
        "status": "healthy",
        "platform": "KhetSutra (खेतसूत्र)",
        "tagline": "Smart Farming. Smarter Decisions.",
        "version": settings.VERSION,
        "weather_provider": settings.WEATHER_PROVIDER,
        "llm_configured": has_gemini or has_openai,
        "active_llm": "Gemini 1.5 Flash" if has_gemini else ("OpenAI GPT-4o-mini" if has_openai else "Deterministic Agronomy Rules (Rule-based Engine)")
    }

if __name__ == "__main__":
    import uvicorn
    print(f"Starting {settings.APP_NAME} on http://127.0.0.1:8000 ...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
