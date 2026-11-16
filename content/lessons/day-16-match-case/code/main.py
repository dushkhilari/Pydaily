
# here break is by default
x = int(input("Enter the value of x: "))
# x is the variable to match
match x:
    # if x is 0
    case 0:
        print("x is zero")
    # case with if-condition
    case 4:
        print("case is 4")

    case _ if x!=90:# here there 3 codndition of default case
        print(x, "is not 90")
    case _ if x!=80:
        print(x, "is not 80")
    case _: #default
        print(x)