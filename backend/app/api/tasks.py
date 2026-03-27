from app.core.celery_app import celery_app
from openai import OpenAI
from app.core.config import settings

client = OpenAI(
    base_url=settings.OPENROUTER_BASE_URL,
    api_key=settings.OPENROUTER_API_KEY,
)

@celery_app.task
def generate_content_task(system_prompt, user_message):
    response = client.chat.completions.create(
        model=settings.MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
    )
    return response.choices[0].message.content

@celery_app.task
def generate_json_content_task(system_prompt, user_message):
    response = client.chat.completions.create(
        model=settings.MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        response_format={"type": "json_object"},
    )
    return response.choices[0].message.content
