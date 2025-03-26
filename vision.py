import os
import base64
import json
import argparse
from datetime import datetime
from mistralai import Mistral
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
from output_manager import output_manager

# Load environment variables from .env file
load_dotenv()

# Initialize Mistral client
client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

# Initialize knowledge base
from knowledge_base import KnowledgeBase
kb = KnowledgeBase()

def log_request(data: Dict[str, Any], is_error=False):
    """Log request details using the output manager."""
    if is_error:
        output_manager.log_error("API request failed", data.get("exception", None))
    else:
        output_manager.log_api_request(data)

def encode_image(image_path: str) -> str:
    """Encode an image to Base64 format."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def analyze_image(image_path: str, snapshot_id: int = None, prompt_components: List[str] = None, debug: bool = False) -> tuple:
    """
    Analyze the image using Mistral's API with RAG-enhanced prompting.
    
    Args:
        image_path: Path to the image file
        snapshot_id: ID of the snapshot being analyzed (for organized output)
        prompt_components: List of knowledge base components to include
        debug: Whether to save the prompt for debugging
        
    Returns:
        Tuple of (parsed_json_content, output_file)
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"The file '{image_path}' does not exist.")

    # Encode the image
    base64_image = encode_image(image_path)
    
    # Build prompt from knowledge base
    prompt = kb.build_prompt(prompt_components)
    
    # Save prompt for debugging if requested
    if debug:
        debug_prompt_file = os.path.join(output_manager.dirs["logs"], "last_prompt.txt")
        with open(debug_prompt_file, "w") as f:
            f.write(prompt)

    # Call Mistral API
    try:
        messages = [
            {"role": "user", "content": [{"type": "text", "text": prompt},
                                        {"type": "image_url", "image_url": f"data:image/jpeg;base64,{base64_image}"}]}
        ]

        start_time = datetime.now()
        response = client.chat.complete(
            model="pixtral-12b-2409",
            messages=messages,
            max_tokens=5000,
            response_format={"type": "json_object"}  #Request structured JSON directly
        )
        end_time = datetime.now()
        response_time_ms = (end_time - start_time).total_seconds() * 1000

        # Extract response data - will be valid JSON with response_format set
        content = response.choices[0].message.content
        
        # Parse the JSON content
        parsed_json = json.loads(content)
        
        # Format for output file
        formatted_content = json.dumps(parsed_json, indent=4)
            
        # Log request details
        log_data = {
            "timestamp": str(datetime.now()),
            "input_image": image_path,
            "input_size_bytes": len(base64_image),
            "output_size_bytes": len(formatted_content),
            "model_used": response.model,
            "prompt_components": prompt_components,
            "response_time_ms": response_time_ms,
        }
        log_request(log_data)

        # Save output to a file in the organized directory
        if snapshot_id is not None:
            output_file = output_manager.get_analysis_path(snapshot_id)
        else:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = os.path.join(output_manager.dirs["analysis"], f"analysis_{timestamp}.json")
        
        with open(output_file, "w") as f:
            f.write(formatted_content)

        return parsed_json, output_file

    except Exception as e:
        log_data = {"error": "API request failed", "exception": str(e)}
        log_request(log_data, is_error=True)
        raise

def main():
    parser = argparse.ArgumentParser(description="Image Analysis with RAG")
    parser.add_argument("--image", "-i", required=True, help="Path to the image file")
    parser.add_argument("--components", "-c", nargs="+", default=None, 
                       help="Knowledge base components to include in prompt")
    parser.add_argument("--debug", "-d", action="store_true", 
                       help="Save the generated prompt for debugging")
    
    args = parser.parse_args()
    
    try:
        output_manager.log_system(f"Analyzing image: {args.image}")
        result, output_file = analyze_image(
            args.image, 
            prompt_components=args.components,
            debug=args.debug
        )
        output_manager.log_system(f"Analysis complete! Results saved to {output_file}")
        print(f"Analysis complete! Results saved to {output_file}")
        
    except Exception as e:
        output_manager.log_error(f"Error analyzing image {args.image}", e)
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()