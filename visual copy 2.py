from groq import Groq
import base64
import os
import json

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_image(image_path):
    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')
    
    try:
        response = client.chat.completions.create(
            model="llama-3.2-90b-vision-preview",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            "text": "Detect and list all objects in the image drawn with bounded boxes only.. Provide a JSON array with  object having name, color, and confidence percentage. Use a strict JSON format with lowercase keys."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        # Parse the response
        result = response.choices[0].message.content
        return json.loads(result)
    
    except Exception as e:
        return {"error": str(e)}

# Usage example
image_path = "process/bound1.jpg" 
result = analyze_image(image_path)
print(json.dumps(result, indent=2))
