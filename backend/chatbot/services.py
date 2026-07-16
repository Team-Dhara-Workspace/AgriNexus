import os 
# pyrefly: ignore [missing-import]
from langchain_community.document_loaders import PyPDFLoader
# pyrefly: ignore [missing-import]
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pathlib import Path

### For Embedding and Vector DB 
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Any

# pyrefly: ignore [missing-import]
import chromadb
# pyrefly: ignore [missing-import]
from chromadb.config import Settings
import uuid 
from typing import List , Dict , Any , Tuple


from urllib3 import response
from torch.cuda import temperature
from typing import List , Dict , Any


def process_all_Pdfs(pdf_directory):

    all_documents=[]
    pdf_dir = Path(pdf_directory)

    pdf_files = list(pdf_dir.glob("**/*.pdf"))
    print(f"Found {len(pdf_files)}")

    for file in pdf_files:
        print(f"Processing {file.name} ")
        try:
            loader = PyPDFLoader(str(file))
            docs = loader.load()

            for doc in docs: 
                doc.metadata['source_file']=file.name
                doc.metadata['file_type']='pdf'

            all_documents.extend(docs)
            print(f"Loaded {len(docs)} Pages")
        except Exception as e:
            print(e)
    
    # print(f"\nTotal Documents Loaded {len(pdf_files)}")
    print(f"\nTotal Documents Loaded: {len(all_documents)}")
    return all_documents

### Chunking docs to smaller docs

def split_documents(documents,chunk_size=400,chunk_overlap=50):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        # separators=["/n/n","/n"," ",""]
        separators=["\n\n","\n"," ",""]
    )

    split_docs = text_splitter.split_documents(documents)
    print(f"Splited {len(documents)} files into {len(split_docs)} chunks")

    return split_docs





### Embedding Manager Class ( Generate embeddings for plain text ) BAAI/bge-small-en-v1.5
class EmbeddingManager:

    def __init__(self, model_name:str="all-MiniLM-L6-v2"):

        self.model_name = model_name
        self.model = None 
        self._load_model()

    def _load_model(self):

        try:
            print(f"Loading Embedding Model:{self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            print(f"Model Loaded Successfully. Embedding Dimension: {self.model.get_sentence_embedding_dimension()}")
        except Exception as e:
            print(f"Error Loading Model {self.model_name} : {e}")            
            raise 

    def generate_embeddings(self,texts: List[str],batch_size: int = 256) -> np.ndarray:

        if not self.model:
            raise ValueError("Model Not Loaded")

        print(f"Generating embeddings for {len(texts)} texts")

        all_embeddings = []

        for start_idx in range(0, len(texts), batch_size):

            batch_texts = texts[start_idx:start_idx + batch_size]

            batch_embeddings = self.model.encode(
                batch_texts,
                normalize_embeddings=True,
                show_progress_bar=False
            )

            all_embeddings.append(batch_embeddings)

            print(
                f"Processed "
                f"{min(start_idx + batch_size, len(texts))}"
                f"/{len(texts)} texts"
            )

        embeddings = np.vstack(all_embeddings)

        print(
            f"Generated embeddings with shape: "
            f"{embeddings.shape}"
        )

        return embeddings


### Vector Store initializing and adding documents
class VectorStore:

    def __init__(self, collection_name: str = "pdf_documents", persist_directory: str = None):

        self.collection_name = collection_name
        if persist_directory is None:
            # Resolve relative to the location of this file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            self.persist_directory = os.path.abspath(os.path.join(current_dir, "..", "db", "vector_store"))
        else:
            self.persist_directory = persist_directory
        self.client = None 
        self.collection = None 
        self._initialize_store()

    def _initialize_store(self):

        try:
            os.makedirs(self.persist_directory, exist_ok=True)
            self.client = chromadb.PersistentClient(path=self.persist_directory)

            # self.collection = self.client.get_or_create_collection(
            #     name=self.collection_name,
            #     metadata={"description":"PDF Document embeddings for RAG"}
            # )

            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )

            print(f"Vector store initialized. Collection: {self.collection_name}")
            print(f"Existing Document in Collection : {self.collection.count}")

        except Exception as e:
            print(f"Error initializing Vector Store : {e}");
            raise

    def add_documents(self, documents: List[Any] , embeddings : np.ndarray):

        if len(documents) != len(embeddings):
            raise ValueError("Number of documents must match number of embeddings")
        print(f"Adding {len(documents)} documents to vector store... ")

        ids=[]
        metadatas = []
        documents_text = []
        embeddings_list = []

        for i,(doc,embedding) in enumerate(zip(documents,embeddings)):

            doc_id = f"doc_{uuid.uuid4().hex[:8]}_{i}"
            ids.append(doc_id)

            metadata = dict(doc.metadata)
            metadata['doc_index']=i
            metadata['context_length']=len(doc.page_content)
            metadatas.append(metadata)

            documents_text.append(doc.page_content)
            embeddings_list.append(embedding.tolist())

        try:
            self.collection.add(
                ids=ids,
                embeddings=embeddings_list,
                metadatas=metadatas,
                documents=documents_text
            )
            print(f"successfull added {len(documents)} documents to vector store")
            print(f"Total Documents in collection {self.collection.count()}")

        except Exception as e:
            print(f"Error adding value to vector store : {e}")
            raise

def ingest_pipeline():

    all_pdf_document = process_all_Pdfs("data/pdfs")
    chunks = split_documents(all_pdf_document)

    embedding_manager = EmbeddingManager()
    vectorstore = VectorStore()

    texts = [doc.page_content for doc in chunks]
    embeddings = embedding_manager.generate_embeddings(
        texts,
        batch_size=256
    )

    vectorstore.add_documents(chunks, embeddings)
  

class RAGRetriver:

    def __init__(self,vector_store:VectorStore,embedding_manager:EmbeddingManager):

        self.vector_store=vector_store
        self.embedding_manager = embedding_manager
    
    def retrieve(self, query:str , top_k : int=5,score_threshold:float=0.0) -> List[Dict[str,Any]]:

        print(f"Retrieving documents for query: {query} ")
        print(f"Top K : {top_k}, Score Threshold: {score_threshold}")

        query_embedding = self.embedding_manager.generate_embeddings([query])[0]

        try:
            results = self.vector_store.collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=top_k
            )

            retrived_docs = []

            if results['documents'] and results['documents'][0]:
                documents = results['documents'][0]
                metadatas = results['metadatas'][0]
                distances = results['distances'][0]
                ids = results['ids'][0]

                for i,(doc_id,document,metadata,distance) in enumerate(zip(ids,documents,metadatas,distances)):

                    similarity_score = 1 - distance

                    if similarity_score >= score_threshold:
                        retrived_docs.append({
                            'id':doc_id,
                            'content':document,
                            'metadata':metadata,
                            'similarity_score':similarity_score,
                            'distance':distance,
                            'rank': i+1
                        })
                    
                print(f"Retrived {len(retrived_docs)} documents ( after filtering )")
            else:
                print("No Documents Found")

            return retrived_docs
        
        except Exception as e:
            print(f"Error During Retrival : {e}")
            return []

