import time
# timestamp = time.strftime('%H:%M:%S')
# print(timestamp)
hour = time.strftime('%H')
# print(hour)
# minute = time.strftime('%M')
# print(minute)
# second = time.strftime('%S')
# print(second)
# https://docs.python.org/3/library/time.html#time.strftime

if(int(hour) < 12):
    if(int(hour) > 4):
        print("good morning")
    elif(int(hour)> 0):
        print("good mid-night ")
elif(int(hour)<20):
    if (int(hour)<18):
        print("good afternoon")
    else:
        print("good evening")
else:
    print("good night ")
