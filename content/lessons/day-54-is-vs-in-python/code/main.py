a = None
b = None

print(a is b) # exact location of object in memory
print(a is None) # exact location of object in memory
print(a == b) # value

p=(1,3)
q=(1,3)
print(p is q) #immutable cheez same location mein hota hai toh true 
print(p == q)