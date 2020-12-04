from datetime import datetime
from flask import Flask
from flask_cors import CORS
from flask_sse import sse
from apscheduler.schedulers.background import BackgroundScheduler
from time import sleep

# Configurations
config = dict(
		server_frequency = 5,
		server_address = '0.0.0.0',
		server_port = 5000,
		server_name = 'Server X',
		reddis_address= 'redis://redis',
		sse_url= '/stream'
	)

app = Flask(config['server_name'])

# Make app cross origin compatible
CORS(app)

# Configure redis address
app.config["REDIS_URL"] = config['reddis_address']
# Configure sse url
app.register_blueprint(sse, url_prefix=config['sse_url'])

"""
:param param: string
:return: string
"""
def stream():
    with app.app_context():
        now = datetime.now()
        sse.publish({
        		'time': {
        			'second': now.strftime('%S'),
        			'minute': now.strftime('%M'),
        			'hour': now.strftime('%I'),
        			'time': now.strftime('%p')
        		},
        		'server': {
        			'frequency': config['server_frequency'],
        			'name': config['server_name']
        		}

        	}, 
            type='message',
            retry=config['server_frequency'])

@app.route('/start-stream')
def start_stream():
    sched = BackgroundScheduler(daemon=True)
    sched.add_job(stream, 
                  'interval', 
                  seconds=config['server_frequency'],
                  replace_existing=True,
                  max_instances=1,
                  id="eventsource",
                  )
    sched.start()
    return "stream started"

if __name__ == '__main__':
   app.run(debug=True,host=config['server_address'], port=config['server_port'])