from pydantic import BaseModel, ConfigDict
from datetime import datetime


class GenerationBase(BaseModel):
    agent_type: str
    input_data: str


class GenerationCreate(GenerationBase):
    pass


class Generation(GenerationBase):
    id: int
    owner_id: int
    output_data: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
