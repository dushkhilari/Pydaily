#                 S W G
# computer =      0 1 2
# player =  S  0  D W L
#           W  1  L D W
#           G  2  W L D
import random
d = 0
w = 1
l = 2
gameRule = [[d,w,l],[l,d,w],[w,l,d]]
computer = random.choice([0,1,2])
# print(computer)
print("Choose your's:(0)snack,(1)water,(2)gun")
player=int(input())
if gameRule[computer][player] == 0:
    print("game is draw")
if gameRule[computer][player] == 1:
    print("You won")
if gameRule[computer][player] == 2:
    print("You loss")

   