import re

def clean_chat_markdown(text: str) -> str:
    """
    Preprocesses and cleans the LLM chat response text by stripping markdown symbols
    such as bold (**), italic (*), headers (#), and bullet symbols so it can be 
    displayed as plain, clean text in the frontend.
    """
    if not text:
        return ""
        
    # Remove bold markers (**bold** -> bold)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    
    # Remove italic markers (*italic* or _italic_ -> italic)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'__([^_]+)__', r'\1', text)
    text = re.sub(r'_([^_]+)_', r'\1', text)
    
    # Remove header markings at the start of any line (e.g. ### Header -> Header)
    text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)
    
    # Optional: Clean up bullet list markers at the start of any line (e.g. - item -> item)
    # text = re.sub(r'^[-*•]\s+', '', text, flags=re.MULTILINE)
    
    return text.strip()
