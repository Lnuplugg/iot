import dht
from machine import Pin
import urequests
import time
import sys


def do_connect():
    import network
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print('connecting to network...')
        wlan.connect('***SSID*', '**Password**')
        while not wlan.isconnected():
            pass
    print('network config:', wlan.ifconfig())    

do_connect()
print("starting")

relay = Pin(21, Pin.OUT)
sensor = dht.DHT11(Pin(33))

# Get temp from DHT11 sensor
def getTemp():
    while True:
        try:
            time.sleep(10)
            sensor.measure()
            temp = sensor.temperature()
            hum = sensor.humidity()
            tempF = temp * (9/5) + 32.0
            
            return { "tempC": temp, "tempF": tempF, "humidity": hum }
        except OSError as e:
            print("Cant read:", e)
            sys.print_exception(e)

# Sedns a power on / shutdown pulse
def relayOnOff():
    # RELAY ON
    relay.value(1)
    time.sleep(1)
    # RELAY ON
    relay.value(0)
    
# Not yet implemented
def hardShutdown():
    # RELAY ON
    relay.value(1)
    time.sleep(4)
    # RELAY ON
    relay.value(0)    

# main loop
def monitor():
    while True:
        time.sleep(10)
        msg = sys.stdin.readline()
         
        if msg is not None:
            # Credentials should be changed in the portal respectively.
            body = {"email": "test@test.com", "password": "test", "data": msg, "dht": getTemp()}

            # Using https:// might not work.
            res = urequests.post("**NGROK-URL**/login", json = body)
            
            json = res.json()
            
            if 'powerstate' in json:
                state = json.get('powerstate')
                if state == 'shutdown' or state == 'poweron':
                    relayOnOff()
                elif state == 'hardshutdown':
                    # Not yet implemented
                    hardShutdown()
    
monitor()