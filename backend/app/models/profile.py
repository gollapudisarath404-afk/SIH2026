from typing import Union

from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    age: int = Field(..., ge=0, le=120)
    gender: str
    state: str
    occupation: str
    annualIncome: Union[int, float]
    category: str
    disability: bool = False
