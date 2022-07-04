import json
import psutil
 
def getData():
    # Some values for gpu and cpu needs to be changed to your specific card.
    data = {
        'cores': psutil.cpu_count(),
        'cpuLoad': psutil.cpu_percent(1),
        'freeMem': psutil.disk_usage('/').percent,
        'freeDisk': psutil.disk_usage('/').percent,
        'cpuTemp': psutil.sensors_temperatures()['acpitz'][0].current,
        'gpuTemp': psutil.sensors_temperatures()['pch_skylake'][0].current
    }
    
    return json.dumps(data)