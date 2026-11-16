# class Shape:
#   def __init__(self, x, y):
#     self.x = x
#     self.y = y
    
#   def area(self):
#       return self.x * self.y

# class Circle(Shape):
#     def __init__(self, radius):
#       self.radius = radius
#       super().__init__(radius, radius)

#     def area(self):
#         return 3.14 *  super().area()
      
# # rec = Shape(3, 5)
# # print(rec.area())

# c = Circle(5)
# print(c.area())


class Employee:
    def __init__(self,name,age,company):
        self.name=name
        self.age=age
        self.company=company
    def salary(self,Workingday):
        return 1000*Workingday


class ceo(Employee):
    def salary(self, Workingday):
        return 5*super().salary(Workingday)
    

e=Employee("dush",20,"apple")
print(e.salary(25))
ceo_obj = ceo("dushmanta",20,"apple01")
print(ceo_obj.salary(25))

    

        