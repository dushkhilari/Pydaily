def welcome():
  print("Hey you are welcome from harry")

print(__name__)  #if __name__ = main ,then it is run real file 
                   #if __name__ = filename,then imported from anything other file or module 

if __name__ == "__main__":
  welcome()