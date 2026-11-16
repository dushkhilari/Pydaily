class library:
    books=[]
    no_of_books=0
    

    def __init__(self,books):
         self.books.append(books)
         self.no_of_books=self.no_of_books + len(self.books)
    

    def show(self):
         return print(f"Total {self.no_of_books} books are {self.books}")
    
    # @property
    # def show(self):
    #      return print(f"Total {self.no_of_books} books are {self.books}")
    
    
    # @show.setter
    # def recieve_book(self,books):
    #      self.books=books

my_library=library("vantara,encyclopedia")
# your_books = library("atomic habit")
# your_books = library("HarryPorter")
my_library.show()
# your_books.show()
         
