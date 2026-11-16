class Employee:
  def __init__(self, name, id):
    self.name = name
    self.id = id 

  def showDetails(self):
    print(f"The name of Employee: {self.id} is {self.name}")

class Programmer(Employee):
  def showLanguage(self):
    print("The default langauge is Python")

class VideoEditor(Programmer):
  def editingSofware(self):
    print("davinci,afterEfect,capcut,blender")


e1 = Employee("Rohan Das", 400)
e1.showDetails()
e2 = VideoEditor("Harry", 4100)
e2.showDetails()
e2.showLanguage()
e2.editingSofware()