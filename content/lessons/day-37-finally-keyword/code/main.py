def func1():
  try:
    l = [1, 5, 6, 7]
    i = int(input("Enter the index: "))
    print(l[i])
    return 1
  except:
    print("Some error occurred")
    return 0

  finally:
    print("I am always executed")#after fn is return then also this line execute
# print("I am always executed")##this can not execute if fn is return before it 


x = func1()
print(x)
