from enum import Enum
from pydantic import BaseModel


class JobStatus(str, Enum):
    queued = "queued"
    processing = "processing"
    done = "done"
    failed = "failed"


class TimestampResult(BaseModel):
    seconds: float
