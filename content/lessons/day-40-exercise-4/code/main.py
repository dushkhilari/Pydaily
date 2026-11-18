# Write a python program to translate a message into secret code language. Use the rules below to translate normal English into secret code language

# Coding:
# if the word contains atleast 3 characters, remove the first letter and append it at the end
#   now append three random characters at the starting and the end
# else:
#   simply reverse the string

# Decoding:
# if the word contains less than 3 characters, reverse it
# else:
#   remove 3 random characters from start and end. Now remove the last letter and append it to the beginning

# Your program should ask whether you want to code or decode
import random
import string
msg = (input("Typing here ... "))
print(msg)
#coding the msg
msg = msg.split(" ") 
final_msg=""
for words in msg:
   if(len(words)<=2):
      p = list(msg)
      p.reverse()
      random_start=''.join(random.choices(string.ascii_letters,k=3))
      random_end=''.join(random.choices(string.ascii_letters,k=3))
      original=''.join(p)
      sent_msg= random_start + original + random_end
      # print(f"sent coded msg is {sent_msg}")
   elif(len(words)>2):
      p = list(words)
      p.append(p[0])
      p.pop(0)
      # print(p)
      random_start=''.join(random.choices(string.ascii_letters,k=3))
      random_end=''.join(random.choices(string.ascii_letters,k=3))
      original=''.join(p)
      sent_msg= random_start + original + random_end
   final_msg= final_msg + " " + sent_msg

print(f"sent coded msg is {final_msg}")

#decoding the msg
final_msg2=""
final_msg=final_msg.split(" ")
for word in final_msg :
  if(len(word)<=8):
     word=word[3:-3]
     p = list(word)
     p.reverse()
     final_msg = "".join(p)

  elif(len(word)>8):
     word=word[3:-3]
     p = list(word)
     p.insert(0,p[-1])
     p.pop(-1)
     final_msg=''.join(p)
     final_msg2= final_msg2 + " " + word

print(f"sent decoded msg is {final_msg2}")