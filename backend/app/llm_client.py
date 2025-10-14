from google import genai
import re

# Model configurations
MODEL_NAME = "gemini-2.5-flash"
MODEL_OPTIONS = genai.types.GenerateContentConfig(**{
    "seed": 42,
    "temperature": 0,
    "thinking_config": genai.types.ThinkingConfig(thinking_budget=0, includeThoughts=False)
})

class LLMClient:
    @staticmethod
    async def ask(prompt: str) -> str:
        client = genai.Client()
        # Prepare the payload for the request
        payload = {
            "model": MODEL_NAME,
            "contents": prompt,
            "config": MODEL_OPTIONS,
        }
        # Send the request to the Gemini API
        response = client.models.generate_content(**payload)
        # Parse the response and extract the text
        return response.text
    

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
    def clean_markdown_json(response: str) -> str:
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


