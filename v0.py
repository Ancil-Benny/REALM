from groq import Groq
from ast import literal_eval
import base64
import os
import json
import re

# Initialize Groq client using the API key from the environment variables
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def extract_json(content: str):
    candidate = content.strip()
    # Strategy 1: Attempt direct JSON parsing if the entire content is valid JSON.
    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        pass

    # Strategy 2: Attempt to extract JSON from a code block formatted with triple backticks.
    json_match = re.search(r'``````', content, re.DOTALL | re.IGNORECASE)
    if json_match:
        json_str = json_match.group(1).strip()
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass

    # Strategy 3: Search for any JSON-like structure using curly braces.
    json_candidates = re.findall(r'\{.*\}', content, re.DOTALL)
    for candidate in json_candidates:
        cleaned = candidate.replace('\\"', '"').replace('\\n', '')
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            try:
                return literal_eval(cleaned)
            except (SyntaxError, ValueError):
                continue

    # Strategy 4: Look for prefixed keys such as "Analysis result:" then extract the JSON substring
    prefix_match = re.search(r'Analysis result:\s*({.*)', content, re.DOTALL | re.IGNORECASE)
    if prefix_match:
        json_str = prefix_match.group(1).strip()
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            try:
                return literal_eval(json_str)
            except (SyntaxError, ValueError):
                pass

    # Strategy 5: Brute-force cleanup with unicode escape decoding and remove non-ASCII characters.
    try:
        decoded = bytes(content, "utf-8").decode("unicode_escape")
        decoded = re.sub(r'[^\x00-\x7F]+', '', decoded)
        return json.loads(decoded)
    except json.JSONDecodeError as e:
        print(f"Final JSON parse failed: {e}")
        return None


