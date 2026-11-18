# A virtual environment is its own folder with its own interpreter.
# These helpers tell you WHICH python you are running right now.

import sys

print("Python version :", sys.version.split()[0])
print("Environment root (sys.prefix):", sys.prefix)

# sys.path is where this interpreter looks for packages
print("\nPackage search paths (sys.path):")
for p in sys.path[:5]:
    print("  -", p)

# Every environment ships the full standard library
import math
import random

print("\nCore modules ready in this environment: math, random, json ...")
print("math.sqrt(144) =", math.sqrt(144))
print("random dice roll =", random.randint(1, 6))
