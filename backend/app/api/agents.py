from fastapi import APIRouter, Depends, HTTPException
from app.api.tasks import generate_content_task, generate_json_content_task
from celery.result import AsyncResult
from app.schemas.generation import GenerationCreate, Generation
from app.db.models import User
from app.api.auth import get_db
from sqlalchemy.orm import Session
from app.core.security import create_access_token
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/writing-assistant")
async def writing_assistant(request: dict, current_user: User = Depends(get_current_user)):
    system_prompt = "You are an expert content writer for college clubs and organizations. Your task is to generate high-quality, engaging content based on the user's request. Adapt your writing style to the specified content type and tone."
    user_message = f"Content Type: {request['content_type']}\nTopic: {request['topic']}\nTone: {request['tone']}\nAdditional Context: {request['additional_context']}"
    task = generate_content_task.delay(system_prompt, user_message)
    return {"task_id": task.id}

@router.post("/meeting-summarizer")
async def meeting_summarizer(request: dict, current_user: User = Depends(get_current_user)):
    system_prompt = "You are an expert meeting analyst. Your task is to summarize a meeting transcript, extracting key points, decisions, and action items. Present the output in a structured JSON format with the keys: 'summary', 'key_points', 'decisions', and 'action_items'."
    user_message = f"Please summarize the following transcript:\n\n{request['transcript']}"
    task = generate_json_content_task.delay(system_prompt, user_message)
    return {"task_id": task.id}

@router.post("/report-generator")
async def report_generator(request: dict, current_user: User = Depends(get_current_user)):
    system_prompt = "You are a professional report writer. Your task is to create a structured and clear report based on the provided data and specifications. The report should be well-formatted and easy to understand."
    user_message = f"Report Type: {request['report_type']}\nTime Period: {request['time_period']}\nData/Notes:\n{request['data']}"
    task = generate_content_task.delay(system_prompt, user_message)
    return {"task_id": task.id}

@router.post("/task-manager")
async def task_manager(request: dict, current_user: User = Depends(get_current_user)):
    system_prompt = "You are an expert project manager. Your task is to prioritize a list of tasks based on urgency and impact, given the context of the project or team. Provide the prioritized list and any relevant suggestions in a structured JSON format with keys: 'prioritized_tasks' and 'suggestions'."
    tasks_str = "\n".join([f"- {task['name']}" for task in request['tasks']])
    user_message = f"Project Context: {request['context']}\n\nTasks to prioritize:\n{tasks_str}"
    task = generate_json_content_task.delay(system_prompt, user_message)
    return {"task_id": task.id}

@router.get("/tasks/{task_id}")
def get_task_status(task_id: str):
    task_result = AsyncResult(task_id)
    if task_result.ready():
        if task_result.successful():
            return {"status": "SUCCESS", "result": task_result.get()}
        else:
            return {"status": "FAILURE", "result": str(task_result.info)}
    else:
        return {"status": "PENDING"}
