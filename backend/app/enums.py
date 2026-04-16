from enum import Enum

# NOTE:
# These enums are currently hardcoded using Python's Enum class, which means the available options are fixed at the code level.
# If you ever want these choices (e.g., AssemblyType, JoineryType, etc.) to be editable by an admin from the frontend,
# you'll need to convert them into proper reference tables (e.g., AssemblyType table), create corresponding SQLModel classes,
# and expose CRUD API routes (e.g., /reference/assembly-types/) to allow adding, editing, and deleting values dynamically.
# This approach makes the system more flexible but adds schema + routing overhead.

class AssemblyType(str, Enum):
    WALLFLOOR = "Wall-Floor"
    WALLWALL = "Wall-Wall"
    WALLWALLFLOOR = "Wall-Floor & Wall-Wall" # Page 11/24, Figure 4 of "Methodology: Database Developed for CLT Shearwall Connections" suggests a third category

class TestLoadingType(str, Enum):
    CYCLIC = "Cyclic"
    MONOTONIC = "Monotonic"
    MONOTONICANDCYCLIC = "Monotonic and Cyclic"

class YieldPointMethod(str, Enum):
    CEN16 = "CEN 1/6"
    EEEP = "EEEP"

class Practice(str, Enum):
    CONVENTIONAL = "Conventional"
    RESEARCHANDDEVELOPMENT = "Research and Development"

class FailureModeType(str, Enum):
    WOOD = "WOOD"
    DOWEL = "DOWEL"
    CONNECTOR = "CONNECTOR"
    OTHER = "OTHER"   # e.g. "Bending"

class PendingStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"