def analyze_image(image_path):
    """
    Analyze the image to identify bounded objects and associate them with detected persons given if it belong to that person.
    """

    def encode_image(path):
        with open(path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    base64_image = encode_image(image_path)

    prompt = """
# IMPORTANT: Your output must be strict JSON.
Do not include any additional text, commentary, or explanations.

## [JSON Output Format Example:](pplx://action/followup)
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
                    "extra": "description"
                }
            }
        ]
    }
]

## [Task Instructions:](pplx://action/followup)

### [Input Context:](pplx://action/followup)
- Use only the provided bounding boxes and labels for analysis. Do not infer or estimate details not explicitly present.
- Extract the person's name from the bounding box label. If the person is not recognized, the label will be "unknown."

### [Object Association Rules:](pplx://action/followup)
- Associate objects with a person if they are being carried, held, or are clearly positioned with them.
- Objects without a clear association should be listed under "person": "unknown".

### [Object Analysis:](pplx://action/followup)
- Extract visible object properties from the bounding box, including:
  - Color (if distinguishable)
  - Category (Electronics, Accessory, Sports, Stationery, Book, Other)
  - Brand (if a recognizable brand label is visible)
  - Extra Description: Identify distinguishing features such as:
    - Scratches, dents, stickers, labels, engravings, custom markings, unique patterns, or other identifiers.

### [Constraints:](pplx://action/followup)
- Exclude any clothing worn by the person from the object list.
- Do not assume or fabricate details beyond what is explicitly visible.
- Ensure the JSON output strictly adheres to the provided format AND provide output as a 'valid single json array'.
- analyze objects with 'only' bounding boxes and labels provided in the image.
- VERY IMPORTANT: Ensure that the entire output is a single, valid JSON array.  Do not output multiple JSON objects or any text outside of the JSON array.

## [Example Output:](pplx://action/followup)

[
    {
        "person": "John Doe",
        "objects": [
            {
                "name": "laptop",
                "properties": {
                    "color": "silver",
                    "category": "electronics",
                    "brand": "Apple",
                    "extra": "A MacBook Pro with an aluminum design and a cat sticker on the lid."
                }
            },
            {
                "name": "water bottle",
                "properties": {
                    "color": "blue",
                    "category": "accessory",
                    "brand": "unknown",
                    "extra": "A plastic water bottle with a torn label."
                }
            }
        ]
    },
    {
        "person": "unknown",
        "objects": [
            {
                "name": "backpack",
                "properties": {
                    "color": "black",
                    "category": "bag",
                    "brand": "Nike",
                    "extra": "A large black backpack with a red zipper."
                }
            }
        ]
    }
]

"""

    # API request to Groq using the Llama Vision model
    try:
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
            max_tokens=5000
        )
        content = response.choices[0].message.content
    except Exception as e:
        print(f"Error during initial Llama Vision API call: {e}")
        return json.dumps([{"error": f"Llama Vision API error: {e}"}], indent=2)

    json_output = extract_json(content)

    # If JSON extraction fails, use Mistral to correct the output with retry logic.
    if json_output is None:
        print("Attempting to correct JSON with Mistral...")
        mistral_correction_attempts = 2  # Number of retry attempts
        for attempt in range(mistral_correction_attempts):
            print(f"Mistral correction attempt: {attempt + 1}")
            correction_prompt = f"""
            You are a JSON correction expert. The following text is a malformed JSON string that needs to be corrected.  The JSON represents image analysis data, and you *must* ensure the output adheres to the following structure:

            - The output MUST be a single, valid JSON array.
            - Each element in the array represents a person and MUST have a "person" field (string) and an "objects" field (array).
            - The "person" field should contain the name of the person or "unknown".
            - The "objects" field should be an array of objects, each representing a detected object associated with the person.
            - Each object in the "objects" array MUST have a "name" field (string) and a "properties" field (object).
            - The "properties" field MUST have "color" (string), "category" (string), "brand" (string), and "extra" (string) fields.

            Here is an example of the correct JSON structure:

            [
                {{
                    "person": "John Doe",
                    "objects": [
                        {{
                            "name": "laptop",
                            "properties": {{
                                "color": "silver",
                                "category": "electronics",
                                "brand": "Apple",
                                "extra": "A MacBook Pro with an aluminum design and a cat sticker on the lid."
                            }}
                        }},
                        {{
                            "name": "water bottle",
                            "properties": {{
                                "color": "blue",
                                "category": "accessory",
                                "brand": "unknown",
                                "extra": "A plastic water bottle with a torn label."
                            }}
                        }}
                    ]
                }},
                {{
                    "person": "unknown",
                    "objects": [
                        {{
                            "name": "backpack",
                            "properties": {{
                                "color": "black",
                                "category": "bag",
                                "brand": "Nike",
                                "extra": "A large black backpack with a red zipper."
                            }}
                        }}
                    ]
                }}
            ]

            correct the following malformed JSON string to match the above format. Return ONLY the corrected JSON, without any additional text or explanations:

            {content}
            """
            try:
                mistral_response = client.chat.completions.create(
                    model="mistral-large-2402",  # Or another suitable Mistral model
                    messages=[{"role": "user", "content": correction_prompt}],
                    max_tokens=5000
                )
                corrected_content = mistral_response.choices[0].message.content
                json_output = extract_json(corrected_content)

                if json_output is not None:
                    print("JSON corrected by Mistral successfully!")
                    return json.dumps(json_output, indent=2)
                else:
                    print(f"Mistral could not correct the JSON on attempt {attempt + 1}.")

            except Exception as e:
                print(f"Error during Mistral correction API call on attempt {attempt + 1}: {e}")
                if attempt == mistral_correction_attempts - 1:
                    return json.dumps([{"error": f"Mistral correction API error after multiple retries: {e}",
                                         "original_content": content}], indent=2)
        # If all Mistral correction attempts fail
        return json.dumps([{"error": "Mistral could not correct JSON after multiple retries",
                             "original_content": content}], indent=2)

    return json.dumps(json_output, indent=2)