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

# TODO: Needs a table and routes - multiselect
class FastenerType(str, Enum):
    NAIL = "Nail"
    SCREW = "Screw"
    BOLT = "Bolt"
    # TODO: Add more fastener types as needed

# TODO: Could be multiple options
class LoadingDirection(str, Enum):
    INPLANESHEAR = "In-Plane Shear"
    OUTPLANESHEAR = "Out-of-Plane Shear"
    INPLANETENSION = "In-Plane Tension"
    OUTPLANETENSION = "Out-of-Plane Tension"

# TODO: Dowel Only!
class Reinforcement(str, Enum):
    NONE = "None"
    STRAP = "Strap"
    BLOCKING = "Blocking"
    # TODO: Add more reinforcement types as needed

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