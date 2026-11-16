questions =["what is js","who is pm of india","who is elon musk","what is bigbang theory" ]
ans =["javascript","NDD modi","world's richest person","space related thm"]
money =[100,1000,10000,100000]

prize = 0
i =0
while(i<4):
    print(questions[i])
    answar=input("give me the ans: ")
    if (answar==ans[i]):
        prize = prize + money[i]
    else:
        break
    i = i+ 1
print( "your prize money is",prize)