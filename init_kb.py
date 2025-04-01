import os
import json

# Create the knowledge base directory
kb_dir = "knowledge_base"
if os.path.exists(kb_dir):

    for file in os.listdir(kb_dir):
        if file.endswith('.json'):
            os.remove(os.path.join(kb_dir, file))
else:
    os.makedirs(kb_dir)

# Create general.json with main task description
general = {
    "description": "Analyze only bounded objects and persons in image, exclude all other and associate them with detected persons if it belongs to persons."
}

# Create instructions.json with detailed sections 
instructions = {
    "Input Context": "- Use only the provided bounding boxes and labels for analysis. Do not infer, assume, or estimate details that are not explicitly visible.\n- The person's name must be extracted from the bounding box label which will be a ID like CEK21CS... If the person is labeled \"unknown\" or is unrecognized, use \"unknown\".",
    
    "Object Association Rules": "- An object belongs to a person if it is carried, held, worn (except clothing), or positioned clearly with them.\n- If an object is not clearly associated with any identified person, it should be assigned to \"unknown\".",
    
    "Object Detection Criteria": "- Identify and categorize objects only within the following predefined categories:\n  - Electronics (cell phone, laptop, keyboard, remote, mouse)\n  - Accessories (handbag, umbrella, backpack, suitcase, tie)\n  - Sports Equipment (tennis racket, sports ball)\n  - Stationery (book, scissors)\n  - miscellaneous (water bottle, cup, bowl)\n- Ignore any object outside these categories.",
    
    "Object Analysis & Description": "For each detected object, extract and report the following properties:\n1. Name (e.g., laptop, backpack, water bottle)\n2. Color (if distinguishable, use standard colors -  Black, White, Gray, Red, Blue, Green, Yellow, Gold, Multicolor or No Color )\n3. Category (Electronics, Accessories, Sports, Stationery, other.)\n4. Brand (if a recognizable brand label is visible)\n5. Extra Description (only visible distinguishing features such as):\n   - Scratches, dents, stickers, labels, engravings, custom markings, unique patterns, or other identifiable features.\n   - Do not assume dimensions (e.g., weight, size) unless a label explicitly states them.",
    
    "Constraints & Additional Rules": "- Do not include clothing in the object list.\n- Strictly adhere to JSON format—no extra text, summaries, or explanations.\n- Only analyze objects that have a bounding box and a label in the image.\n- If multiple people and objects are detected, each person should be listed separately with their associated objects."
}

# Create schemas.json - with exact structure from prompt
schemas = {
    "schema": [
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
}

# Create examples.json 
examples = {
    "examples": [
        # Example 1
        [
            {
                "person": "CEK21CS047",
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
                            "category": "miscellaneous",
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
                            "category": "accessory",
                            "brand": "Nike",
                            "extra": "A large black backpack with a red zipper."
                        }
                    }
                ]
            }
        ],
        # Example 2
        [
            {
                "person": "CEK21CS014",
                "objects": [
                    {
                        "name": "cell phone",
                        "properties": {
                            "color": "black",
                            "category": "electronics",
                            "brand": "Samsung",
                            "extra": "A Galaxy smartphone with a red case."
                        }
                    },
                    {
                        "name": "book",
                        "properties": {
                            "color": "green",
                            "category": "stationery",
                            "brand": "unknown",
                            "extra": "A book titled 'Atomic Habits' from author James Clear."
                        }
                    }
                ]
            },
            {
                "person": "unknown",
                "objects": [
                    {
                        "name": "umbrella",
                        "properties": {
                            "color": "black",
                            "category": "accessory",
                            "brand": "unknown",
                            "extra": "A foldable umbrella with a broken handle and a university logo printed on the fabric."
                        }
                    }
                ]
            }
        ],
        # Example 3
        [
            {
                "person": "CEK21CS025",
                "objects": [
                    {
                        "name": "laptop",
                        "properties": {
                            "color": "gray",
                            "category": "electronics",
                            "brand": "Dell",
                            "extra": "A Dell laptop with an Intel sticker and a scratched bottom panel."
                        }
                    },
                    {
                        "name": "backpack",
                        "properties": {
                            "color": "red",
                            "category": "accessory",
                            "brand": "Adidas",
                            "extra": "A medium-sized backpack with a front pocket and a torn zipper."
                        }
                    }
                ]
            }
        ]
    ]
}

# Save all files
with open(os.path.join(kb_dir, "general.json"), "w") as f:
    json.dump(general, f, indent=2)

with open(os.path.join(kb_dir, "instructions.json"), "w") as f:
    json.dump(instructions, f, indent=2)

with open(os.path.join(kb_dir, "schemas.json"), "w") as f:
    json.dump(schemas, f, indent=2)

with open(os.path.join(kb_dir, "examples.json"), "w") as f:
    json.dump(examples, f, indent=2)

print("Knowledge base files created successfully with your updated prompt!")