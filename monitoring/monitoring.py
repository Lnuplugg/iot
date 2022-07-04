from py import getData
import serial, time

ser = serial.Serial('/dev/ttyUSB0', 115200, timeout=1)

while True:
     #print(getData())
     time.sleep(10)
     # linux line ending. alternative: \r\n
     ser.write(str.encode(getData() + '\r'))
     