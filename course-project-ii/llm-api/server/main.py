from fastapi import Request, FastAPI
from .models import generator

app = FastAPI()

@app.get("/")
async def main():
    return "POST a message with a JSON document that has a 'question' key."

@app.post("/")
async def ask_question(request: Request):
    data = await request.json()
    return generator(data["question"])