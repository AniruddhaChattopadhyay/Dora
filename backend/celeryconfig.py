import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

broker_url = "redis://localhost:6379/0"
result_backend = "redis://localhost:6379/0"
include = ["tasks"]
