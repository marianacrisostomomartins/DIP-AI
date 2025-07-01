import ollama
import re

# Model configurations
MODEL_NAME = "deepseek-r1:14b" # "gemma3:12b" "deepseek-r1:14b"
MODEL_OPTIONS = {
    "seed": 42,
    "temperature": 0,
    "num_ctx": 4096,
    "timeout": 300,
}

class LLMClient:
    @staticmethod
    async def ask(prompt: str) -> str:
        client = ollama.AsyncClient()
        # Prepare the payload for the request
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "options": MODEL_OPTIONS,
        }
        # Send the request to the Ollama API
        response = await client.generate(**payload)
        # Parse the response and extract the text
        return response.response
    

    @staticmethod
    def clean_reasoning_response(response: str) -> str:
        """Remove any thinking/reasoning text from the model's response.
        Args:
            response (str): The raw response from the model
            
        Returns:
            str: The cleaned response with thinking/reasoning sections removed
        """
        
        # Remove content between <think> tags
        cleaned = re.sub(r'<think>.*?</think>', '', response, flags=re.DOTALL)
        
        # Try to extract JSON if it exists in the response
        json_match = re.search(r'(\{.*\})', cleaned, re.DOTALL)
        if json_match:
            return json_match.group(1).strip()
        
        # Remove extra whitespace and normalize newlines
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
        cleaned = cleaned.strip()
        
        return cleaned
    

    @staticmethod
    def clean_makdown_json(response: str) -> str:
        """Remove markdown formatting and extract JSON from the response.
        
        Args:
            response (str): The raw response from the model
            
        Returns:
            str: The cleaned response with markdown formatting removed
        """
        # Remove markdown code blocks
        cleaned = re.sub(r'```json\n(.*?)\n```', r'\1', response, flags=re.DOTALL)
        
        # Try to extract JSON if it exists in the response
        json_match = re.search(r'(\{.*\})', cleaned, re.DOTALL)
        if json_match:
            return json_match.group(1).strip()
        
        return cleaned.strip()


