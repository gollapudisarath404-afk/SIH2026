from typing import Any, List, Optional, Union

from pydantic import BaseModel, Field

from app.models.profile import UserProfile


class FAQModel(BaseModel):
    question: str
    answer: str


class BenefitModel(BaseModel):
    type: str
    amount: Optional[Union[int, float, str]] = None
    currency: Optional[str] = None
    frequency: str
    installments: Optional[Union[int, str]] = None
    description: str


class EligibilityModel(BaseModel):
    general: List[str] = Field(default_factory=list)
    incomeLimit: Optional[Union[int, str]] = None
    age: Optional[Union[int, str]] = None
    gender: str = "Any"
    occupation: str = "Any"
    state: str = "All"
    otherConditions: List[str] = Field(default_factory=list)


class ApplicationWindowModel(BaseModel):
    type: str
    details: Optional[str] = None


class ProcessingTimeModel(BaseModel):
    estimated: Optional[str] = None
    dependsOn: List[str] = Field(default_factory=list)


class OfficialLinksModel(BaseModel):
    schemePortal: Optional[str] = None
    myScheme: Optional[str] = None
    ministry: Optional[str] = None


class EligibilityCheckItem(BaseModel):
    key: str
    type: str = "boolean"
    required: bool
    question: str


class SchemeResponse(BaseModel):
    id: int
    name: str
    shortName: Optional[str] = None
    category: str
    subCategory: str
    beneficiaries: List[str]
    schemeType: str
    description: str
    benefit: BenefitModel
    eligibility: EligibilityModel
    eligibilityChecks: List[EligibilityCheckItem] = Field(default_factory=list)
    requiredDocuments: List[str]
    applicationProcess: List[str]
    applicationWindow: ApplicationWindowModel
    processingTime: ProcessingTimeModel
    verification: List[str]
    officialLinks: OfficialLinksModel
    modeOfApplication: List[str]
    ministry: str
    governmentLevel: str
    availableStates: List[str]
    status: str
    tags: List[str]
    searchKeywords: List[str]
    relatedSchemes: List[int] = Field(default_factory=list)
    aiContext: Optional[str] = None
    faqs: List[FAQModel] = Field(default_factory=list)
    lastUpdated: Optional[str] = None
    lastVerified: Optional[str] = None


class EligibilityQuestion(BaseModel):
    field: str
    question: str
    type: str
    options: Optional[List[str]] = None


class EligibilityRequest(BaseModel):
    userProfile: UserProfile
    schemeAnswers: dict = Field(default_factory=dict)


class EligibilityCheckResponse(BaseModel):
    eligible: bool
    status: str = "Eligible"
    overallScore: int
    matchedConditions: List[str]
    failedConditions: List[str]
    notEvaluatedConditions: List[str]
    recommendation: str



class DocumentItem(BaseModel):
    id: str
    name: str
    required: bool = True


class DocumentChecklistResponse(BaseModel):
    schemeId: int
    schemeName: str
    requiredDocuments: List[DocumentItem]


class SubmittedDocument(BaseModel):
    id: str
    available: bool


class DocumentVerificationRequest(BaseModel):
    documents: List[SubmittedDocument]


class DocumentVerificationResponse(BaseModel):
    readyToApply: bool
    availableDocuments: List[str] = Field(default_factory=list)
    missingDocuments: List[str] = Field(default_factory=list)
    completionPercentage: Optional[int] = None
    totalRequired: Optional[int] = None
    totalAvailable: Optional[int] = None
    nextStep: Optional[str] = None
    message: Optional[str] = None
    showNearbyCentres: bool = False


class RecommendedScheme(BaseModel):
    schemeId: int
    schemeName: str
    department: str
    score: int
    reason: str


class OtherRelevantScheme(BaseModel):
    schemeId: int
    schemeName: str
    department: str
    score: int


class PersonalizedRecommendationResponse(BaseModel):
    recommendedDepartment: str
    recommendedSchemes: List[RecommendedScheme]
    otherRelevantSchemes: List[OtherRelevantScheme]


class SchemeComparisonRequest(BaseModel):
    schemeId1: int
    schemeId2: int


class CompareSchemeInfo(BaseModel):
    id: int
    name: str


class CompareField(BaseModel):
    scheme1: Any
    scheme2: Any


class ComparisonDetails(BaseModel):
    beneficiaries: CompareField
    benefits: CompareField
    eligibility: CompareField
    requiredDocuments: CompareField
    applicationProcess: CompareField
    processingTime: CompareField
    governmentLevel: CompareField
    ministry: CompareField
    modeOfApplication: CompareField
    availableStates: CompareField


class ComparisonSummary(BaseModel):
    similarities: List[str]
    differences: List[str]
    bestForScheme1: str
    bestForScheme2: str


class SchemeComparisonResponse(BaseModel):
    scheme1: CompareSchemeInfo
    scheme2: CompareSchemeInfo
    comparison: ComparisonDetails
    summary: ComparisonSummary
