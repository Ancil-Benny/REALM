from groq import Groq
import base64
import os
import json

# Initialize Groq client using the API key from the environment variables
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_json(content):
    """
    Extracts JSON enclosed within triple backticks (with an optional "json" tag)
    from the provided content string.
    """
    json_output = None

    # Attempt to extract JSON enclosed in triple backticks with "json"
    start_index = content.find("```json")
    if start_index != -1:
        start_index += len("```json")
        end_index = content.find("```", start_index)
        if end_index != -1:
            json_string = content[start_index:end_index].strip()
            try:
                json_output = json.loads(json_string)
            except json.JSONDecodeError:
                json_output = None

    # Fallback: try to extract JSON from the first occurrence of triple backticks
    if json_output is None:
        triple_start = content.find("```")
        triple_end = content.rfind("```")
        if triple_start != -1 and triple_end != -1 and triple_start != triple_end:
            potential_json = content[triple_start+3:triple_end].strip()
            try:
                json_output = json.loads(potential_json)
            except json.JSONDecodeError:
                json_output = None

    return json_output

def analyze_image(image_path):
    """
    Analyzes an image to identify objects and associate them with detected persons if it belong to that person.
    The output strictly follows the JSON format:
    
    [
      {
        "person": "name (label over person in image) or unknown",
        "objects": [
          {
            "name": "object name",
            "properties": {
              "color": "color of object",
              "category": "electronics, footwear, clothing, books, sports, accessories etc",
              "brand": "if applicable",
              "extra": "labels, markings, shape, size, material , additional information about item (if applicable and should be accurate)"
            }
          }
        ]
      }
    ]
    """
    def encode_image(path):
        with open(path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    base64_image = encode_image(image_path)

    # Construct a detailed prompt to enforce structured JSON output.
    prompt = """
Your output must consist solely of valid and strictly parseable JSON enclosed in triple backticks with the "json" tag.
Do not include any additional text, commentary, or explanations.
Below is the required JSON format example:

[
  {
    "person": "name or unknown",
    "objects": [
      {
        "name": "object name",
        "properties": {
          "color": "color",
          "category": "category",
          "brand": "brand",
          "extra" : "extra"
        }
      }
    ]
  }
]

Analyze the received image that contains bounding boxes and labels. Use the person’s bounding box label as their name (or "unknown" if not provided) and associate any object that is carried by or clearly belong to that person(except the clothing worn by that person). If an object isn't clearly linked to any person, list it under "unknown".
Output *ONLY* the JSON as specified above, enclosed in triple backticks starting with ```json
"""

    # API request to Groq using the Llama Vision model
    response = client.chat.completions.create(
        model="llama-3.2-90b-vision-preview",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        max_tokens=1024
    )

    # Extract the content from the response and parse the JSON output.
    content = response.choices[0].message.content
    json_output = extract_json(content)

    # If JSON extraction fails, return error details in a controlled JSON structure.
    if json_output is None:
        return json.dumps([{
            "error": "Could not decode JSON",
            "content": content
        }], indent=2)

    return json.dumps(json_output, indent=2)

