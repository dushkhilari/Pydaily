info = {
  'name':'Dush', 
  'age':20, 
  'eligible':True,
  'gotra':'NandaGopala'
  }
# print(info["name"])
# print(info.get('name'))# not give error --> return none if not exist 

# print(info) 
# print(info.keys())
# print(info.values())

# for key in info.keys():
#   print(f"{key} is {info[key]}")

print(info.items())
for key1, value1 in info.items():
  print(f"{key1} is {value1}") 
  