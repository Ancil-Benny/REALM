import os
import json
from typing import Dict, List, Any, Optional

class KnowledgeBase:
    def __init__(self, kb_directory: str = "knowledge_base"):
        self.kb_directory = kb_directory
        if not os.path.exists(kb_directory):
            os.makedirs(kb_directory)
        self._load_documents()
    
    def _load_documents(self):
        """Load all documents from the knowledge base directory."""
        self.documents = {}
        if not os.path.exists(self.kb_directory):
            return
            
        for filename in os.listdir(self.kb_directory):
            if filename.endswith('.json'):
                file_path = os.path.join(self.kb_directory, filename)
                try:
                    with open(file_path, 'r') as f:
                        doc_id = filename.replace('.json', '')
                        self.documents[doc_id] = json.load(f)
                except Exception as e:
                    print(f"Error loading {file_path}: {e}")
    
    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a specific document by ID."""
        return self.documents.get(doc_id)
    
    def get_instruction_components(self, component_ids: List[str] = None) -> Dict[str, Any]:
        """
        Build a complete instruction by combining components.
        If no specific components are requested, return all available ones.
        """
        result = {}
        
        # Use specified components or all available if none specified
        if component_ids is None:
            component_ids = list(self.documents.keys())
            
        # Combine requested components
        for doc_id in component_ids:
            if doc_id in self.documents:
                result[doc_id] = self.documents[doc_id]
                
        return result
    
    def add_document(self, doc_id: str, content: Dict[str, Any]) -> bool:
        """Add a new document to the knowledge base."""
        file_path = os.path.join(self.kb_directory, f"{doc_id}.json")
        try:
            with open(file_path, 'w') as f:
                json.dump(content, f, indent=2)
            self.documents[doc_id] = content
            return True
        except Exception as e:
            print(f"Error saving {file_path}: {e}")
            return False
            
    def build_prompt(self, components: List[str] = None) -> str:
        """
        Build a complete prompt by combining selected knowledge base components.
        """
        if components is None:
            components = ["general", "instructions", "schemas", "examples"]
            
        instruction_components = self.get_instruction_components(components)
        
        # Start with header like your prompt
        prompt = """
# IMPORTANT: Your output must be strict JSON.
Do not include any additional text, commentary, or explanations.
"""

        # Add schema section as shown in your prompt
        if "schemas" in instruction_components:
            prompt += "\n## JSON Output Format Example:\n"
            schema_json = json.dumps(instruction_components["schemas"].get("schema", {}), indent=4)
            prompt += schema_json
            prompt += "\n"
        
        # Add general task instructions
        prompt += "\n## Task Instructions:\n"
        if "general" in instruction_components:
            prompt += f"{instruction_components['general'].get('description', '')}\n"
            
        # Add detailed instructions if available
        if "instructions" in instruction_components:
            for section, content in instruction_components["instructions"].items():
                prompt += f"\n### {section}:\n{content}\n"
        
        # Add examples if available
        if "examples" in instruction_components:
            prompt += "\n## Example Output:\n\n"
            for example in instruction_components["examples"].get("examples", []):
                prompt += json.dumps(example, indent=4)
                prompt += "\n\n"
                
        return prompt.strip()